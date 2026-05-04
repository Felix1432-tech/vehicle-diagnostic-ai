# C4 — Nível 2: Containers

> Atualizado em 2026-05-03. Baseado em código-fonte real.

```mermaid
C4Container
    title Vehicle Diagnostic Core — Diagrama de Containers

    Person(usuario, "Usuário / Mecânico", "Acessa via navegador")

    System_Boundary(vdc, "Vehicle Diagnostic Core") {
        Container(web, "@core/web", "React 18 + Vite 5 + Tailwind CSS 4 + TypeScript", "SPA servida via Vercel. Formulário de busca por placa, exibe resultado e diagnóstico inicial.")
        Container(api, "@core/api", "Fastify 5 + TypeScript + Node.js 22", "API REST hospedada no Render. Endpoint /health implementado. /vehicle/identify pendente de registro.")
        Container(shared, "@core/shared", "TypeScript + Zod 3", "Pacote interno de schemas e types. Importado por web e api via pnpm workspace.")
    }

    System_Ext(placaApi, "API de Placas", "Mock ou real (por PLATE_PROVIDER)")
    System_Ext(llmService, "Serviço LLM", "Mock interno / OpenAI futuro")

    Rel(usuario, web, "Usa", "HTTPS")
    Rel(web, api, "POST /vehicle/identify", "HTTP REST + JSON")
    Rel(web, shared, "Importa schemas e types", "pnpm workspace build")
    Rel(api, shared, "Importa schemas e types", "pnpm workspace build")
    Rel(api, placaApi, "Consulta placa", "HTTP (mock por ora)")
    Rel(api, llmService, "Gera diagnóstico", "LlmAdapter interface")
```

## Detalhamento dos Containers

### `@core/web` — Frontend SPA
- **Runtime:** Navegador (browser)
- **Build:** `vite build` → `apps/web/dist/`
- **Deploy:** Vercel CDN global
- **Env:** `VITE_API_BASE_URL` (injetado no build)
- **Estado:** Componente único `App.tsx` — validação client-side via Zod antes de chamar a API

### `@core/api` — Backend REST
- **Runtime:** Node.js 22 gerenciado pelo Render.com
- **Framework:** Fastify 5 com ESM nativo
- **Build:** `tsc` → `apps/api/dist/`
- **Deploy:** Render.com free tier
- **Porta:** injetada via `process.env.PORT` (padrão local: 3000)
- **Rotas implementadas:**
  - `GET /health` → `{ status: "ok" }` 🟢
  - `POST /vehicle/identify` → **não registrado** 🔴

### `@core/shared` — Pacote Compartilhado
- **Tipo:** Pacote interno do monorepo
- **Publicação:** Nunca publicado no npm — acesso via `workspace:*`
- **Exports:**
  - `.` → `index.ts` (re-exporta tudo)
  - `./schemas` → schemas Zod
  - `./types` → TypeScript types

## Escala de Confiança

| Container | Confiança | Observação |
|-----------|-----------|-----------|
| @core/web | 🟢 CONFIRMADO | App.tsx funcional, build configurado |
| @core/api | 🟡 PARCIAL | Server funciona, rota principal ausente |
| @core/shared | 🟢 CONFIRMADO | Schemas e types completos para o MVP |
| API de Placas real | 🔴 LACUNA | Factory de provider não implementada |
| LLM real | 🔴 LACUNA | Adapter mock, sem integração externa |

---
*Gerado pelo Reversa Architect em 2026-05-03*
