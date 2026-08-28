# Tasks

Uma task por arquivo. O estado é comunicado pela pasta em que o arquivo está:

```text
backlog/ → active/ → completed/
                 ↘ blocked (ou um campo `status: blocked` no frontmatter)
```

Use `_template.md` como ponto de partida para uma task nova. As tasks históricas das fases do produto permanecem em `.docs/tasks/`.
