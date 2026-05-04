# API Server — `@core/api`

> Spec SDD gerada pelo Reversa Writer em 2026-05-03.
> Nivel de documentacao: **detalhado**.

---

## Visao Geral

Servidor HTTP minimalista construido com Fastify 5 que serve como ponto de entrada da API REST do Vehicle Diagnostic Core. Atualmente expoe apenas o endpoint de health check; a rota principal de identificacao de veiculos (`POST /vehicle/identify`) **nao esta registrada**, apesar de o servico de diagnostico estar implementado.

## Responsabilidades

| Responsabilidade | Prioridade | Justificativa |
|-----------------|-----------|---------------|
| Inicializar instancia Fastify e bind de porta | **Must** | Sem isso nenhum endpoint e acessivel 🟢 |
| Expor `GET /health` para monitoramento | **Must** | Unico endpoint funcional — necessario para health checks do Render.com 🟢 |
| Registrar `POST /vehicle/identify` | **Must** | Rota principal do sistema — **nao implementada** 🔴 |
| Configurar CORS para aceitar requests do frontend | **Should** | Frontend em dominio diferente (Vercel) precisa de CORS — **nao implementado** 🔴 |
| Log de erros em startup | **Should** | Implementado via `catch` no `listen` 🟢 |

## Interface

### Endpoints

#### `GET /health` 🟢

| Aspecto | Valor |
|---------|-------|
| Metodo | `GET` |
| Path | `/health` |
| Autenticacao | Nenhuma |
| Request body | Nenhum |
| Response `200` | `{ "status": "ok" }` |
| Content-Type | `application/json` (default Fastify) |

**Nota:** A resposta atual retorna apenas `{ status: "ok" }` sem os campos `service` e `env` definidos em `healthResponseSchema` do `@core/shared`. O schema espera `{ status: "ok", service: string, env: string }`. Ha uma **divergencia** entre o contrato compartilhado e a implementacao real. 🟡

#### `POST /vehicle/identify` 🔴 NAO REGISTRADA

| Aspecto | Valor esperado |
|---------|---------------|
| Metodo | `POST` |
| Path | `/vehicle/identify` |
| Request body | `{ "plate": "ABC1234" }` — validado por `identifyVehicleRequestSchema` |
| Response `200` | `{ plate, brand, model, year, diagnostic }` — conforme `identifyVehicleResponseSchema` |
| Response `400` | Placa invalida |
| Response `404` | Veiculo nao encontrado |

**Status:** O frontend (`App.tsx:31`) faz `fetch POST /vehicle/identify`, mas `server.ts` nao registra esta rota. Resultado em producao: **404**. O `diagnosticService.ts` contem a logica que deveria ser chamada por este endpoint, mas o wiring esta ausente. 🔴

### Configuracao de Porta

```typescript
const port = Number(process.env.PORT) || 3000;
app.listen({ port, host: "0.0.0.0" });
```

- Variavel de ambiente `PORT` define a porta 🟢
- Fallback para `3000` se `PORT` nao estiver definida 🟢
- Bind em `0.0.0.0` — aceita conexoes de qualquer interface (necessario para containers/Render) 🟢

## Regras de Negocio

- **RN-01:** Servidor deve iniciar e escutar na porta configurada via `PORT` ou `3000` 🟢
- **RN-02:** Health check deve retornar `{ status: "ok" }` para monitoramento externo 🟢
- **RN-03:** Erro em startup deve ser logado e processo encerrado com `exit(1)` 🟢
- **RN-04:** Rota `/vehicle/identify` deve validar placa, identificar veiculo e retornar diagnostico 🔴 LACUNA

## Fluxo Principal

1. `server.ts` importa Fastify e cria instancia `app` 🟢
2. Registra handler para `GET /health` → retorna `{ status: "ok" }` 🟢
3. Le `PORT` do environment (ou usa `3000`) 🟢
4. Chama `app.listen({ port, host: "0.0.0.0" })` 🟢
5. Em sucesso: loga "Servidor rodando na porta ${port}" 🟢
6. Em falha: loga erro e encerra com `process.exit(1)` 🟢

## Fluxos Alternativos

- **Porta ocupada:** Fastify lanca erro → `catch` loga e faz `process.exit(1)` 🟢
- **`PORT` nao e numero valido:** `Number(undefined)` retorna `NaN`, `NaN || 3000` = `3000` → fallback funciona 🟢
- **`PORT` e string vazia:** `Number("")` retorna `0`, `0 || 3000` = `3000` → fallback funciona 🟢
- **Request para rota inexistente:** Fastify retorna 404 automaticamente com payload JSON padrao 🟢
- **Request `POST /vehicle/identify`:** Retorna 404 — rota nao registrada 🔴

## Dependencias

| Dependencia | Tipo | Versao | Motivo |
|------------|------|--------|--------|
| `fastify` | runtime | 5.2 | Framework HTTP 🟢 |
| `@types/node` | dev | 22 | Tipagem para `process.env`, `process.exit` 🟢 |
| TypeScript | dev | 5.8 | Compilacao 🟢 |

