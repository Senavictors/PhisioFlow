# PhysioFlow — Visão do Produto

## Problema

Fisioterapeutas modernos operam com ferramentas inadequadas:

- Prontuários em papel ou planilhas improvisadas
- Laudos criados do zero a cada emissão
- Sem visibilidade cronológica da evolução do paciente
- Atendimentos domiciliares sem sistema de logística
- Interface hospitalar fria que não representa a identidade da clínica

## Solução

PhysioFlow centraliza toda a operação clínica em uma única plataforma com interface editorial e acolhedora, automatizando a documentação e permitindo que o profissional foque no que importa: o paciente.

## Objetivos

1. Reduzir o tempo de documentação clínica em pelo menos 60%
2. Oferecer visibilidade completa da evolução de cada paciente
3. Automatizar a geração de laudos, relatórios e declarações
4. Suportar atendimentos domiciliares com logística integrada
5. Entregar uma experiência visual que diferencia o profissional

## Não-objetivos

- Faturamento/financeiro da clínica (fora de escopo)
- Integração com planos de saúde (fora de escopo na v1)
- App mobile nativo (web-first, responsivo)
- Telemedicina/videoconsulta

## Personas

### Primária — Fisioterapeuta Autônomo

- Atende 6-12 pacientes/dia em clínica própria ou locada
- Usa WhatsApp para agendamento e papel para prontuário
- Emite laudos manualmente 2-3x por semana
- Dor: burocracia que consome 30-40% do tempo de trabalho

### Secundária — Clínica com Múltiplos Profissionais

- 2-5 fisioterapeutas compartilhando espaço
- Precisa de separação de pacientes por terapeuta (multi-tenant)
- Dor: falta de padronização entre os profissionais

## Design System

### Tokens de Cor (OKLCH)

- `Background`: oklch(0.985 0.008 85) — Off-white quente
- `Primary`: oklch(0.52 0.05 160) — Verde Sálvia
- `Accent`: oklch(0.72 0.09 45) — Terracota suave

### Tipografia

- `Display`: Fraunces (serifada para títulos e KPIs)
- `Sans`: Plus Jakarta Sans (interface e leitura)

## Métricas de Sucesso

| Métrica                      | Meta          |
| ---------------------------- | ------------- |
| Tempo médio de registro SOAP | < 3 minutos   |
| Tempo de geração de laudo    | < 30 segundos |
| Pacientes por usuário ativo  | > 20          |
| Retenção (30 dias)           | > 70%         |
