# Diagnostic Service + LLM Adapter — `@core/api`

> Spec SDD gerada pelo Reversa Writer em 2026-05-03.
> Nivel de documentacao: **detalhado**.

---

## Visao Geral

Modulo de logica de negocio responsavel por gerar diagnosticos automotivos a partir de dados de um veiculo. Opera em dois modos: **regras deterministicas** (lookup por marca/modelo) e **IA via LLM adapter** (com fallback para regras). O adapter atual e um mock que retorna texto generico sem chamada externa. O servico esta implementado mas **nao esta conectado a nenhuma rota** do servidor — e codigo orfao aguardando wiring.

## Responsabilidades

| Responsabilidade | Prioridade | Justificativa |
|-----------------|-----------|---------------|
| `generateDiagnosis()` — diagnostico por regras deterministicas | **Must** | Fallback primario, funciona sem dependencia externa 🟢 |
| `generateDiagnosisWithAI()` — diagnostico via LLM com fallback | **Must** | Fluxo principal planejado para producao 🟢 |
| `buildDiagnosticPrompt()` — montagem de prompt para LLM | **Must** | Necessario para qualquer integracao com LLM 🟢 |
| `LlmAdapter` interface — contrato para adapters de LLM | **Must** | Ponto de extensao para trocar mock por LLM real 🟢 |
| `createMockLlmAdapter()` — implementacao mock | **Should** | Permite desenvolvimento e testes sem API key externa 🟢 |

## Interface

### `generateDiagnosis(vehicle: VehicleDescriptor): string` 🟢

Funcao **sincrona** que retorna diagnostico baseado em regras hardcoded.

**Entrada:**
```typescript
type VehicleDescriptor = {
  brand: string;
  model: string;
  year: string;
};
```

**Saida:** `string` — texto de diagnostico

**Tabela de regras:**

| Marca (lowercase) | Modelo (includes, lowercase) | Diagnostico |
|-------------------|------------------------------|-------------|
| `toyota` | `corolla` | "Possivel falha comum em Corolla: bobina de ignicao." 🟢 |
| `volkswagen` | `gol` | "Possivel falha comum em Gol: desgaste em cabos de vela e corpo de borboleta." 🟢 |
| `fiat` | `uno` | "Possivel falha comum em Uno: sujeira no sistema de injecao e falha em velas." 🟢 |
| `ford` | `ranger` | "Possivel falha comum em Ranger: verificar bicos injetores, sensor MAF e pressao de combustivel." 🟢 |
| *(qualquer outro)* | *(qualquer)* | "Recomendamos uma verificacao completa do sistema de ignicao e injecao." 🟢 |

### `buildDiagnosticPrompt(vehicle: VehicleDescriptor): string` 🟢

Funcao **sincrona** que monta prompt estruturado para o LLM.

**Entrada:** `VehicleDescriptor`
**Saida:** string multi-linha com formato:
```
Voce e um assistente tecnico automotivo.
Gere um diagnostico inicial curto e estruturado.
Marca: {brand}
Modelo: {model}
Ano: {year}
Formato esperado: "Possiveis causas: ... Recomendacoes: ..."
```

### `generateDiagnosisWithAI(vehicle: VehicleDescriptor): Promise<string>` 🟢

Funcao **assincrona** que tenta diagnostico via LLM e faz fallback para regras.

**Entrada:** `VehicleDescriptor`
**Saida:** `Promise<string>` — diagnostico do LLM ou fallback

**Fluxo:**
1. Chama `buildDiagnosticPrompt(vehicle)` para montar o prompt
2. Chama `llmAdapter.generateDiagnostic(prompt, vehicle)`
3. Se resposta vazia ou so whitespace → fallback para `generateDiagnosis(vehicle)`
4. Caso contrario → retorna resposta do LLM

### `LlmAdapter` (interface) 🟢

```typescript
type LlmAdapter = {
  generateDiagnostic(prompt: string, vehicle: VehicleDescriptor): Promise<string>;
};
```

**Contrato:**
- Recebe prompt formatado e dados do veiculo
- Retorna `Promise<string>` com texto de diagnostico
- Implementacoes devem tratar seus proprios erros internamente

### `createMockLlmAdapter(): LlmAdapter` 🟢

Factory que retorna adapter mock. Nao faz chamada de rede.

