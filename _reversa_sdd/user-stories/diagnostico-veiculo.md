# User Story: Diagnostico de Veiculo

> Gerada pelo Reversa Writer em 2026-05-03.
> Nivel de documentacao: **detalhado**.

---

## US-004: Receber diagnostico automotivo inicial

**Como** usuario do Vehicle Diagnostic Core,
**quero** receber um diagnostico automotivo inicial apos identificar meu veiculo,
**para que** eu tenha uma orientacao sobre possiveis falhas antes de ir a uma oficina.

### Status de Implementacao

| Camada | Implementado | Evidencia |
|--------|-------------|-----------|
| Regras deterministicas (4 veiculos) | 🟢 Sim | `diagnosticService.ts:6-27` — lookup por marca/modelo |
| Montagem de prompt para LLM | 🟢 Sim | `diagnosticService.ts:29-38` — `buildDiagnosticPrompt()` |
| Diagnostico via LLM com fallback | 🟢 Sim | `diagnosticService.ts:40-49` — `generateDiagnosisWithAI()` |
| Mock LLM adapter | 🟢 Sim | `mockLlmAdapter.ts:7-16` — retorna texto generico |
| LLM real (OpenAI ou similar) | 🔴 Nao | Apenas mock disponivel |
| Exibicao do diagnostico (UI) | 🟢 Sim | `App.tsx:123-126` — diagnostic card |
| Conexao servidor ↔ servico | 🔴 Nao | Rota nao registrada em `server.ts` |

### Criterios de Aceitacao

```gherkin
Cenario: Diagnostico por regras — Toyota Corolla
  Dado um veiculo identificado como Toyota Corolla
  Quando o diagnostico e gerado via generateDiagnosis()
  Entao o texto retornado e "Possivel falha comum em Corolla: bobina de ignicao."

Cenario: Diagnostico por regras — Volkswagen Gol (match parcial)
  Dado um veiculo identificado como Volkswagen "Gol G5 1.0"
  Quando o diagnostico e gerado via generateDiagnosis()
  Entao o match parcial via includes("gol") e acionado
  E o texto retornado menciona "cabos de vela e corpo de borboleta"

Cenario: Diagnostico por regras — Fiat Uno
  Dado um veiculo identificado como Fiat Uno
  Quando o diagnostico e gerado via generateDiagnosis()
  Entao o texto retornado menciona "sujeira no sistema de injecao e falha em velas"

Cenario: Diagnostico por regras — Ford Ranger
  Dado um veiculo identificado como Ford Ranger
  Quando o diagnostico e gerado via generateDiagnosis()
  Entao o texto retornado menciona "bicos injetores, sensor MAF e pressao de combustivel"

Cenario: Diagnostico por regras — veiculo nao mapeado
  Dado um veiculo identificado como Honda Civic
  Quando o diagnostico e gerado via generateDiagnosis()
  Entao o texto retornado e "Recomendamos uma verificacao completa do sistema de ignicao e injecao."

Cenario: Diagnostico via LLM (mock) retorna texto
  Dado o mock LLM adapter ativo
  Quando generateDiagnosisWithAI() e chamado com qualquer veiculo
  Entao o texto retornado contem "Possiveis causas" e "Recomendacoes"
  E o fallback para regras NAO e acionado

Cenario: Diagnostico via LLM — fallback para regras
  Dado um LLM adapter que retorna string vazia
  Quando generateDiagnosisWithAI() e chamado
  Entao o fallback para generateDiagnosis() e acionado
  E o diagnostico retornado segue as regras deterministicas

Cenario: Diagnostico exibido na UI
  Dado que a API retornou dados com diagnostico
  Quando o result card e renderizado
  Entao o diagnostic card exibe o label "Sugestao inicial"
  E o texto do diagnostico e exibido abaixo
```

### Regras de Negocio Vinculadas

