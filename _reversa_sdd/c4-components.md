# C4 — Nível 3: Componentes

> Atualizado em 2026-05-03. Baseado em leitura direta dos arquivos-fonte.

---

## Frontend — `@core/web`

```mermaid
flowchart TB
    subgraph web ["@core/web (React 18 SPA)"]
        direction TB
        main["main.tsx\nEntry point — monta App no DOM"]
        App["App.tsx\nComponente raiz único"]

        subgraph AppInternals ["App.tsx — estado e fluxo"]
            state["Estado local\nplate / vehicle / error / loading"]
            handleSearch["handleSearch()\nValida placa → fetch /vehicle/identify"]
            zodValidation["Validação Zod (client)\nidentifyVehicleRequestSchema.safeParse()"]
        end

        subgraph UI ["UI renderizada"]
            form["Form + Input placa\n(toUpperCase automático)"]
            btn["Botão Buscar\n(disabled durante loading)"]
            feedbackLoading["Feedback: carregando"]
            feedbackError["Feedback: erro com mensagem"]
            resultCard["Result Card\nPlaca / Marca / Modelo / Ano"]
            diagnosticCard["Diagnostic Card\nSugestão inicial de falha"]
        end
    end

    shared_schemas["@core/shared/schemas\nidentifyVehicleRequest/ResponseSchema"]

    main --> App
    App --> AppInternals
    App --> UI
    handleSearch --> zodValidation
    zodValidation --> |"safeParse OK"| fetch_api["fetch POST /vehicle/identify"]
    zodValidation --> |"safeParse FAIL"| feedbackError
    fetch_api --> |"200 OK"| resultCard
    fetch_api --> |"erro HTTP"| feedbackError
    App -.importa.-> shared_schemas
```

### Arquivos do Frontend

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/main.tsx` | Entry point — `ReactDOM.createRoot` + monta `<App />` |
| `src/App.tsx` | Componente raiz completo (estado + fetch + UI) |
| `src/index.css` | Estilos globais Tailwind |
| `src/vite-env.d.ts` | Declaração de tipos para `import.meta.env` |

---

## Backend — `@core/api`

```mermaid
flowchart TB
    subgraph api ["@core/api (Fastify 5)"]
        server["server.ts\nEntry point — configura e inicia Fastify"]

        subgraph routes ["Rotas registradas"]
            healthRoute["GET /health\n→ { status: 'ok' }"]
            identifyRoute["POST /vehicle/identify\n⚠️ NÃO REGISTRADA\n(lógica existe, rota faltando)"]
        end

        subgraph services ["services/"]
            diagService["diagnosticService.ts"]
            genDiag["generateDiagnosis()\nRegras por marca+modelo\n4 veículos cobertos"]
            genDiagAI["generateDiagnosisWithAI()\nDelega ao LlmAdapter\nFallback para regras"]
            buildPrompt["buildDiagnosticPrompt()\nMonta prompt para o LLM"]
        end

        subgraph adapters ["adapters/llm/"]
            llmAdapter["LlmAdapter (interface)\ngenerateDiagnostic(prompt, vehicle)"]
            mockAdapter["mockLlmAdapter.ts\nRetorna texto genérico\nsem chamada externa"]
        end

        subgraph core ["core/"]
            vehicleType["vehicle.ts\nVehicleDescriptor type\n{ brand, model, year }"]
        end
    end

    server --> healthRoute
    server -.falta wiring.-> identifyRoute
    identifyRoute -.deveria chamar.-> diagService
    diagService --> genDiag
    diagService --> genDiagAI
    diagService --> buildPrompt
    genDiagAI --> llmAdapter
    llmAdapter --> mockAdapter
    diagService --> vehicleType
    mockAdapter --> vehicleType
```

### Arquivos do Backend

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/server.ts` | Inicializa Fastify, registra rotas, bind porta |
| `src/services/diagnosticService.ts` | Orquestra geração de diagnóstico (regras + IA) |
| `src/adapters/llm/mockLlmAdapter.ts` | Implementação mock do `LlmAdapter` |
| `src/core/vehicle.ts` | Tipo local `VehicleDescriptor` |

---

## Shared — `@core/shared`

```mermaid
flowchart LR
    subgraph shared ["@core/shared"]
        schemas_vehicle["schemas/vehicle.ts\nvehicleIdentitySchema\nidentifyVehicleRequestSchema\nidentifyVehicleResponseSchema"]
        schemas_health["schemas/health.ts\nhealthResponseSchema"]
        types_vehicle["types/vehicle.ts\nVehicleIdentity\nIdentifyVehicleRequest\nIdentifyVehicleResponse"]
        index["index.ts\nRe-exporta schemas e types"]
    end

    schemas_vehicle --> |"z.infer"| types_vehicle
    schemas_vehicle --> index
    schemas_health --> index
    types_vehicle --> index
```

### Schemas Zod (fonte de verdade)

| Schema | Valida | Regras |
|--------|--------|--------|
| `vehicleIdentitySchema` | shape interno do veículo | campos opcionais exceto brand/model |
| `identifyVehicleRequestSchema` | entrada do POST | placa 7-8 chars, regex ABC1234 ou ABC1D23 |
| `identifyVehicleResponseSchema` | resposta da API | plate, brand, model, year, diagnostic (todos obrigatórios) |

---

## Gap Crítico Identificado

```
Web chama:     POST /vehicle/identify
API registra:  GET /health    ← ÚNICA ROTA

DiagnosticService.generateDiagnosisWithAI() existe mas não está conectado ao server.ts.
O endpoint está quebrado em produção — retorna 404.
```

---

## Escala de Confiança

| Componente | Confiança |
|-----------|-----------|
| `main.tsx`, `App.tsx` | 🟢 CONFIRMADO — lido diretamente |
| `server.ts` rotas | 🟢 CONFIRMADO — apenas /health |
| `diagnosticService.ts` | 🟢 CONFIRMADO — lógica real implementada |
| `mockLlmAdapter.ts` | 🟢 CONFIRMADO — implementação real |
| `shared` schemas | 🟢 CONFIRMADO — Zod schemas validados |
| Rota `/vehicle/identify` | 🔴 LACUNA — existe no plano, ausente no código |

---
*Gerado pelo Reversa Architect em 2026-05-03*
