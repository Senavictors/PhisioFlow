# Domínio — Patients

## Conceito

Paciente é o cadastro clínico central do PhysioFlow. Toda informação clínica futura depende de um `patientId` válido e sempre pertence ao `userId` do fisioterapeuta autenticado.

## Regras

1. Todo paciente pertence a exatamente um `userId`.
2. Listagens e buscas padrão consideram apenas pacientes ativos (`isActive = true`).
3. O e-mail do paciente deve ser único por fisioterapeuta entre pacientes ativos.
4. O prontuário base (`ClinicalRecord`) é opcional, mas quando existir pertence a um único paciente.
5. Arquivar um paciente não remove o registro do banco; apenas o tira do fluxo ativo.

## Estados e Transições

```
ATIVO -> [arquivar] -> ARQUIVADO
ARQUIVADO -> [fora do escopo atual] -> RESTAURADO
```

## Campos Críticos

| Campo            | Tipo           | Regra                                         |
| ---------------- | -------------- | --------------------------------------------- |
| `userId`         | string         | Isolamento multi-tenant obrigatório           |
| `name`           | string         | Obrigatório, mínimo de 2 caracteres           |
| `email`          | string \| null | Opcional, mas único por `userId` entre ativos |
| `classification` | enum           | Default `STANDARD`                            |
| `area`           | enum           | Obrigatório                                   |
| `isActive`       | boolean        | Soft delete do paciente                       |
| `patientId`      | string         | Relação 1:1 do prontuário base                |

## Casos de Borda

- Cadastro com campos clínicos vazios não deve criar `ClinicalRecord` vazio.
- Edição deve permitir limpar os campos do prontuário existente sem perder o vínculo.
- Datas de nascimento precisam ser tratadas como `date-only`, sem deslocamento por fuso.

## Limitações Conhecidas

- Ainda não existe fluxo de restauração para pacientes arquivados.
- Histórico de sessões e timeline clínica entram apenas na Phase 4+.

## ADR Relacionado

- [ADR-001](../decisions/ADR-001-tech-stack.md)
- [ADR-003](../decisions/ADR-003-auth-approach.md)
