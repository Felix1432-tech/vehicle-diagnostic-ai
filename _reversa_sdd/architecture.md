# Architecture Overview — Vehicle Diagnostic Core

> **Atualizado em:** 2026-05-03 pelo Reversa Architect  
> Revisão total: análise agora baseada em **código-fonte real** (não mais apenas em `implementation_plan.md`).

---

## Visão do Sistema

Vehicle Diagnostic Core é uma plataforma de diagnóstico automotivo baseada em IA. O usuário informa a placa de um veículo; o sistema identifica o veículo e retorna um diagnóstico inicial de possíveis falhas.

---

## Estrutura do Repositório

O projeto é um **monorepo pnpm workspaces** com três pacotes:

```
vehicle-diagnostic-core/
├── apps/
│   ├── api/          @core/api    — Fastify 5 + TypeScript (backend)
│   └── web/          @core/web    — React 18 + Vite 5 + Tailwind 4 (frontend)
└── packages/
    └── shared/       @core/shared — Zod schemas + TypeScript types compartilhados
```

---

## Stack Tecnológica Confirmada

| Camada | Tecnologia | Versão | Confirmado |
|--------|-----------|--------|-----------|
| Frontend SPA | React | 18.3 | 🟢 package.json |
| Build / Dev Server | Vite | 5.4 | 🟢 package.json |
| Estilização | Tailwind CSS | 4.1 | 🟢 package.json |
| API Server | Fastify | 5.2 | 🟢 package.json |
| Runtime servidor | Node.js | 22 (types) | 🟢 @types/node |
| Validação / Schemas | Zod | 3.24 | 🟢 ambos packages |
| TypeScript | — | 5.8 | 🟢 todos os packages |
| LLM Adapter | Mock (interno) | — | 🟢 mockLlmAdapter.ts |
| Deploy web | Vercel | — | 🟢 vercel.json |
| Deploy API | Render.com | plano free | 🟢 render.yaml |

---

## Camadas Arquiteturais

### 1. `packages/shared` — Contratos Compartilhados

Único ponto de verdade para tipos e validações usados em ambos web e API.

- **`schemas/vehicle.ts`** — Zod schemas:
  - `vehicleIdentitySchema` — shape interno de veículo
  - `identifyVehicleRequestSchema` — valida placa (regex ABC1234 ou ABC1D23)
  - `identifyVehicleResponseSchema` — resposta da API com `plate, brand, model, year, diagnostic`
- **`types/vehicle.ts`** — TypeScript types derivados dos schemas via `z.infer`
- **`schemas/health.ts`** — Schema de health check

### 2. `apps/api` — Backend (Fastify 5)

**Arquivo de entrada:** `src/server.ts`
- Inicializa Fastify, registra `/health`, bind em `0.0.0.0:PORT`
- ⚠️ **LACUNA CRÍTICA:** a rota `POST /vehicle/identify` **não está registrada** no server.ts, embora a lógica exista nos serviços

**Serviços internos:**
- `src/services/diagnosticService.ts` — lógica de diagnóstico em duas camadas:
  1. **Camada regras** (`generateDiagnosis`): if/else por marca+modelo (Toyota Corolla, Gol, Uno, Ranger)
  2. **Camada IA** (`generateDiagnosisWithAI`): delega ao adapter LLM, com fallback para camada 1
- `src/adapters/llm/mockLlmAdapter.ts` — adapter mock que retorna diagnóstico genérico
- `src/core/vehicle.ts` — tipo local `VehicleDescriptor {brand, model, year}`

**Variáveis de ambiente esperadas:**
| Variável | Uso | Estado |
|----------|-----|--------|
| `PORT` | Porta do servidor | Injetada pelo Render |
| `CORS_ORIGIN` | Domínio permitido para CORS | Declarada, **não implementada no código** |
| `PLATE_PROVIDER` | `mock` ou real | Declarada, **não implementada no código** |
| `OPENAI_API_KEY` | LLM real | Declarada, **sem uso real** |
| `DATABASE_URL` | Banco de dados | Declarada, **sem banco implementado** |
| `JWT_SECRET` | Auth | Declarada, **sem auth implementada** |