**Dependencias ausentes (necessarias para completar o sistema):**
- `@core/shared` — schemas para validar request/response na rota `/vehicle/identify` 🔴
- `@fastify/cors` — middleware CORS para aceitar requests cross-origin do frontend 🔴

**Dependentes:**
- `@core/web` (`App.tsx`) — consome `GET /health` (implicitamente) e `POST /vehicle/identify` (quebrado) 🟢

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Health check endpoint para monitoramento externo | `server.ts:5-7` — `GET /health` | 🟢 |
| Resiliencia | Tratamento de erro em startup com encerramento graceful | `server.ts:15-17` — `catch` + `process.exit(1)` | 🟢 |
| Portabilidade | Bind em `0.0.0.0` para deploys em container | `server.ts:12` — `host: "0.0.0.0"` | 🟢 |
| Configurabilidade | Porta configuravel via variavel de ambiente | `server.ts:9` — `process.env.PORT` | 🟢 |
| Seguranca | CORS nao configurado — frontend em dominio diferente nao consegue acessar | ausencia em `server.ts` | 🔴 |

## Criterios de Aceitacao

```gherkin
Cenario: Health check retorna status ok
  Dado o servidor rodando na porta configurada
  Quando uma requisicao GET e feita para /health
  Entao a resposta tem status HTTP 200
  E o body contem { "status": "ok" }

Cenario: Servidor inicia na porta do environment
  Dado que a variavel PORT esta definida como "4000"
  Quando o servidor e iniciado
  Entao ele escuta na porta 4000
  E loga "Servidor rodando na porta 4000"

Cenario: Servidor usa porta padrao quando PORT nao existe
  Dado que a variavel PORT nao esta definida
  Quando o servidor e iniciado
  Entao ele escuta na porta 3000

Cenario: Erro de startup encerra o processo
  Dado que a porta 3000 ja esta em uso
  Quando o servidor tenta iniciar
  Entao o erro e logado no console
  E o processo encerra com codigo 1

Cenario: Rota inexistente retorna 404
  Dado o servidor rodando
  Quando uma requisicao GET e feita para /rota-inexistente
  Entao a resposta tem status HTTP 404

Cenario: POST /vehicle/identify retorna 404 (gap atual)
  Dado o servidor rodando
  Quando uma requisicao POST e feita para /vehicle/identify
  Entao a resposta tem status HTTP 404
  E isto e um BUG — a rota deveria estar registrada
```

## Cenarios de Borda

### Cenario 1: Variavel PORT com valor nao-numerico

**Contexto:** `PORT` definida como `"abc"` ou `"not-a-port"`.
**Comportamento atual:** `Number("abc")` retorna `NaN`. `NaN || 3000` avalia para `3000` (falsy). O servidor inicia na porta 3000. 🟢
**Impacto:** Nenhum crash, mas configuracao invalida e silenciosamente ignorada. Nao ha log avisando que o fallback foi usado.
**Recomendacao:** Adicionar log de warning quando `PORT` e definida mas invalida. 🟡

### Cenario 2: Multiplas instancias no mesmo host

**Contexto:** Dois processos do servidor tentam bind na mesma porta.
**Comportamento atual:** O segundo processo falha com `EADDRINUSE`. O `catch` em `server.ts:15` captura o erro, loga e faz `process.exit(1)`. 🟢
**Impacto:** O segundo processo morre corretamente. O Render.com reinicia automaticamente (se configurado).
**Risco:** Nenhum — comportamento correto para ambiente de deploy single-instance. 🟢

## Rastreabilidade de Codigo

| Arquivo | Funcao / Elemento | Cobertura |
|---------|-------------------|-----------|
| `apps/api/src/server.ts:1` | `import Fastify` — instanciacao | 🟢 |
| `apps/api/src/server.ts:3` | `const app = Fastify()` — criacao da instancia | 🟢 |
| `apps/api/src/server.ts:5-7` | `app.get("/health")` — handler do health check | 🟢 |
| `apps/api/src/server.ts:9` | `const port = Number(process.env.PORT) \|\| 3000` — configuracao de porta | 🟢 |
| `apps/api/src/server.ts:11-18` | `app.listen().then().catch()` — startup e error handling | 🟢 |

---

## Gap Critico

```
┌─────────────────────────────────────────────────┐
│  ROTA POST /vehicle/identify NAO REGISTRADA     │
│                                                 │
│  Frontend (App.tsx:31) chama esta rota.          │
│  diagnosticService.ts implementa a logica.      │
│  server.ts NAO conecta os dois.                 │
│                                                 │
│  Resultado: 404 em producao.                    │
│  Prioridade: MUST FIX                           │
└─────────────────────────────────────────────────┘
```

---
*Gerado pelo Reversa Writer em 2026-05-03*
