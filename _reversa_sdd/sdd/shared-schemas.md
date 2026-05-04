# Shared Schemas — `@core/shared`

> Spec SDD gerada pelo Reversa Writer em 2026-05-03.
> Nível de documentação: **detalhado**.

---

## Visao Geral

Pacote compartilhado que serve como **fonte unica de verdade** para validacao e tipagem entre frontend e backend. Define schemas Zod para validacao em runtime e exporta tipos TypeScript inferidos via `z.infer`. Garante que ambos os lados do monorepo usem exatamente os mesmos contratos de dados.

## Responsabilidades

| Responsabilidade | Prioridade | Justificativa |
|-----------------|-----------|---------------|
| Validar formato de placa veicular (request) | **Must** | Caminho critico — usado pelo frontend (client-side) e futuro handler da API |
| Definir shape da resposta de identificacao | **Must** | Contrato obrigatorio entre API e frontend para renderizar resultado |
| Definir shape interno de identidade veicular | **Should** | Usado internamente para tipagem, mas nao diretamente em validacao de fronteira |
| Exportar health check schema | **Could** | Usado apenas no endpoint `/health`, raramente alterado |

## Interface

### Schemas Exportados

#### `identifyVehicleRequestSchema` 🟢

```typescript
z.object({
  plate: z.string()
    .trim()
    .min(7, "Plate must have at least 7 characters")
    .max(8, "Plate must have at most 8 characters")
    .transform(value => value.replace(/-/g, "").toUpperCase())
    .refine(
      value => /^[A-Z]{3}[0-9]{4}$/.test(value) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(value),
      "Plate must match ABC1234 or ABC1D23"
    )
})
```

**Entrada:** `{ plate: string }`
**Saida (apos transform):** `{ plate: string }` — sem hifens, uppercase
**Falha:** `ZodError` com mensagem especifica

#### `identifyVehicleResponseSchema` 🟢

```typescript
z.object({
  plate: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  year:  z.string().trim().min(1),
  diagnostic: z.string().trim().min(1)
})
```

**Entrada:** objeto JSON da API
**Saida:** `IdentifyVehicleResponse` tipado
**Falha:** `ZodError` se qualquer campo estiver vazio ou ausente

#### `vehicleIdentitySchema` 🟢

```typescript
z.object({
  plate:   z.string().trim().min(1).optional(),
  brand:   z.string().trim().min(1),          // obrigatorio
  model:   z.string().trim().min(1),          // obrigatorio
  year:    z.string().trim().min(1).optional(),
  version: z.string().trim().min(1).optional()
})
```

**Uso:** tipagem interna — define a identidade do veiculo sem validacao de formato de placa

#### `healthResponseSchema` 🟢

```typescript
z.object({
  status:  z.literal("ok"),
  service: z.string(),
  env:     z.string()
})
```

### Tipos Exportados (via `z.infer`)

| Tipo | Schema de origem | Arquivo |
|------|-----------------|---------|
| `VehicleIdentity` | `vehicleIdentitySchema` | `types/vehicle.ts` 🟢 |
| `IdentifyVehicleRequest` | `identifyVehicleRequestSchema` | `types/vehicle.ts` 🟢 |
| `IdentifyVehicleResponse` | `identifyVehicleResponseSchema` | `types/vehicle.ts` 🟢 |
| `HealthResponse` | `healthResponseSchema` | `types/health.ts` 🟢 |

### Re-exportacao (`index.ts`) 🟢

```typescript
export * from "./schemas/index.js";
export type * from "./types/index.js";
```

Consumidores importam via `@core/shared/schemas` e `@core/shared/types`.

## Regras de Negocio

- **RN-01:** Placa deve ter 7-8 caracteres apos remoção de hifens 🟢
- **RN-02:** Formatos aceitos: `ABC1234` (antigo) ou `ABC1D23` (Mercosul) 🟢
- **RN-03:** Transform automatico: remove hifens e converte para uppercase 🟢
- **RN-04:** Todos os campos da resposta sao obrigatorios e nao-vazios 🟢
- **RN-05:** `brand` e `model` sao obrigatorios em `vehicleIdentitySchema`; `plate`, `year`, `version` sao opcionais 🟢

## Fluxo Principal

1. Frontend captura placa digitada pelo usuario 🟢
2. `identifyVehicleRequestSchema.safeParse({ plate })` valida no client 🟢
3. Se valido: placa e transformada (sem hifens, uppercase) e enviada ao backend 🟢
4. Backend retorna JSON; frontend valida com `identifyVehicleResponseSchema.parse()` 🟢
5. Tipo `IdentifyVehicleResponse` garante tipagem no render do resultado 🟢

## Fluxos Alternativos

