# Perguntas para Validacao — Vehicle Diagnostic Core

> Gerado pelo Revisor em 2026-05-03.
> ✅ Todas as perguntas respondidas e implementadas.

---

## Pergunta 1

**Contexto:** `apps/api/src/server.ts` — apenas `GET /health` registrado. O frontend chama `POST /vehicle/identify` que retorna 404.
**Spec afetada:** [`_reversa_sdd/sdd/api-server.md`]
**Pergunta:** A rota `POST /vehicle/identify` nao estar registrada em `server.ts` e um bug conhecido ou e intencional para desenvolvimento incremental?
**Impacto:** Se for bug, a spec deve classificar como defeito critico com prioridade Must Fix.

✅ Respondida
**Resposta:** Bug. Rota registrada em `server.ts` com validacao Zod, lookup de veiculo e integracao com `diagnosticService`. Tratamento de erro incluido.

---

## Pergunta 2

**Contexto:** `apps/api/src/server.ts` — nenhuma configuracao de CORS. Frontend em Vercel, API no Render.com.
**Spec afetada:** [`_reversa_sdd/sdd/api-server.md`]
**Pergunta:** O frontend e a API operam em dominios separados?

✅ Respondida
**Resposta:** Sim, cross-origin. `@fastify/cors` configurado com `CORS_ORIGIN` via env var, fallback para `localhost:5173`. Credentials habilitado.

---

## Pergunta 3

**Contexto:** `apps/api/src/services/diagnosticService.ts:40-49` — sem try/catch.
**Spec afetada:** [`_reversa_sdd/sdd/api-diagnostic-service.md`]
**Pergunta:** Ausencia de tratamento de excecao e risco aceitavel?

✅ Respondida
**Resposta:** Nao. try/catch adicionado em `generateDiagnosisWithAI()`. Em caso de falha do LLM, faz log e fallback para `generateDiagnosis()` por regras.

---

## Pergunta 4

**Contexto:** Health response diverge do schema do shared.
**Spec afetada:** [`_reversa_sdd/sdd/api-server.md`], [`_reversa_sdd/sdd/shared-schemas.md`]
**Pergunta:** Qual e a fonte de verdade — server.ts ou healthResponseSchema?

✅ Respondida
**Resposta:** O schema e a fonte de verdade. `server.ts` atualizado para retornar `{ status: "ok", service: "vehicle-diagnostic-core", env: process.env.NODE_ENV }`.

---

## Pergunta 5

**Contexto:** `VehicleDescriptor` (local) vs `VehicleIdentity` (shared).
**Spec afetada:** [`_reversa_sdd/sdd/api-diagnostic-service.md`]
**Pergunta:** Intencional ou duplicacao?

✅ Respondida
**Resposta:** Duplicacao. `core/vehicle.ts` removido. Backend agora usa `Pick<VehicleIdentity, 'brand' | 'model'> & { year: string }` importado do shared.
