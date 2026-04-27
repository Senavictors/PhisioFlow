# ADR-003: Estratégia de Autenticação

## Status

Aceito

## Contexto

PhysioFlow precisa de autenticação simples, sem OAuth de terceiros na v1. O objetivo é:

- Login/logout com email + senha
- Sessões server-side seguras
- Sem dependência de serviços externos de auth

## Decisão

- **Sessões server-side** via cookies HTTP-only assinados
- **Hash de senha** com bcrypt
- Sem JWT (evita complexidade de revogação)
- Middleware Next.js protege rotas `(app)/*`

Implementação manual (sem NextAuth) para manter controle total e evitar over-engineering na v1.

## Consequências

**Positivo:**

- Zero dependências externas de auth
- Total controle sobre o fluxo de sessão
- Simples de auditar e debugar

**Negativo:**

- Trabalho manual de implementar sessões
- Sem OAuth social (Google, etc.) na v1
- Escalar para múltiplos servidores requer sessões em Redis (fora de escopo v1)