- **Placa com hifen (ex: `ABC-1D23`):** transform remove o hifen antes da validacao → aceita normalmente 🟢
- **Placa muito curta (< 7 chars):** `safeParse` retorna `success: false` com mensagem "at least 7 characters" 🟢
- **Placa formato invalido (ex: `123ABCD`):** regex `refine` falha com mensagem "must match ABC1234 or ABC1D23" 🟢
- **Resposta da API com campo vazio:** `parse()` lanca `ZodError` — frontend trata como erro generico 🟢
- **Campo `plate` em lowercase:** transform converte para uppercase automaticamente 🟢

## Dependencias

| Dependencia | Tipo | Versao | Motivo |
|------------|------|--------|--------|
| `zod` | runtime | 3.24 | Validacao de schemas em runtime 🟢 |
| TypeScript | dev | 5.8 | Compilacao e inferencia de tipos 🟢 |

**Dependentes deste pacote:**
- `@core/web` — importa schemas para validacao client-side e tipos para estado 🟢
- `@core/api` — deveria importar para validacao server-side (ainda nao implementado) 🟡

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Sanitizacao de input (trim, uppercase, remove hifens) antes da validacao | `schemas/vehicle.ts:14-15` | 🟢 |
| Consistencia | Fonte unica de verdade — mesmo schema valida client e server | `index.ts:1-2` re-exporta tudo | 🟢 |
| Interoperabilidade | Tipos derivados dos schemas (`z.infer`) garantem sincronia tipo/validacao | `types/vehicle.ts:8-10` | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: Placa valida formato antigo
  Dado uma placa "ABC1234"
  Quando safeParse e executado com { plate: "ABC1234" }
  Entao o resultado e success: true
  E data.plate e "ABC1234"

Cenario: Placa valida formato Mercosul
  Dado uma placa "ABC1D23"
  Quando safeParse e executado com { plate: "ABC1D23" }
  Entao o resultado e success: true
  E data.plate e "ABC1D23"

Cenario: Placa com hifen e tratada
  Dado uma placa "abc-1d23"
  Quando safeParse e executado com { plate: "abc-1d23" }
  Entao o resultado e success: true
  E data.plate e "ABC1D23"

Cenario: Placa invalida rejeitada
  Dado uma placa "123ABC"
  Quando safeParse e executado com { plate: "123ABC" }
  Entao o resultado e success: false
  E issues contem mensagem sobre formato invalido

Cenario: Resposta da API sem campo obrigatorio
  Dado um JSON de resposta sem o campo "diagnostic"
  Quando parse e executado com identifyVehicleResponseSchema
  Entao ZodError e lancado
  E a mensagem indica campo obrigatorio ausente

Cenario: Resposta da API com campo vazio
  Dado um JSON de resposta com diagnostic: ""
  Quando parse e executado com identifyVehicleResponseSchema
  Entao ZodError e lancado
  E a mensagem indica string vazia nao permitida
```

## Cenarios de Borda

### Cenario 1: Placa com espacos e caracteres especiais

**Contexto:** Usuario digita placa com espacos ou caracteres alem de hifens (ex: `"ABC 1D23"`, `"ABC.1D23"`).
**Comportamento atual:** O transform so remove hifens (`replace(/-/g, "")`). Espacos e pontos permanecem, causando falha no regex. 🟢
**Impacto:** Placa valida na essencia mas com formatacao incomum sera rejeitada.
**Recomendacao:** Considerar ampliar o transform para remover todos os caracteres nao-alfanumericos. 🟡

### Cenario 2: Placa com exatamente 8 caracteres incluindo hifen

**Contexto:** Placa `"ABC-1234"` tem 8 chars (com hifen). Apos remove hifen, fica com 7 chars.
**Comportamento atual:** `min(7)` e `max(8)` validam o input **antes** do transform (Zod aplica `min`/`max` no string original, depois `transform`, depois `refine`). Portanto "ABC-1234" (8 chars) passa no `max(8)`, transform remove hifen → "ABC1234" (7 chars), regex valida. 🟢
**Risco:** Se a placa original tiver 9+ chars com hifen (ex: `"ABC-1D230"`), `max(8)` rejeita antes do transform. Comportamento correto. 🟢

## Rastreabilidade de Codigo

| Arquivo | Funcao / Export | Cobertura |
|---------|-----------------|-----------|
| `packages/shared/src/schemas/vehicle.ts` | `vehicleIdentitySchema`, `identifyVehicleRequestSchema`, `identifyVehicleResponseSchema` | 🟢 |
| `packages/shared/src/schemas/health.ts` | `healthResponseSchema` | 🟢 |
| `packages/shared/src/types/vehicle.ts` | `VehicleIdentity`, `IdentifyVehicleRequest`, `IdentifyVehicleResponse` | 🟢 |
| `packages/shared/src/types/health.ts` | `HealthResponse` | 🟢 |
| `packages/shared/src/index.ts` | Re-exportacao central | 🟢 |
| `packages/shared/src/schemas/index.ts` | Re-exportacao de schemas | 🟢 |
| `packages/shared/src/types/index.ts` | Re-exportacao de types | 🟢 |

---
*Gerado pelo Reversa Writer em 2026-05-03*
