# Task: Phase 3 — CRM de Pacientes

## Status
- [ ] Todo
- [ ] In Progress
- [ ] Done

## Contexto
Core do produto. Todo o resto depende do cadastro de pacientes.
Todo paciente pertence ao `userId` do fisioterapeuta autenticado (multi-tenant).

## Objetivo
CRUD completo de pacientes com classificação, área terapêutica e prontuário base.

## Escopo
- [ ] Modelos `Patient` + `ClinicalRecord` no Prisma
- [ ] Migration
- [ ] `GET /api/patients` — listar com filtros
- [ ] `POST /api/patients` — criar
- [ ] `GET /api/patients/:id` — buscar com prontuário
- [ ] `PUT /api/patients/:id` — atualizar
- [ ] `DELETE /api/patients/:id` — arquivar (soft delete via `isActive`)
- [ ] Módulo: `server/modules/patients/` completo (application, domain, http, infra)
- [ ] Página `/patients` — listagem com cards e filtros
- [ ] Página `/patients/new` — formulário de cadastro
- [ ] Página `/patients/:id` — ficha clínica
- [ ] Validação Zod em todos os endpoints

## Fora de Escopo
- Upload de exames (Phase futura)
- Histórico de sessões na ficha (Phase 4)

## Modelos Prisma

```prisma
enum PatientClassification {
  ELDERLY
  PCD
  POST_ACCIDENT
  STANDARD
}

enum TherapyArea {
  PILATES
  MOTOR
  AESTHETIC
  HOME_CARE
}

model Patient {
  id             String                @id @default(cuid())
  userId         String
  name           String
  birthDate      DateTime?
  phone          String?
  email          String?
  classification PatientClassification @default(STANDARD)
  area           TherapyArea
  notes          String?
  isActive       Boolean               @default(true)
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt

  user           User                  @relation(fields: [userId], references: [id])
  clinicalRecord ClinicalRecord?
  sessions       Session[]
  documents      Document[]

  @@index([userId])
  @@index([userId, isActive])
}

model ClinicalRecord {
  id             String   @id @default(cuid())
  patientId      String   @unique
  mainComplaint  String?
  medicalHistory String?
  medications    String?
  allergies      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  patient Patient @relation(fields: [patientId], references: [id])
}
```

## Contratos HTTP

```
GET /api/patients?area=PILATES&classification=ELDERLY&search=João
Response 200: { patients: Patient[] }

POST /api/patients
Body: { name, birthDate?, phone?, email?, classification, area, notes? }
Response 201: { patient: Patient }

GET /api/patients/:id
Response 200: { patient: Patient & { clinicalRecord: ClinicalRecord } }

PUT /api/patients/:id
Body: Partial<Patient>
Response 200: { patient: Patient }

DELETE /api/patients/:id
Response 200: {} (soft delete: isActive = false)
```

## Checklist Final
- [ ] CRUD funciona via API (testar com curl ou Postman)
- [ ] Listagem com filtros renderiza no browser
- [ ] Ficha clínica abre com prontuário correto
- [ ] Pacientes isolados por `userId` (multi-tenant verificado)
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (Phase 3 marcada como ✅)
- [ ] `CHANGELOG.md` atualizado
- [ ] `.docs/domain/patients.md` criado
- [ ] `.docs/api/patients.md` criado

## Notas para Próxima Sessão
Ao concluir, a Phase 4 (Registro SOAP) pode começar. O `patientId` será a chave estrangeira de todas as entidades clínicas.