- **RN-01** (`api-diagnostic-service`): Comparacao de marca case-insensitive 🟢
- **RN-02** (`api-diagnostic-service`): Match parcial de modelo via `includes()` 🟢
- **RN-03** (`api-diagnostic-service`): Ordem de avaliacao Toyota > VW > Fiat > Ford > generico 🟢
- **RN-04** (`api-diagnostic-service`): LLM vazio → fallback para regras 🟢
- **RN-06** (`api-diagnostic-service`): Prompt com formato fixo de 6 linhas 🟢

---

## US-005: Diagnostico via inteligencia artificial

**Como** operador do Vehicle Diagnostic Core,
**quero** que o sistema utilize um LLM para gerar diagnosticos mais precisos,
**para que** os usuarios recebam orientacoes contextualizadas alem das regras fixas.

### Status de Implementacao

| Elemento | Implementado | Evidencia |
|----------|-------------|-----------|
| Interface `LlmAdapter` | 🟢 Sim | `mockLlmAdapter.ts:3-5` — tipo com metodo `generateDiagnostic` |
| Factory de mock adapter | 🟢 Sim | `mockLlmAdapter.ts:7-16` — `createMockLlmAdapter()` |
| Chamada async ao adapter | 🟢 Sim | `diagnosticService.ts:42` — `await llmAdapter.generateDiagnostic()` |
| Fallback para regras | 🟢 Sim | `diagnosticService.ts:44-46` — check de string vazia |
| Adapter OpenAI real | 🔴 Nao | Apenas mock disponivel |
| Tratamento de excecao do adapter | 🔴 Nao | Sem try/catch em `generateDiagnosisWithAI` |
| Configuracao de adapter via env | 🔴 Nao | Mock hardcoded no import |

### Criterios de Aceitacao

```gherkin
Cenario: LLM adapter recebe prompt estruturado
  Dado um veiculo com brand "Toyota", model "Corolla", year "2020"
  Quando buildDiagnosticPrompt() e chamado
  Entao o prompt contem "Voce e um assistente tecnico automotivo."
  E contem "Marca: Toyota"
  E contem "Modelo: Corolla"
  E contem "Ano: 2020"
  E contem instrucao de formato esperado

Cenario: Troca de adapter sem alterar servico
  Dado um novo adapter que implementa LlmAdapter
  Quando o adapter e injetado em vez do mock
  Entao generateDiagnosisWithAI() funciona sem alteracao
  E o contrato de entrada/saida e mantido

Cenario: Adapter real lanca excecao
  Dado um adapter que rejeita a Promise com erro de rede
  Quando generateDiagnosisWithAI() e chamado
  Entao a excecao propaga sem tratamento (GAP atual)
  E o caller recebe a Promise rejeitada
```

### Arquitetura do Adapter

```
┌──────────────────────┐
│ diagnosticService.ts │
│                      │
│  generateDiagnosis   │◄── regras deterministicas (sync)
│WithAI()              │
│   │                  │
│   ▼                  │
│  llmAdapter          │──► LlmAdapter (interface)
│  .generateDiagnostic │        │
│                      │        ├── createMockLlmAdapter() 🟢 ativo
│  fallback:           │        └── (adapter real)          🔴 nao existe
│  generateDiagnosis() │
└──────────────────────┘
```

### Gaps para LLM Real

| Gap | Descricao | Impacto |
|-----|-----------|---------|
| Sem try/catch | Erro do adapter propaga como 500 | 🔴 Critico em producao |
| Sem timeout | Chamada ao LLM pode travar indefinidamente | 🔴 Risco de disponibilidade |
| Sem factory configuravel | Mock hardcoded — trocar requer alterar import | 🟡 Impede configuracao por env |
| Sem rate limiting | Requests ao LLM sem controle de vazao | 🟡 Risco de custo |
| Sem cache | Mesma placa gera nova chamada ao LLM toda vez | 🟡 Desperdicio de tokens |

