# Diagramas

O diagrama estrutural principal está em [`../architecture/containers.md`](../architecture/containers.md) e no mapa de dependências em [`../architecture/dependencies.md`](../architecture/dependencies.md).

## Fluxo estrutural

```mermaid
flowchart TD
  Browser[Navegador] --> Next[Aplicação Next.js]
  Next --> Routes[Route Handlers]
  Routes --> UseCases[Use Cases]
  UseCases --> Domain[Domínio]
  UseCases --> Repos[Repositórios Prisma]
  Repos --> Neon[(PostgreSQL Neon)]
  UseCases --> Google[Google Calendar]
  UseCases --> Gmail[Gmail SMTP]
```

Diagramas futuros devem apontar para configuração e código existentes e registrar divergências em vez de representar uma arquitetura desejada como real.
