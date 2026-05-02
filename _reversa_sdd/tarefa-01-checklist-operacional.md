# Tarefa 01 - Checklist Operacional Executavel

**Referencia:** [_reversa_sdd/reconstruction-plan.md](</C:/Users/ACER_2025/claude free/_reversa_sdd/reconstruction-plan.md>)  
**ADR base:** [_reversa_sdd/adr-inicial.md](</C:/Users/ACER_2025/claude free/_reversa_sdd/adr-inicial.md>)  
**Objetivo:** criar a base oficial do monorepo com `pnpm`, `apps/web`, `apps/api` e `packages/shared`, incluindo padronizacao de TypeScript, lint, formatter, scripts e bootstrap local.

---

## Resultado esperado

Ao final desta tarefa, o repositorio deve ter:

- monorepo `pnpm`
- workspace com `apps/web`, `apps/api`, `packages/shared`
- frontend em `Vite + React + TypeScript + Tailwind`
- backend em `Fastify + TypeScript + Zod`
- configs iniciais de `TypeScript`, `ESLint` e `Prettier`
- scripts de `dev`, `build`, `lint`, `test` e `typecheck`
- ambiente local executavel em Windows/PowerShell

---

## Pre-requisitos

- `Node.js 20 LTS` instalado
- `pnpm` instalado globalmente
- `Git` instalado

### Verificacao rapida

```powershell
node -v
pnpm -v
git --version
```

Se `pnpm` nao estiver instalado:

```powershell
npm install -g pnpm
```

---

## Estrutura alvo

```text
apps/
  web/
  api/
packages/
  shared/
.editorconfig
.env.example
.eslintignore
.gitignore
.prettierignore
.prettierrc.json
eslint.config.js
package.json
pnpm-workspace.yaml
tsconfig.base.json
```

---

## Checklist operacional

### 1. Criar a raiz do monorepo

```powershell
New-Item -ItemType Directory -Force apps
New-Item -ItemType Directory -Force packages
pnpm init
```

### 2. Ajustar o `package.json` raiz

Substituir o arquivo raiz por este conteudo:

```json
{
  "name": "vehicle-diagnostic-core",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@10",
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "format": "prettier . --write"
  },
  "devDependencies": {
    "@eslint/js": "^9.26.0",
    "eslint": "^9.26.0",
    "globals": "^15.15.0",
    "prettier": "^3.5.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.31.0"
  }
}
```

### 3. Criar o workspace do `pnpm`

Criar `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 4. Criar `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "baseUrl": "."
  }
}
```

### 5. Criar `eslint.config.js`

```js
const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: ["dist", "build", "coverage", "node_modules"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      "no-console": "off"
    }
  }
);
```

### 6. Criar arquivos de formatação e ambiente

Criar `.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "none"
}
```

Criar `.prettierignore`:

```text
dist
build
coverage
node_modules
pnpm-lock.yaml
```

Criar `.eslintignore`:

```text
dist
build
coverage
node_modules
```

Criar `.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

Criar `.gitignore`:

```text
node_modules/
dist/
build/
coverage/
.turbo/
.env
.env.local
.env.*.local
pnpm-lock.yaml
```

Criar `.env.example`:

```dotenv
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/felix_ai
OPENAI_API_KEY=
PLATE_PROVIDER=mock
JWT_SECRET=
JWT_REFRESH_SECRET=
```

### 7. Instalar dependencias da raiz

```powershell
pnpm install
```

---

## Setup do `apps/web`

### 8. Criar app Vite React TS

```powershell
pnpm create vite apps/web --template react-ts
```

### 9. Instalar dependencias do frontend

```powershell
pnpm add react-router-dom @tanstack/react-query zustand zod -F web
pnpm add -D tailwindcss @tailwindcss/vite -F web
```

### 10. Ajustar `apps/web/package.json`

```json
{
  "name": "@core/web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "echo \"web tests pending\"",
    "typecheck": "tsc --noEmit"
  }
}
```

