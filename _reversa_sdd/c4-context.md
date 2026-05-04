# C4 — Nível 1: Contexto

> Atualizado em 2026-05-03. Baseado em código-fonte real.

```mermaid
C4Context
    title Vehicle Diagnostic Core — Diagrama de Contexto

    Person(usuario, "Usuário / Mecânico", "Informa a placa do veículo e recebe diagnóstico inicial de possíveis falhas")

    System(vdc, "Vehicle Diagnostic Core", "Plataforma web de diagnóstico automotivo baseado em IA. Identifica o veículo pela placa e gera diagnóstico de possíveis falhas.")

    System_Ext(placaApi, "API de Placas", "Serviço externo que retorna dados do veículo a partir da placa. Atualmente operando em modo mock.")
    System_Ext(llm, "Serviço LLM", "Modelo de linguagem para geração de diagnósticos. Atualmente mock interno; pronto para OpenAI via adapter.")
    System_Ext(vercel, "Vercel", "CDN e hosting do frontend estático (apps/web)")
    System_Ext(render, "Render.com", "Hosting da API Node.js (apps/api), plano free")

    Rel(usuario, vdc, "Busca diagnóstico por placa", "HTTPS / browser")
    Rel(vdc, placaApi, "Consulta dados do veículo", "HTTP REST (mock)")
    Rel(vdc, llm, "Gera diagnóstico textual", "Adapter (mock → OpenAI futuro)")
    Rel(vdc, vercel, "Frontend servido via", "deploy estático")
    Rel(vdc, render, "API hospedada em", "Node.js gerenciado")
```

## Escala de Confiança

| Elemento | Confiança | Fonte |
|----------|-----------|-------|
| Usuário / Mecânico | 🟢 CONFIRMADO | App.tsx — formulário de busca por placa |
| Vehicle Diagnostic Core | 🟢 CONFIRMADO | Repositório real, monorepo pnpm |
| API de Placas (mock) | 🟢 CONFIRMADO | render.yaml `PLATE_PROVIDER=mock`, DEPLOY.md |
| Serviço LLM (mock) | 🟢 CONFIRMADO | mockLlmAdapter.ts existe e é usado |
| Vercel (web deploy) | 🟢 CONFIRMADO | vercel.json + DEPLOY.md |
| Render.com (api deploy) | 🟢 CONFIRMADO | render.yaml |
| Integração LLM real | 🔴 LACUNA | `OPENAI_API_KEY` declarado, sem uso |
| Integração Placas real | 🔴 LACUNA | `PLATE_PROVIDER` declarado, factory não implementada |

---
*Gerado pelo Reversa Architect em 2026-05-03*