**Saida fixa:**
```
"Possiveis causas: padroes recorrentes observados em {brand} {model} {year}. 
Recomendacoes: validar sistema de ignicao, leitura de falhas e inspecao inicial da injecao."
```

O mock sempre retorna texto nao-vazio, portanto `generateDiagnosisWithAI` **nunca aciona o fallback** enquanto o mock estiver ativo. 🟡

## Regras de Negocio

- **RN-01:** Comparacao de marca e case-insensitive (`toLowerCase()`) 🟢
- **RN-02:** Comparacao de modelo usa `includes()` — match parcial (ex: "Corolla XEi" inclui "corolla") 🟢
- **RN-03:** Ordem de avaliacao das regras: Toyota > Volkswagen > Fiat > Ford > fallback generico 🟢
- **RN-04:** Se LLM retorna string vazia ou so espacos, fallback para regras deterministicas 🟢
- **RN-05:** LLM adapter e instanciado uma unica vez no modulo (singleton de modulo) 🟢
- **RN-06:** Prompt segue formato fixo com 6 linhas — nao e configuravel 🟢

## Fluxo Principal

1. Caller invoca `generateDiagnosisWithAI(vehicle)` 🟢
2. `buildDiagnosticPrompt(vehicle)` monta prompt com marca/modelo/ano 🟢
3. `llmAdapter.generateDiagnostic(prompt, vehicle)` e chamado (async) 🟢
4. Mock retorna texto generico interpolado com dados do veiculo 🟢
5. Texto nao e vazio → retornado diretamente ao caller 🟢

## Fluxos Alternativos

- **LLM retorna string vazia:** `generateDiagnosisWithAI` detecta via `!aiOutput || !aiOutput.trim()` e chama `generateDiagnosis(vehicle)` como fallback 🟢
- **Veiculo nao esta na tabela de regras:** Fallback retorna mensagem generica de verificacao completa 🟢
- **Modelo contem substring coberta (ex: "Gol G5"):** `includes("gol")` faz match — diagnostico especifico retornado 🟢
- **LLM adapter lanca excecao:** **NAO TRATADO** — `generateDiagnosisWithAI` nao tem try/catch. Promise rejeita e propaga para o caller. 🔴

## Dependencias

| Dependencia | Tipo | Arquivo | Motivo |
|------------|------|---------|--------|
| `VehicleDescriptor` | tipo local | `core/vehicle.ts` | Shape de entrada para todas as funcoes 🟢 |
| `createMockLlmAdapter` | factory | `adapters/llm/mockLlmAdapter.ts` | Adapter LLM ativo 🟢 |

**Dependentes (esperados):**
- `server.ts` — deveria importar e chamar no handler de `POST /vehicle/identify` 🔴 NAO CONECTADO

**Nao depende de:**
- `@core/shared` — usa tipo local `VehicleDescriptor` em vez de `VehicleIdentity` do shared. Duplicacao de tipagem. 🟡

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Resiliencia | Fallback automatico de LLM para regras deterministicas | `diagnosticService.ts:44-46` — check de string vazia | 🟢 |
| Extensibilidade | Interface `LlmAdapter` permite trocar implementacao sem alterar servico | `mockLlmAdapter.ts:3` — type `LlmAdapter` | 🟢 |
| Testabilidade | Mock adapter permite testes sem dependencia externa | `mockLlmAdapter.ts:7` — `createMockLlmAdapter()` | 🟢 |
| Disponibilidade | Sem tratamento de excecao no fluxo AI — exception propaga | ausencia de try/catch em `diagnosticService.ts:40-49` | 🔴 |

## Criterios de Aceitacao

