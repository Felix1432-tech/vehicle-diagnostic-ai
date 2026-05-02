# Deploy Prep

## Web

- Plataforma alvo: `Vercel`
- Root directory: `apps/web`
- Build command: `pnpm --filter @core/web build`
- Output directory: `apps/web/dist`
- Variavel obrigatoria:
  - `VITE_API_BASE_URL=https://your-render-api.onrender.com`

## API

- Plataforma alvo: `Render`
- Arquivo base: [render.yaml](./render.yaml)
- Build command:
  - `pnpm install --no-frozen-lockfile && pnpm --filter @core/api build`
- Start command:
  - `pnpm --filter @core/api start`

## Envs

Copiar como base:

- [\.env.example](./.env.example) para desenvolvimento
- [\.env.production.example](./.env.production.example) para produção

## Observacoes

- O frontend usa proxy local apenas em desenvolvimento.
- Em produção, o frontend usa `VITE_API_BASE_URL`.
- A API continua mock para `PLATE_PROVIDER=mock` e adapter de IA mock, sem integrações externas ativas.
