# Spec Impact Matrix — Vehicle Diagnostic Core

> Atualizado em 2026-05-03 pelo Reversa Architect.  
> Reflete o estado real do código-fonte (não mais apenas planos).

---

## Componentes Identificados no Código

### Frontend (`@core/web`)
| ID | Componente | Arquivo | Status |
|----|-----------|---------|--------|
| F1 | `App` (raiz) | `src/App.tsx` | 🟢 Implementado |
| F2 | Input Placa | `App.tsx` — `<input>` | 🟢 Implementado |
| F3 | Botão Buscar | `App.tsx` — `<button>` | 🟢 Implementado |
| F4 | Feedback Loading | `App.tsx` — estado `loading` | 🟢 Implementado |
| F5 | Feedback Erro | `App.tsx` — estado `error` | 🟢 Implementado |
| F6 | Result Card | `App.tsx` — `<div.result-card>` | 🟢 Implementado |
| F7 | Diagnostic Card | `App.tsx` — `<div.diagnostic-card>` | 🟢 Implementado |
| F8 | Validação Zod client | `App.tsx` — `safeParse` | 🟢 Implementado |
| F9 | Form completo (marca/modelo/catálogo) | — | 🔴 Não iniciado |
| F10 | Chat de diagnóstico | — | 🔴 Não iniciado |
| F11 | Exportação WhatsApp/PDF | — | 🔴 Não iniciado |
| F12 | Gráficos `diagnostic_chart` | — | 🔴 Não iniciado |

### Backend (`@core/api`)
| ID | Componente | Arquivo | Status |
|----|-----------|---------|--------|
| B1 | Fastify server | `src/server.ts` | 🟢 Implementado |
| B2 | `GET /health` | `src/server.ts` | 🟢 Implementado |
| B3 | `POST /vehicle/identify` | — | 🔴 FALTANDO (rota não registrada) |
| B4 | `generateDiagnosis()` (regras) | `services/diagnosticService.ts` | 🟢 Implementado |
| B5 | `generateDiagnosisWithAI()` | `services/diagnosticService.ts` | 🟢 Implementado |
| B6 | `buildDiagnosticPrompt()` | `services/diagnosticService.ts` | 🟢 Implementado |
| B7 | `mockLlmAdapter` | `adapters/llm/mockLlmAdapter.ts` | 🟢 Implementado |
| B8 | CORS middleware | — | 🔴 Não implementado |
| B9 | Factory de `PLATE_PROVIDER` | — | 🔴 Não implementado |
| B10 | Autenticação JWT | — | 🔴 Não iniciado |
| B11 | LLM real (OpenAI) | — | 🔴 Não iniciado |

### Shared (`@core/shared`)
| ID | Componente | Arquivo | Status |
|----|-----------|---------|--------|
| S1 | `identifyVehicleRequestSchema` | `schemas/vehicle.ts` | 🟢 Implementado |
| S2 | `identifyVehicleResponseSchema` | `schemas/vehicle.ts` | 🟢 Implementado |
| S3 | `vehicleIdentitySchema` | `schemas/vehicle.ts` | 🟢 Implementado |
| S4 | TypeScript types inferidos | `types/vehicle.ts` | 🟢 Implementado |

---

## Matriz de Impacto

Leitura: impacto de uma mudança no **componente da linha** sobre os **componentes da coluna**.

`X` = impacto direto | `o` = impacto indireto | `.` = sem impacto

| Componente \ Afeta → | F1 | F2 | F6 | F7 | B2 | B3 | B4 | B5 | B7 | S1 | S2 |
|----------------------|----|----|----|----|----|----|----|----|----|----|-----|
| **S1 (RequestSchema)** | o | X | . | . | . | X | . | . | . | — | . |
| **S2 (ResponseSchema)** | o | . | X | X | . | X | . | . | . | . | — |
| **S3 (VehicleIdentitySchema)** | . | . | . | . | . | o | o | o | o | o | o |
| **B4 (regras por modelo)** | . | . | . | X | . | X | — | o | . | . | . |
| **B5 (generateDiagnosisWithAI)** | . | . | . | X | . | X | o | — | o | . | . |
| **B7 (mockLlmAdapter)** | . | . | . | X | . | o | . | X | — | . | . |
| **B3 (rota /vehicle/identify)** | o | . | X | X | . | — | X | X | o | X | X |
| **F2 (Input Placa)** | X | — | . | . | . | o | . | . | . | X | . |
| **F8 (Validação Zod client)** | X | X | . | . | . | o | . | . | . | X | . |

---

## Pontos Críticos de Acoplamento

1. **`@core/shared` schemas → web e api:** qualquer mudança em `identifyVehicleRequestSchema` ou `identifyVehicleResponseSchema` impacta simultaneamente o frontend (validação client) e o backend (handler da rota). Alterações requerem rebuild de `shared` antes de testar.

2. **`B3` (rota ausente) → todo o fluxo:** a rota `POST /vehicle/identify` não estar registrada quebra toda a cadeia de valor. É o único bloqueio para o sistema funcionar end-to-end.

3. **`B7` (mockLlmAdapter) → `B5`:** o adapter mock retorna texto fixo. Quando trocar por LLM real, `B5` precisa tratar erros, latência e formato diferente de resposta.

---

## Especificações Mapeadas

| Spec | Origem | Implementado |
|------|--------|-------------|
| Busca por placa (regex ABC1234/ABC1D23) | `schemas/vehicle.ts` | 🟢 Sim |
| Diagnóstico por regras (4 veículos) | `diagnosticService.ts` | 🟢 Sim |
| Diagnóstico via LLM adapter | `diagnosticService.ts` + `mockLlmAdapter.ts` | 🟡 Mock |
| Form completo de veículo (catálogo) | `implementation_plan.md` | 🔴 Não |
| Chat de diagnóstico interativo | `implementation_plan.md` | 🔴 Não |
| Exportação WhatsApp/PDF | `implementation_plan.md` | 🔴 Não |
| Gráficos `diagnostic_chart` | `implementation_plan.md` | 🔴 Não |
| Autenticação de usuários | `render.yaml` env vars | 🔴 Não |
| Banco de dados / persistência | `render.yaml` `DATABASE_URL` | 🔴 Não |

---
*Gerado pelo Reversa Architect em 2026-05-03*