---

## US-006: Visualizar resultado completo

**Como** usuario do Vehicle Diagnostic Core,
**quero** ver os dados do veiculo e o diagnostico em um layout claro,
**para que** eu possa entender rapidamente as informacoes retornadas.

### Status de Implementacao

| Elemento UI | Implementado | Evidencia |
|-------------|-------------|-----------|
| Result card container | 🟢 Sim | `App.tsx:102` — `<div className="result-card">` |
| Titulo "Resultado" | 🟢 Sim | `App.tsx:103` — `<h2>Resultado</h2>` |
| Lista de dados (dl/dt/dd) | 🟢 Sim | `App.tsx:104-119` — Placa, Marca, Modelo, Ano |
| Diagnostic card | 🟢 Sim | `App.tsx:121-126` — container separado |
| Label "Sugestao inicial" | 🟢 Sim | `App.tsx:123` — `<p className="diagnostic-label">` |
| Texto do diagnostico | 🟢 Sim | `App.tsx:124` — `{vehicle.diagnostic}` |
| Renderizacao condicional | 🟢 Sim | `App.tsx:101` — `{vehicle ? ... : null}` |

### Criterios de Aceitacao

```gherkin
Cenario: Result card exibe todos os campos
  Dado que a API retornou dados validos
  Quando o result card e renderizado
  Entao exibe Placa, Marca, Modelo e Ano em lista de definicao (dl)
  E cada campo tem label (dt) e valor (dd)

Cenario: Diagnostic card exibe diagnostico
  Dado que a API retornou dados com campo diagnostic
  Quando o result card e renderizado
  Entao o diagnostic card e exibido abaixo dos dados do veiculo
  E o label "Sugestao inicial" e visivel
  E o texto do diagnostico e exibido integralmente

Cenario: Resultado oculto antes da busca
  Dado que nenhuma busca foi realizada
  Entao o result card nao e renderizado
  E o diagnostic card nao e renderizado

Cenario: Resultado oculto durante nova busca
  Dado que um resultado anterior esta exibido
  Quando o usuario inicia nova busca
  Entao o resultado anterior e removido imediatamente
  E o feedback de loading e exibido
```

---

## Mapa de Rastreabilidade

| User Story | Componentes SDD | Arquivos |
|-----------|----------------|----------|
| US-004 | `api-diagnostic-service`, `web-app` | `diagnosticService.ts`, `mockLlmAdapter.ts`, `App.tsx` |
| US-005 | `api-diagnostic-service` | `diagnosticService.ts`, `mockLlmAdapter.ts`, `core/vehicle.ts` |
| US-006 | `web-app` | `App.tsx` |

---

## Funcionalidades Planejadas (Nao Implementadas)

Extraidas do `implementation_plan.md` e `domain.md`. Nao ha codigo para estas features.

| Feature | Descricao | Status |
|---------|-----------|--------|
| Chat interativo de diagnostico | Dialogo com IA para aprofundar diagnostico | 🔴 Nao iniciado |
| Modos de operacao (completo / consulta) | Selecao entre diagnostico amplo e pontual | 🔴 Nao iniciado |
| Shortcuts (Investigar / Codigo falha / Manutencao) | Acoes rapidas no chat | 🔴 Nao iniciado |
| Persona do agente ("Fala [NOME]!...") | Tom coloquial configurado no prompt | 🔴 Nao iniciado |
| Graficos `diagnostic_chart` | Renderizacao de JSON em graficos dinâmicos | 🔴 Nao iniciado |
| Exportacao (Copiar / PDF / WhatsApp) | Compartilhamento de diagnosticos | 🔴 Nao iniciado |

> Estas features sao documentadas aqui para rastreabilidade. Nao ha user stories detalhadas porque nao ha codigo-fonte para validar comportamento.

---
*Gerado pelo Reversa Writer em 2026-05-03*
