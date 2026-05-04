# Code-Spec Matrix — Vehicle Diagnostic Core

> Gerada pelo Reversa Writer em 2026-05-03.
> Nivel de documentacao: **detalhado**.
>
> Mapeia cada arquivo-fonte do projeto para a spec SDD correspondente e seu nivel de cobertura.

---

## Legenda

| Simbolo | Significado |
|---------|-------------|
| 🟢 | Coberto — arquivo documentado integralmente na spec |
| 🟡 | Parcial — arquivo mencionado mas nem todas as funcoes/exports detalhados |
| — | Sem spec — arquivo nao coberto por nenhuma spec SDD |

---

## `packages/shared/` — Contratos Compartilhados

| Arquivo | Spec SDD | User Story | Cobertura |
|---------|----------|------------|-----------|
| `src/schemas/vehicle.ts` | `sdd/shared-schemas.md` | US-001 | 🟢 |
| `src/schemas/health.ts` | `sdd/shared-schemas.md` | — | 🟢 |
| `src/schemas/index.ts` | `sdd/shared-schemas.md` | — | 🟢 |
| `src/types/vehicle.ts` | `sdd/shared-schemas.md` | US-001 | 🟢 |
| `src/types/health.ts` | `sdd/shared-schemas.md` | — | 🟢 |
| `src/types/index.ts` | `sdd/shared-schemas.md` | — | 🟢 |
| `src/index.ts` | `sdd/shared-schemas.md` | — | 🟢 |

**Cobertura do pacote: 7/7 (100%)** 🟢

---

## `apps/api/` — Backend

| Arquivo | Spec SDD | User Story | Cobertura |
|---------|----------|------------|-----------|
| `src/server.ts` | `sdd/api-server.md` | US-001 | 🟢 |
| `src/services/diagnosticService.ts` | `sdd/api-diagnostic-service.md` | US-004, US-005 | 🟢 |
| `src/adapters/llm/mockLlmAdapter.ts` | `sdd/api-diagnostic-service.md` | US-005 | 🟢 |
| `src/core/vehicle.ts` | `sdd/api-diagnostic-service.md` | US-004 | 🟢 |

**Cobertura do pacote: 4/4 (100%)** 🟢

---

## `apps/web/` — Frontend

| Arquivo | Spec SDD | User Story | Cobertura |
|---------|----------|------------|-----------|
| `src/App.tsx` | `sdd/web-app.md` | US-001, US-002, US-003, US-006 | 🟢 |
| `src/main.tsx` | `sdd/web-app.md` | — | 🟢 |
| `src/index.css` | `sdd/web-app.md` | — | 🟡 |
| `src/vite-env.d.ts` | `sdd/web-app.md` | — | 🟡 |

**Cobertura do pacote: 2/4 completos, 2/4 parciais (100% mencionados, 50% detalhados)**

> `index.css` e `vite-env.d.ts` sao referenciados na spec mas sem detalhamento de conteudo — sao arquivos de suporte sem logica de negocio.

---

## Resumo Geral

| Pacote | Arquivos | Cobertos 🟢 | Parciais 🟡 | Sem spec — | % Cobertura |
|--------|----------|-------------|-------------|------------|-------------|
| `packages/shared` | 7 | 7 | 0 | 0 | 100% |
| `apps/api` | 4 | 4 | 0 | 0 | 100% |
| `apps/web` | 4 | 2 | 2 | 0 | 100% |
| **Total** | **15** | **13** | **2** | **0** | **100%** |

---

## Matriz Cruzada: Specs × User Stories

| Spec SDD | US-001 | US-002 | US-003 | US-004 | US-005 | US-006 |
|----------|--------|--------|--------|--------|--------|--------|
| `sdd/shared-schemas.md` | ✔ | · | ✔ | · | · | · |
| `sdd/api-server.md` | ✔ | · | · | · | · | · |
| `sdd/api-diagnostic-service.md` | · | · | · | ✔ | ✔ | · |
| `sdd/web-app.md` | ✔ | ✔ | ✔ | · | · | ✔ |

---

## Matriz Cruzada: Specs × OpenAPI

| Spec SDD | `GET /health` | `POST /vehicle/identify` |
|----------|--------------|--------------------------|
| `sdd/shared-schemas.md` | schemas de health e request/response | schemas de request/response |
| `sdd/api-server.md` | handler implementado | rota ausente (🔴) |
| `sdd/api-diagnostic-service.md` | — | logica de diagnostico (desconectada) |
| `sdd/web-app.md` | — | consumer (fetch no App.tsx) |

---

## Arquivos de Configuracao (fora do escopo SDD)

| Arquivo | Tipo | Motivo da exclusao |
|---------|------|--------------------|
| `package.json` (raiz + pacotes) | Config | Metadados e dependencias — sem logica |
| `tsconfig.json` (varios) | Config | Configuracao de compilacao |
| `vite.config.ts` | Config | Build config do frontend |
| `vercel.json` | Deploy | Configuracao de deploy Vercel |
| `render.yaml` | Deploy | Configuracao de deploy Render |
| `pnpm-workspace.yaml` | Config | Definicao de workspaces |
| `tailwind.config.*` | Config | Configuracao de estilizacao |

> Arquivos de configuracao nao recebem spec SDD. Informacoes relevantes de deploy estao documentadas em `_reversa_sdd/deployment.md` e `_reversa_sdd/architecture.md`.

---
*Gerado pelo Reversa Writer em 2026-05-03*