```gherkin
Cenario: Diagnostico por regras — veiculo conhecido (Toyota Corolla)
  Dado um VehicleDescriptor com brand "Toyota" e model "Corolla"
  Quando generateDiagnosis e chamado
  Entao retorna "Possivel falha comum em Corolla: bobina de ignicao."

Cenario: Diagnostico por regras — veiculo nao mapeado
  Dado um VehicleDescriptor com brand "Honda" e model "Civic"
  Quando generateDiagnosis e chamado
  Entao retorna "Recomendamos uma verificacao completa do sistema de ignicao e injecao."

Cenario: Diagnostico por regras — match parcial de modelo
  Dado um VehicleDescriptor com brand "Volkswagen" e model "Gol G5 1.0"
  Quando generateDiagnosis e chamado
  Entao retorna diagnostico especifico do Gol (includes "gol" faz match)

Cenario: Diagnostico com IA — mock adapter retorna texto
  Dado o mock LLM adapter ativo
  Quando generateDiagnosisWithAI e chamado com qualquer veiculo
  Entao retorna texto contendo "Possiveis causas" e "Recomendacoes"
  E o fallback para regras NAO e acionado

Cenario: Diagnostico com IA — LLM retorna vazio
  Dado um LLM adapter que retorna string vazia
  Quando generateDiagnosisWithAI e chamado
  Entao fallback para generateDiagnosis e acionado
  E retorna diagnostico por regras ou mensagem generica

Cenario: Diagnostico com IA — LLM lanca excecao
  Dado um LLM adapter que rejeita a Promise
  Quando generateDiagnosisWithAI e chamado
  Entao a excecao propaga para o caller sem tratamento
  E isto e um GAP — deveria haver try/catch com fallback
```

## Cenarios de Borda

### Cenario 1: Marca com case misto e modelo com prefixo

**Contexto:** `{ brand: "TOYOTA", model: "New Corolla 2024" }`.
**Comportamento atual:** `brand.toLowerCase()` → `"toyota"` (match). `model.toLowerCase()` → `"new corolla 2024"`, `includes("corolla")` → `true` (match). Diagnostico especifico retornado. 🟢
**Risco:** Se o modelo fosse "Corolla Cross" tambem faria match com a mesma regra do Corolla sedan. Nao ha distincao entre variantes. 🟡

### Cenario 2: Adapter real lanca erro de rede (timeout, 5xx)

**Contexto:** Quando o mock for substituido por um adapter real (ex: OpenAI), chamadas de rede podem falhar.
**Comportamento atual:** `generateDiagnosisWithAI` nao tem `try/catch`. A Promise rejeitada propaga sem fallback. 🔴
**Impacto:** Em producao com LLM real, qualquer erro de rede resulta em 500 para o usuario em vez de fallback para regras.
**Recomendacao:** Envolver `llmAdapter.generateDiagnostic()` em try/catch e acionar `generateDiagnosis(vehicle)` como fallback em caso de excecao. 🔴

### Cenario 3: Tipo `VehicleDescriptor` vs `VehicleIdentity`

**Contexto:** O backend define `VehicleDescriptor` localmente (`core/vehicle.ts`) com `{ brand, model, year }`. O shared define `VehicleIdentity` com `{ plate?, brand, model, year?, version? }`.
**Comportamento atual:** Os dois tipos sao compatíveis (VehicleDescriptor e um subset mais restrito), mas nao ha vinculo formal. 🟡
**Risco:** Se `VehicleIdentity` mudar no shared, `VehicleDescriptor` nao acompanha automaticamente. Divergencia silenciosa.
**Recomendacao:** Substituir `VehicleDescriptor` por `Pick<VehicleIdentity, 'brand' | 'model' | 'year'>` importado do shared. 🟡

## Rastreabilidade de Codigo

| Arquivo | Funcao / Elemento | Cobertura |
|---------|-------------------|-----------|
| `apps/api/src/services/diagnosticService.ts:1` | `import createMockLlmAdapter` | 🟢 |
| `apps/api/src/services/diagnosticService.ts:4` | `const llmAdapter = createMockLlmAdapter()` — singleton de modulo | 🟢 |
| `apps/api/src/services/diagnosticService.ts:6-27` | `generateDiagnosis()` — 4 regras + fallback | 🟢 |
| `apps/api/src/services/diagnosticService.ts:29-38` | `buildDiagnosticPrompt()` — montagem de prompt | 🟢 |
| `apps/api/src/services/diagnosticService.ts:40-49` | `generateDiagnosisWithAI()` — fluxo com fallback | 🟢 |
| `apps/api/src/adapters/llm/mockLlmAdapter.ts:3-5` | `LlmAdapter` type — interface do adapter | 🟢 |
| `apps/api/src/adapters/llm/mockLlmAdapter.ts:7-16` | `createMockLlmAdapter()` — factory mock | 🟢 |
| `apps/api/src/core/vehicle.ts:1-5` | `VehicleDescriptor` type — shape local | 🟢 |

---
*Gerado pelo Reversa Writer em 2026-05-03*
