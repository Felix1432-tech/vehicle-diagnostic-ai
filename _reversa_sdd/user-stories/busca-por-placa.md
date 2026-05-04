# User Story: Busca de Veiculo por Placa

> Gerada pelo Reversa Writer em 2026-05-03.
> Nivel de documentacao: **detalhado**.

---

## US-001: Identificar veiculo por placa

**Como** usuario do Vehicle Diagnostic Core,
**quero** informar a placa de um veiculo,
**para que** o sistema identifique marca, modelo e ano automaticamente.

### Status de Implementacao

| Camada | Implementado | Evidencia |
|--------|-------------|-----------|
| Input de placa (UI) | 🟢 Sim | `App.tsx:81-89` — input com uppercase automatico |
| Validacao client-side (Zod) | 🟢 Sim | `App.tsx:21` — `safeParse` com schema do shared |
| Request para API | 🟢 Sim | `App.tsx:31-37` — `fetch POST /vehicle/identify` |
| Rota no servidor | 🔴 Nao | `server.ts` — rota nao registrada, retorna 404 |
| Exibicao do resultado | 🟢 Sim | `App.tsx:102-128` — result card com placa/marca/modelo/ano |

### Criterios de Aceitacao

```gherkin
Cenario: Busca com placa formato antigo
  Dado que estou na tela principal
  E o campo de placa esta vazio
  Quando digito "ABC1234" no campo de placa
  E clico em "buscar"
  Entao o sistema valida a placa no client
  E envia POST /vehicle/identify com { plate: "ABC1234" }
  E exibe o result card com placa, marca, modelo e ano

Cenario: Busca com placa formato Mercosul
  Dado que estou na tela principal
  Quando digito "abc1d23" no campo de placa
  Entao o input exibe "ABC1D23" (uppercase automatico)
  Quando clico em "buscar"
  Entao o sistema valida e envia a placa transformada

Cenario: Busca com placa contendo hifen
  Dado que estou na tela principal
  Quando digito "ABC-1234" no campo de placa
  E clico em "buscar"
  Entao o schema Zod remove o hifen antes da validacao
  E a placa enviada a API e "ABC1234"

Cenario: Placa invalida — muito curta
  Dado que estou na tela principal
  Quando digito "AB12" no campo de placa
  E clico em "buscar"
  Entao a mensagem "Placa invalida. Use formato ABC1234 ou ABC1D23" e exibida
  E nenhum request e enviado a API

Cenario: Placa invalida — formato incorreto
  Dado que estou na tela principal
  Quando digito "1234ABC" no campo de placa
  E clico em "buscar"
  Entao a mensagem "Placa invalida. Use formato ABC1234 ou ABC1D23" e exibida
  E nenhum request e enviado a API

Cenario: Campo vazio
  Dado que estou na tela principal
  E o campo de placa esta vazio
  Quando clico em "buscar"
  Entao a validacao falha (min 7 chars)
  E a mensagem de placa invalida e exibida
```

### Regras de Negocio Vinculadas

- **RN-01** (`shared-schemas`): Formato ABC1234 ou ABC1D23, 7-8 caracteres 🟢
- **RN-03** (`shared-schemas`): Transform automatico (remove hifens, uppercase) 🟢
- **RN-01** (`web-app`): Input converte para uppercase em tempo real 🟢
- **RN-02** (`web-app`): Validacao Zod no client antes do request 🟢

---

## US-002: Feedback visual durante a busca

**Como** usuario do Vehicle Diagnostic Core,
**quero** ver indicacao visual de que a busca esta em andamento,
**para que** eu saiba que o sistema esta processando minha solicitacao.

### Status de Implementacao

| Elemento | Implementado | Evidencia |
|----------|-------------|-----------|
| Texto "buscando..." no botao | 🟢 Sim | `App.tsx:93` — condicional no botao |
| Mensagem "Buscando dados do veiculo..." | 🟢 Sim | `App.tsx:96-98` — feedback loading |
| Input disabled durante loading | 🟢 Sim | `App.tsx:89` — `disabled={loading}` |
| Botao disabled durante loading | 🟢 Sim | `App.tsx:92` — `disabled={loading}` |

### Criterios de Aceitacao

