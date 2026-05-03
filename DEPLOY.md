# Deploy Prep

## Web

- Plataforma alvo: `Vercel`
- Root directory: raiz do repositório
- Configuração: [vercel.json](./vercel.json)
- Build command: `pnpm --filter @core/shared build && pnpm --filter @core/web build`
- Output directory: `apps/web/dist`
- Variavel obrigatoria:
  - `VITE_API_BASE_URL=https://your-render-api.onrender.com`

## API

- Plataforma alvo: `Render`
- Arquivo base: [render.yaml](./render.yaml)
- Build command:
  - `pnpm install --no-frozen-lockfile && pnpm --filter @core/shared build && pnpm --filter @core/api build`
- Start command:
  - `pnpm --filter @core/api start`
- Variavel obrigatoria:
  - `CORS_ORIGIN=https://your-vercel-app.vercel.app`
  - `PORT` não deve ser fixada manualmente no Render; a plataforma injeta esse valor

## Envs

Copiar como base:

- [\.env.example](./.env.example) para desenvolvimento
- [\.env.production.example](./.env.production.example) para produção

## Observacoes

- O frontend usa proxy local apenas em desenvolvimento.
- Em produção, o frontend usa `VITE_API_BASE_URL`.
- Em produção, a API precisa de `CORS_ORIGIN` apontando para o domínio do frontend na Vercel.
- A API continua mock para `PLATE_PROVIDER=mock` e adapter de IA mock, sem integrações externas ativas.
- O backend já usa `process.env.PORT` com fallback local `3001`; em produção no Render a porta vem da própria plataforma.
