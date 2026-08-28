---
estado: real
fonte: src/app/api, src/server/modules, src/lib/prisma.ts, vitest.config.ts
ultima-revisao: 2026-08-27 bootstrap-init
---

# Dependências

## Backend

```text
Route Handlers → HTTP/DTO → Use Cases → Domain/ports → Repositories Prisma → PostgreSQL
```

- **Permitido**: Route Handlers chamarem use cases; use cases usarem regras de domínio e interfaces/repositórios.
- **Proibido**: domínio depender de Next.js, Prisma, HTTP ou componentes.
- **Proibido**: frontend acessar Prisma ou banco diretamente.
- **Proibido**: pular a aplicação para implementar lógica clínica ou financeira no Route Handler.
- **Obrigatório**: ownership por `userId` derivado da sessão em toda operação clínica/financeira.

## Frontend

```text
Páginas/componentes → Route Handlers HTTP → Use Cases no servidor
```

- Componentes podem consumir os endpoints existentes e compartilhar primitives.
- Componentes não podem abrir conexão de banco, ler secrets server-side ou duplicar regras de negócio.

## Entre containers

```text
Navegador → Aplicação Next.js → Neon/Google/Gmail
```

- O navegador não acessa o banco nem credenciais de terceiros.
- Clientes Google e SMTP ficam nos componentes dedicados de integração.

## Contratos públicos

Endpoints e DTOs em `src/app/api/` e `src/server/modules/*/http/` formam o contrato entre UI e servidor. Mudanças incompatíveis devem ser registradas em `.agents/decisions/` e nos documentos correspondentes de `.docs/`/`docs/`.
