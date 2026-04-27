# ADR-002: Estrutura SOAP para Evolução Clínica

## Status

Aceito

## Contexto

O padrão de evolução clínica mais adotado em fisioterapia é o método SOAP:

- **S**ubjetivo: queixa principal, como o paciente se sente
- **O**bjetivo: achados clínicos mensuráveis
- **A**valiação: análise clínica do fisioterapeuta
- **P**lano: condutas, procedimentos e próximos passos

## Decisão

Cada `Session` armazenará os 4 campos SOAP como texto livre:

```prisma
model Session {
  subjective  String?
  objective   String?
  assessment  String?
  plan        String?
}
```

Campos opcionais para permitir registro parcial durante o atendimento.

## Consequências

**Positivo:**

- Padrão reconhecido e aceito pela comunidade fisioterapêutica
- Texto livre dá liberdade clínica ao profissional
- Simples de implementar, fácil de exportar para PDF

**Negativo:**

- Sem campos estruturados, buscas por achados específicos são difíceis
- Futuro: considerar templates semiestruturados (ADR futuro)