### 11. Ajustar `apps/web/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### 12. Configurar Tailwind no Vite

Atualizar `apps/web/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()]
});
```

Atualizar `apps/web/src/index.css`:

```css
@import "tailwindcss";

:root {
  color: #f8fafc;
  background: #0b1120;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #0b1120;
  color: #f8fafc;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
```

### 13. Criar bootstrap inicial do frontend

Substituir `apps/web/src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

Substituir `apps/web/src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="min-h-screen bg-[#0B1120] px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
          Core Platform
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Vehicle Diagnostic</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Base do monorepo criada com React, Vite, TypeScript e Tailwind.
        </p>
      </div>
    </main>
  );
}
```

---

## Setup do `apps/api`

### 14. Criar pasta da API

```powershell
New-Item -ItemType Directory -Force apps/api/src
```

### 15. Criar `apps/api/package.json`

```json
{
  "name": "@core/api",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "test": "echo \"api tests pending\"",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "dependencies": {
    "fastify": "^5.2.1",
    "zod": "^3.24.4",
    "dotenv": "^16.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3"
  }
}
```

### 16. Criar `apps/api/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["node"]
  },
  "include": ["src"]
}
```

### 17. Criar servidor Fastify inicial

Criar `apps/api/src/server.ts`:

```ts
import "dotenv/config";
import Fastify from "fastify";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3001)
});

const env = envSchema.parse(process.env);

const app = Fastify({
  logger: true
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "api",
    env: env.NODE_ENV
  };
});

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
```

---

## Setup do `packages/shared`

### 18. Criar pacote compartilhado

```powershell
New-Item -ItemType Directory -Force packages/shared/src
```

### 19. Criar `packages/shared/package.json`

```json
{
  "name": "@core/shared",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "eslint .",
    "test": "echo \"shared tests pending\"",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "dependencies": {
    "zod": "^3.24.4"
  }
}
```

### 20. Criar `packages/shared/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022"]
  },
  "include": ["src"]
}
```

### 21. Criar tipos compartilhados iniciais

Criar `packages/shared/src/index.ts`:

```ts
import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  env: z.string()
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
```

---

## Vincular workspaces

### 22. Adicionar dependencias internas

```powershell
pnpm add @core/shared@workspace:* -F web
pnpm add @core/shared@workspace:* -F api
pnpm install
```

---

## Scripts finais esperados

### Raiz

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
- `pnpm format`

### Web

- `pnpm --filter @core/web dev`
- `pnpm --filter @core/web build`

### API

- `pnpm --filter @core/api dev`
- `pnpm --filter @core/api build`

### Shared

- `pnpm --filter @core/shared build`

---

## Passo a passo para rodar localmente

### 1. Instalar dependencias

```powershell
pnpm install
```

### 2. Subir a API

Em um terminal:

```powershell
pnpm --filter @core/api dev
```

API esperada em:

```text
http://localhost:3001/health
```

### 3. Subir o frontend

Em outro terminal:

```powershell
pnpm --filter @core/web dev
```

Frontend esperado em:

```text
http://localhost:5173
```

### 4. Rodar ambos em paralelo

```powershell
pnpm dev
```

### 5. Validar build local

```powershell
pnpm build
pnpm typecheck
pnpm lint
```

---

## Validacao de conclusao da Tarefa 01

Marque a Tarefa 01 como concluida somente quando:

- a estrutura do monorepo existir conforme a ADR
- `pnpm install` funcionar sem erros
- `apps/web` subir localmente
- `apps/api` responder em `/health`
- `packages/shared` estiver importavel por `web` e `api`
- `pnpm build`, `pnpm lint` e `pnpm typecheck` funcionarem na raiz

---

## Proximo passo recomendado

Apos concluir esta tarefa, seguir para:

- `Tarefa 02 - Schema do Banco de Dados`
- `Tarefa 03 - ConfigManagementService e Configuracoes Operacionais`