```gherkin
Cenario: Indicadores de loading ativados
  Dado que submeti uma busca com placa valida
  Quando o request esta em andamento
  Entao o botao exibe "buscando..." em vez de "buscar"
  E o botao esta desabilitado
  E o input de placa esta desabilitado
  E a mensagem "Buscando dados do veiculo..." e exibida

Cenario: Indicadores de loading desativados apos resposta
  Dado que a busca esta em andamento
  Quando a API responde (sucesso ou erro)
  Entao o botao volta a exibir "buscar"
  E o botao e o input sao reabilitados
  E a mensagem de loading desaparece

Cenario: Loading desativado mesmo em caso de erro de rede
  Dado que a busca esta em andamento
  Quando ocorre um erro de rede (fetch rejeita)
  Entao o loading e desativado via finally
  E os controles sao reabilitados
```

### Regras de Negocio Vinculadas

- **RN-05** (`web-app`): Botao e input disabled durante loading 🟢

---

## US-003: Tratamento de erros na busca

**Como** usuario do Vehicle Diagnostic Core,
**quero** ver mensagens de erro claras quando algo der errado,
**para que** eu saiba o que corrigir ou tentar novamente.

### Status de Implementacao

| Cenario de erro | Implementado | Mensagem exibida |
|----------------|-------------|------------------|
| Placa invalida (client) | 🟢 Sim | "Placa invalida. Use formato ABC1234 ou ABC1D23" |
| API retorna 400 | 🟢 Sim | "Placa invalida. Use formato ABC1234 ou ABC1D23" |
| API retorna erro generico | 🟢 Sim | `payload.message` ou "Nao foi possivel identificar o veiculo." |
| Erro de rede | 🟢 Sim | `error.message` ou "Ocorreu um erro inesperado ao identificar o veiculo." |
| API retorna JSON invalido | 🟢 Sim | "Ocorreu um erro inesperado ao identificar o veiculo." (ZodError capturado) |

### Criterios de Aceitacao

```gherkin
Cenario: Erro HTTP 400 da API
  Dado que submeti uma busca
  Quando a API retorna status 400
  Entao a mensagem "Placa invalida. Use formato ABC1234 ou ABC1D23" e exibida

Cenario: Erro HTTP 500 da API com mensagem
  Dado que submeti uma busca
  Quando a API retorna status 500 com { message: "Erro interno" }
  Entao a mensagem "Erro interno" e exibida

Cenario: Erro HTTP 500 da API sem corpo JSON
  Dado que submeti uma busca
  Quando a API retorna status 500 sem corpo JSON valido
  Entao a mensagem "Nao foi possivel identificar o veiculo." e exibida

Cenario: Servidor inacessivel
  Dado que submeti uma busca
  Quando o fetch rejeita por erro de rede
  Entao a mensagem do erro e exibida
  E o loading e desativado

Cenario: Nova busca limpa erro anterior
  Dado que um erro esta sendo exibido
  Quando inicio nova busca
  Entao o erro anterior e removido antes de processar
```

### Regras de Negocio Vinculadas

- **RN-03** (`web-app`): Mensagem fixa para placa invalida 🟢
- **RN-06** (`web-app`): HTTP 400 → placa invalida; outros → payload.message ou fallback 🟢
- **RN-07** (`web-app`): Nova busca limpa erro e resultado anterior 🟢

---

## Mapa de Rastreabilidade

| User Story | Componentes SDD | Arquivos |
|-----------|----------------|----------|
| US-001 | `shared-schemas`, `web-app`, `api-server` | `schemas/vehicle.ts`, `App.tsx`, `server.ts` |
| US-002 | `web-app` | `App.tsx` |
| US-003 | `web-app`, `shared-schemas` | `App.tsx`, `schemas/vehicle.ts` |

---

## Gaps que Impedem Funcionamento End-to-End

| Gap | Impacto | Prioridade |
|-----|---------|-----------|
| Rota `POST /vehicle/identify` nao registrada em `server.ts` | US-001 nao funciona end-to-end — frontend recebe 404 | 🔴 Must fix |
| CORS nao configurado no servidor | Frontend em dominio diferente (Vercel) bloqueado pelo browser | 🔴 Must fix |
| Lookup de veiculo por placa nao implementado | Mesmo com rota, nao ha como resolver placa → veiculo | 🔴 Must fix |

---
*Gerado pelo Reversa Writer em 2026-05-03*