### 3. `apps/web` — Frontend (React 18 + Vite)

**Componente único:** `src/App.tsx`
- Campo de input de placa com validação client-side via Zod (`identifyVehicleRequestSchema`)
- Fetch para `${VITE_API_BASE_URL}/vehicle/identify` via `POST`
- Exibe resultado: placa, marca, modelo, ano e sugestão de diagnóstico
- Estados gerenciados: `plate`, `vehicle`, `error`, `loading`

**Configuração de ambiente:**
- `VITE_API_BASE_URL` — URL da API (injetada no build; default `""` para proxy local)

---

## Estado Atual vs. Planejado

| Funcionalidade | Planejado | Implementado | Gap |
|----------------|-----------|-------------|-----|
| Form de identificação por placa | Sim | Sim (básico) | UI mínima sem catálogo completo |
| Rota `POST /vehicle/identify` | Sim | **Não** | Lógica existe, rota não registrada |
| Diagnóstico por regras | Sim | Sim (4 modelos) | Cobertura mínima |
| LLM adapter (mock) | Sim | Sim | Mock apenas |
| LLM real (OpenAI) | Sim | **Não** | API key declarada, sem uso |
| Busca de placa real | Sim | **Não** | `PLATE_PROVIDER=mock` sem implementação |
| Banco de dados | Sim | **Não** | `DATABASE_URL` declarada, sem ORM |
| Autenticação | Sim | **Não** | JWT secret declarado, sem rotas |
| Chat de diagnóstico | Sim | **Não** | Não iniciado |
| Exportação WhatsApp/PDF | Sim | **Não** | Não iniciado |
| Gráficos `diagnostic_chart` | Sim | **Não** | Não iniciado |

---

## Dívidas Técnicas

| ID | Dívida | Severidade | Área |
|----|--------|-----------|------|
| DT-01 | Rota `/vehicle/identify` não registrada no server.ts | **CRÍTICA** | API |
| DT-02 | CORS não implementado no código (apenas declarado em env) | Alta | API |
| DT-03 | `PLATE_PROVIDER` não consumido — sem factory de provider | Alta | API |
| DT-04 | Sem banco de dados — nenhum dado persiste entre requests | Alta | Infra |
| DT-05 | LLM adapter sempre mock — OpenAI não integrado | Média | API |
| DT-06 | Sem autenticação de usuários | Média | API |
| DT-07 | Sem testes automatizados em nenhuma camada | Média | Qualidade |
| DT-08 | `VehicleDescriptor` duplicado entre `apps/api/src/core/` e `packages/shared/` | Baixa | Organização |
| DT-09 | UI cobre apenas busca por placa — formulário manual não implementado | Baixa | Web |

---

## Decisões Arquiteturais Confirmadas

1. **Monorepo pnpm workspaces** — shared como pacote interno, zero duplicação de contratos
2. **Zod como fonte de verdade** — schemas em shared geram tipos TypeScript automaticamente
3. **Adapter pattern para LLM** — isolamento que permite trocar mock por OpenAI/Anthropic sem mudar DiagnosticService
4. **Fastify sobre Express** — escolha explícita de performance e ecosistema moderno
5. **Deploy split** — web na Vercel (CDN global), API no Render (Node.js gerenciado)

---

## Diagramas

- C4 Contexto: `c4-context.md`
- C4 Containers: `c4-containers.md`
- C4 Componentes: `c4-components.md`
- ERD: `erd-complete.md`
- Deployment: `deployment.md`
- Spec Impact Matrix: `traceability/spec-impact-matrix.md`

---

*Gerado pelo Reversa Architect em 2026-05-03 — baseado em leitura direta do código-fonte*
