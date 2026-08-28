# Mapa da Documentação — PhysioFlow

Esta pasta é versionada e contém a documentação arquitetural complementar do PhysioFlow. Ela não substitui a documentação funcional existente em `.docs/`.

## Convenção de estado

Todo documento desta pasta, exceto os `README.md` de índice, tem frontmatter:

```yaml
estado: real | divergente | planejado
fonte: arquivos que sustentam o documento
ultima-revisao: task ou data
```

`real` descreve comportamento confirmado no código atual; `divergente` registra conflito entre documentação e comportamento; `planejado` descreve algo ainda não implementado.

## Fontes primárias

| Assunto | Fonte primária |
|---|---|
| Estado vivo e fases entregues | `.docs/CONTEXT.md` |
| Visão e fluxos de produto | `.docs/vision.md`, `.docs/tasks/` e `.docs/fisioterapia-areas.md` |
| Contratos de API existentes | `.docs/api/` e Route Handlers em `src/app/api/` |
| Regras de domínio existentes | `.docs/domain/` e módulos em `src/server/modules/` |
| Decisões funcionais históricas | `.docs/decisions/` |
| Arquitetura técnica transversal | esta pasta (`docs/`) |
| Estado, decisões e continuidade dos agentes | `.agents/` |

## Núcleo

1. [Arquitetura](architecture/README.md)
2. [Domínio](domain/README.md)
3. [Módulos](modules/README.md)
4. [API](api/README.md)
5. [Dados](data/README.md)
6. [Integrações](integrations/README.md)
7. [Diagramas](diagrams/README.md)

Nenhuma extensão opcional foi criada nesta inicialização. O design system sugere uma futura extensão `ui/`; requisitos formais de segurança/qualidade podem justificar `security/` ou `quality/` após confirmação do usuário.

## Fluxo de manutenção

Implementar funcionalidade: task em `.agents/tasks/` → módulo → API/dados → decisão → testes → atualização de documentação.

Corrigir bug: task → módulo → causa raiz → testes → documentação afetada → handoff, se necessário.
