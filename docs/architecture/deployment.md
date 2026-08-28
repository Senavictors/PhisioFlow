---
estado: real
fonte: package.json, next.config.ts, prisma.config.ts, .env.example, README.md
ultima-revisao: 2026-08-27 bootstrap-init
---

# Implantação

O código é um aplicativo Next.js executável localmente com `next dev`/`next start`. O README declara Vercel como destino, mas não há `vercel.json` ou pipeline de deploy versionado; a configuração efetiva do ambiente hospedado precisa ser validada antes de uma publicação.

## Processos/serviços

| Serviço | Processo | Porta | Path público | Env relevantes |
|---|---|---|---|---|
| Aplicação | `npm run dev` ou `npm run start` | padrão do Next.js | `/` | `SESSION_SECRET`, `DATABASE_URL`, envs Google/integração |
| Banco | PostgreSQL hospedado | externo | não público pela aplicação | `DATABASE_URL` |

## Variáveis de ambiente relevantes

- `DATABASE_URL` — conexão PostgreSQL usada pelo Prisma.
- `SESSION_SECRET` — segredo da sessão HTTP-only.
- `INTEGRATION_ENCRYPTION_KEY` — chave de 32 bytes em base64 para tokens de integração.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI` — OAuth do Google Calendar.

## Boot da aplicação

1. `next dev` ou `next start` inicializa a aplicação Next.js.
2. `src/proxy.ts` protege rotas autenticadas usando a sessão existente.
3. O acesso ao banco é aberto sob demanda pelo cliente Prisma configurado em `src/lib/prisma.ts`.
4. Migrations não são aplicadas automaticamente pelo script de start; `npx prisma migrate deploy` é uma operação explícita.

## Armazenamento de arquivos

PDFs são gerados on-demand por `src/lib/pdf/render.ts`; `Document.storagePath` permanece nulo na v1 e não há bucket ou volume persistente configurado no repositório.

## Observabilidade

Não há configuração de logging estruturado, tracing ou alertas dedicada versionada. Essa ausência é uma limitação conhecida, não uma promessa de observabilidade disponível.

## Divergência conhecida

`README.md` e `.docs/CONTEXT.md` tratam Vercel como destino/preparação de deploy, mas não existe configuração de provider no repositório. A topologia definitiva de produção permanece pendente de validação operacional.
