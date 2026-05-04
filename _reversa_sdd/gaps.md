# Lacunas Pendentes — Vehicle Diagnostic Core

> Gerado pelo Revisor em 2026-05-03.
> Categorizado por severidade conforme nivel `detalhado`.

---

## Critico

Bloqueiam o funcionamento end-to-end do sistema.

### GAP-01: Rota `POST /vehicle/identify` nao registrada

- **Spec:** `sdd/api-server.md`
- **Arquivo:** `apps/api/src/server.ts`
- **Descricao:** O unico fluxo de valor do sistema (placa → diagnostico) esta quebrado. O frontend envia `POST /vehicle/identify`, o servidor retorna 404. A logica de diagnostico existe em `diagnosticService.ts` mas nao esta conectada ao servidor.
- **Impacto:** Sistema nao funciona em producao. Zero valor entregue ao usuario.
- **Dependencias:** `questions.md#pergunta-1`

### GAP-02: CORS nao configurado

- **Spec:** `sdd/api-server.md`
- **Arquivo:** `apps/api/src/server.ts`
- **Descricao:** Frontend em Vercel (dominio A) e API em Render (dominio B). Sem `@fastify/cors`, o browser bloqueia todos os requests cross-origin com erro de CORS policy.
- **Impacto:** Mesmo que GAP-01 seja corrigido, o frontend nao consegue acessar a API.
- **Dependencias:** `questions.md#pergunta-2`

### GAP-03: Sem lookup de veiculo por placa

- **Spec:** `sdd/api-server.md`, `sdd/api-diagnostic-service.md`
- **Descricao:** Nao existe nenhum mecanismo para resolver placa → dados do veiculo (marca, modelo, ano). O `diagnosticService` recebe um `VehicleDescriptor` ja preenchido, mas ninguem faz a resolucao.
- **Impacto:** Mesmo com rota e CORS, o sistema nao sabe que veiculo pertence a placa informada.

---

## Moderado

Riscos que afetam qualidade ou operacao em producao.

### GAP-04: `generateDiagnosisWithAI()` sem try/catch

- **Spec:** `sdd/api-diagnostic-service.md`
- **Arquivo:** `apps/api/src/services/diagnosticService.ts:40-49`
- **Descricao:** Se o LLM adapter lancar excecao (rede, timeout, API key invalida), a Promise rejeita e propaga ate o handler da rota sem tratamento. Com mock atual nao ha risco, mas ao trocar para LLM real, qualquer erro de rede resulta em 500 sem fallback.
- **Impacto:** Disponibilidade comprometida em producao com LLM real.
- **Dependencias:** `questions.md#pergunta-3`

### GAP-05: Divergencia `healthResponseSchema` vs implementacao

- **Spec:** `sdd/api-server.md`, `sdd/shared-schemas.md`
- **Arquivos:** `packages/shared/src/schemas/health.ts`, `apps/api/src/server.ts`
- **Descricao:** Schema espera `{ status, service, env }`, servidor retorna apenas `{ status: "ok" }`. Se alguem validar a resposta do health com o schema, vai falhar.
- **Impacto:** Inconsistencia de contrato. Baixo impacto atual (ninguem valida), alto risco se monitoramento externo usar o schema.
- **Dependencias:** `questions.md#pergunta-4`

### GAP-06: Tipo `VehicleDescriptor` duplicado

- **Spec:** `sdd/api-diagnostic-service.md`
- **Arquivos:** `apps/api/src/core/vehicle.ts`, `packages/shared/src/types/vehicle.ts`
- **Descricao:** Backend define `VehicleDescriptor { brand, model, year }` localmente. Shared define `VehicleIdentity` com campos similares. Mudanca em um nao reflete no outro.
- **Impacto:** Divergencia silenciosa se campos forem adicionados/removidos no shared.
- **Dependencias:** `questions.md#pergunta-5`

---

## Cosmetico

Nao afetam funcionalidade, mas impactam manutenibilidade.

### GAP-07: Diagnostico generico nao identifica o veiculo

- **Spec:** `sdd/api-diagnostic-service.md`
- **Arquivo:** `apps/api/src/services/diagnosticService.ts:26`
- **Descricao:** Quando o veiculo nao esta na tabela de regras (4 veiculos), o fallback retorna "Recomendamos uma verificacao completa do sistema de ignicao e injecao." — mensagem fixa que nao menciona o veiculo especifico.
- **Impacto:** UX inferior para veiculos nao mapeados. Nao e um bug, mas e uma limitacao.

### GAP-08: Sem log de erros no frontend

- **Spec:** `sdd/web-app.md`
- **Arquivo:** `apps/web/src/App.tsx:53-56`
- **Descricao:** Quando `identifyVehicleResponseSchema.parse()` falha (JSON invalido da API), o `catch` exibe mensagem generica ao usuario mas nao faz `console.error()` do ZodError. Debugging requer inspecionar network tab.
- **Impacto:** Dificulta diagnostico de problemas em producao.

---
*Gerado pelo Revisor em 2026-05-03*
