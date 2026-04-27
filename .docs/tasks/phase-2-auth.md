# Task: Phase 2 — Auth

## Status

- [x] Todo
- [x] In Progress
- [x] Done

## Contexto

Com a fundação pronta (Phase 1), precisamos de autenticação antes de qualquer feature clínica.

ADR relacionado: [ADR-003](../decisions/ADR-003-auth-approach.md)

## Objetivo

Sistema de login/logout funcional com sessões server-side. Rotas `(app)/*` protegidas.

## Escopo

- [ ] Instalar `bcrypt` e `iron-session` (ou cookie assinado manual)
- [ ] Endpoint `POST /api/auth/register`
- [ ] Endpoint `POST /api/auth/login`
- [ ] Endpoint `POST /api/auth/logout`
- [ ] Sessão server-side via cookie HTTP-only
- [ ] Middleware Next.js protegendo `(app)/*`
- [ ] Helper `getSession()` para uso em Route Handlers
- [ ] Página de login com formulário validado (Zod)
- [ ] Página de registro com formulário validado (Zod)
- [ ] Redirect automático: não autenticado → `/login`, autenticado → `/dashboard`

## Fora de Escopo

- OAuth social
- Recuperação de senha
- Perfil/configurações do usuário

## Contratos HTTP

```
POST /api/auth/register
Body: { name: string, email: string, password: string }
Response 201: { id: string, email: string, name: string }
Errors: 409 (email já existe), 400 (validação Zod)

POST /api/auth/login
Body: { email: string, password: string }
Response 200: { id: string, email: string, name: string }
Side effect: seta cookie de sessão HTTP-only
Errors: 401 (credenciais inválidas)

POST /api/auth/logout
Response 200: {}
Side effect: limpa cookie de sessão
```

## Migration

Sem migration nova — modelo `User` já existe da Phase 1.

## UI

- [ ] `/login` — Formulário email + senha, link para registro
- [ ] `/register` — Formulário nome + email + senha, link para login

## Checklist Final

- [ ] Register e login funcionam no browser
- [ ] Cookie HTTP-only é setado no login (verificar DevTools)
- [ ] Middleware bloqueia `/dashboard` sem sessão → redirect `/login`
- [ ] Redirect correto após login (→ `/dashboard`) e logout (→ `/login`)
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (Phase 2 marcada como ✅)
- [ ] `CHANGELOG.md` atualizado

## Notas para Próxima Sessão

Ao concluir, a Phase 3 (CRM de Pacientes) pode começar. O helper `getSession()` será usado em todos os Route Handlers subsequentes para pegar o `userId` autenticado.
