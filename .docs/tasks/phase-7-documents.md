# Task: Phase 7 — Central de Documentos

## Status
- [x] Todo
- [x] In Progress
- [x] Done

## Contexto
Com pacientes, sessões e evolução registrados, o fisioterapeuta precisa emitir documentos
clínicos formais: laudos, relatórios de progresso e declarações de comparecimento.
Hoje isso é feito manualmente, consumindo 30-40% do tempo burocrático do profissional.

A Central de Documentos automatiza a geração de PDFs a partir dos dados já cadastrados,
sem digitação adicional.

Tela de referência: `physioflow-design-system/project/ui_kits/portal/index.html`
→ aba "Documentos"

## Objetivo

Página `/documentos` listando documentos gerados. Modal/página de geração de novo documento
onde o fisioterapeuta seleciona o paciente, o tipo de documento e o período — e recebe um PDF
pronto para download ou impressão.

## Escopo

### Backend
- [ ] Migration: modelo `Document` no Prisma (ver abaixo)
- [ ] `POST /api/documents` — gerar e salvar referência do documento
- [ ] `GET /api/documents` — listar documentos do usuário (com filtro por paciente e tipo)
- [ ] `GET /api/documents/:id/download` — retorna o PDF gerado (stream ou signed URL)
- [ ] `DELETE /api/documents/:id` — soft delete
- [ ] Módulo `server/modules/documents/` (application, domain, http, infra)
- [ ] Engine de geração de PDF: `@react-pdf/renderer` (SSR-safe, sem dependência nativa)

### Frontend
- [ ] Página `/documentos` — lista de documentos com filtros por tipo e paciente
- [ ] Componente `DocumentCard` — linha com tipo, paciente, data e botão de download
- [ ] Modal/página `NovoDocumento` — formulário de seleção (paciente, tipo, período)
- [ ] Preview do documento antes do download (iframe ou modal PDF)

## Fora de Escopo
- Assinatura digital
- Envio por email diretamente do sistema
- Templates customizáveis pelo usuário (v1 usa templates fixos)
- Integração com planos de saúde

---

## Migration

```prisma
enum DocumentType {
  LAUDO_FISIOTERAPEUTICO
  RELATORIO_PROGRESSO
  DECLARACAO_COMPARECIMENTO
}

model Document {
  id         String       @id @default(cuid())
  userId     String
  patientId  String
  type       DocumentType
  title      String
  period     String?      // ex: "01/2026 – 04/2026"
  storagePath String?     // path no storage (v2) ou null se gerado on-demand
  isActive   Boolean      @default(true)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  user    User    @relation(fields: [userId], references: [id])
  patient Patient @relation(fields: [patientId], references: [id])

  @@index([userId])
  @@index([userId, patientId])
  @@index([userId, type])
}
```

---

## Contratos HTTP

```
POST /api/documents
Body: {
  patientId: string,
  type: DocumentType,
  period?: string
}
Response 201: { document: Document }

GET /api/documents?patientId=&type=&page=1&limit=20
Response 200: { documents: Document[], total: number }

GET /api/documents/:id/download
Response 200: PDF stream (Content-Type: application/pdf)
Errors: 401, 403, 404

DELETE /api/documents/:id
Response 200: {} (soft delete)
```

---

## Templates de Documentos

### Laudo Fisioterapêutico
```
Cabeçalho: logo PhysioFlow + nome/CRF do profissional
Paciente: nome, data nascimento, área terapêutica, classificação
Diagnóstico: mainComplaint + medicalHistory do ClinicalRecord
Evolução: últimas N sessões SOAP (assessment + plan)
Conclusão: plano de tratamento atual
Assinatura: nome + CRF + data
```

### Relatório de Progresso
```
Cabeçalho padrão
Paciente: dados básicos
Período: de [data] a [data]
Sessões realizadas no período: lista com datas e status
Resumo de evolução: campos SOAP das sessões realizadas
Conclusão: avaliação geral do período
```

### Declaração de Comparecimento
```
"Declaro que [nome do paciente], [dados], compareceu para atendimento
fisioterapêutico em [datas das sessões do período]."
Local e data de emissão
Assinatura
```

---

## UI — Spec

### Página `/documentos`

```
Header:
  Eyebrow: "CENTRAL"
  Título: "Documentos"
  Subtítulo: "Laudos, relatórios e declarações."
  CTA: "Novo documento" → abre modal/página de geração

Filtros: tipo (select) + paciente (select ou busca)

Lista de DocumentCards:
  - Ícone de tipo (FileText / FilePlus / FileCheck)
  - Título do documento
  - Nome do paciente + área
  - Data de geração
  - Badge de tipo
  - Botão "Download" (ícone Download)
  - Botão "Excluir" (ícone Trash, com confirmação)

Estado vazio: "Nenhum documento gerado ainda."
```

### Modal/Página de Geração

```
Título: "Gerar documento"
Campos:
  - Paciente (select com busca)
  - Tipo de documento (select: Laudo / Relatório / Declaração)
  - Período (date range picker, opcional)
Botão: "Gerar PDF"
→ gera, salva referência e abre download automático
```

---

## Checklist Final
- [ ] Migration aplicada com sucesso
- [ ] `POST /api/documents` gera PDF e salva referência
- [ ] `GET /api/documents/:id/download` retorna PDF correto
- [ ] Listagem filtra por tipo e paciente
- [ ] Os 3 templates renderizam com dados reais do banco
- [ ] Download funciona no browser (Chrome + Safari)
- [ ] Documentos isolados por `userId` (multi-tenant)
- [ ] `npm run build` passa sem erros
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (Phase 7 marcada como ✅)
- [ ] `.docs/CHANGELOG.md` atualizado

## Notas para Próxima Sessão
A geração de PDF é o diferencial percebido de maior valor para o fisioterapeuta.
Ao concluir, o sistema fecha o ciclo: cadastrar → atender → evoluir → documentar.
A Phase 8 (Logística Domiciliar) é incremental — melhora o fluxo de atendimentos HOME_CARE
que já existem no sistema, com campos e telas dedicados.
