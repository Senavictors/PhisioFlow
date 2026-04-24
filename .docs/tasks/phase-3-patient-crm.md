# Task: Phase 3 — CRM de Pacientes

## Status

- [ ] Todo
- [x] In Progress
- [ ] Done

## Contexto

Core do produto. Todo o resto depende do cadastro de pacientes.
Todo paciente pertence ao `userId` do fisioterapeuta autenticado (multi-tenant).

## Objetivo

CRUD completo de pacientes com classificação, área terapêutica e prontuário base.

## Escopo

- [x] Modelos `Patient` + `ClinicalRecord` no Prisma
- [x] Migration
- [x] `GET /api/patients` — listar com filtros
- [x] `POST /api/patients` — criar
- [x] `GET /api/patients/:id` — buscar com prontuário
- [x] `PUT /api/patients/:id` — atualizar
- [x] `DELETE /api/patients/:id` — arquivar (soft delete via `isActive`)
- [x] Módulo: `server/modules/patients/` completo (application, domain, http, infra)
- [x] Página `/patients` — listagem com cards e filtros
- [x] Página `/patients/new` — formulário de cadastro
- [x] Página `/patients/:id` — ficha clínica
- [x] Validação Zod em todos os endpoints

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

## Testes

Criar testes unitários para cada Use Case do módulo patients:

```
src/server/modules/patients/application/
  create-patient.test.ts   → valida criação, rejeita dados inválidos
  list-patients.test.ts    → filtra por userId, aplica filtros de area/classification
  get-patient.test.ts      → retorna 404 se não pertencer ao userId
```

Coberturas mínimas esperadas:

- `createPatient`: dados válidos, email duplicado, dados inválidos (Zod)
- `listPatients`: filtro por userId correto (multi-tenant)
- `getPatient`: paciente do userId correto, paciente de outro userId (deve lançar erro)

---

## Seed — Usuário Demo + Pacientes

Criar `prisma/seed.ts` com dados suficientes para testar o fluxo completo no browser.
As sessões serão adicionadas ao seed na Phase 4.

### Adicionar ao `package.json`

```json
"prisma": {
  "seed": "node --experimental-strip-types --loader ./prisma/ts-loader.mjs prisma/seed.ts"
}
```

### `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Limpa dados anteriores do demo (ordem importa por FK)
  await prisma.session.deleteMany({ where: { user: { email: 'demo@phisioflow.com' } } })
  await prisma.clinicalRecord.deleteMany({
    where: { patient: { user: { email: 'demo@phisioflow.com' } } },
  })
  await prisma.patient.deleteMany({ where: { user: { email: 'demo@phisioflow.com' } } })
  await prisma.user.deleteMany({ where: { email: 'demo@phisioflow.com' } })

  // Usuário demo
  const user = await prisma.user.create({
    data: {
      name: 'Dra. Ana Lima',
      email: 'demo@phisioflow.com',
      password: await bcrypt.hash('demo1234', 10),
    },
  })

  // Paciente 1 — Pilates, idosa
  const gervasio = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Gervasio Mendes',
      birthDate: new Date('1948-03-12'),
      phone: '(11) 99999-0001',
      classification: 'ELDERLY',
      area: 'PILATES',
      isActive: true,
      clinicalRecord: {
        create: {
          mainComplaint: 'Dor lombar crônica com irradiação para MMII.',
          medicalHistory: 'Hipertensão controlada. Sem cirurgias anteriores.',
          medications: 'Losartana 50mg/dia.',
          allergies: 'Sem alergias conhecidas.',
        },
      },
    },
  })

  // Paciente 2 — Estética, domiciliar
  const carla = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Carla Souza',
      birthDate: new Date('1985-07-22'),
      phone: '(11) 99999-0002',
      classification: 'STANDARD',
      area: 'AESTHETIC',
      isActive: true,
      clinicalRecord: {
        create: {
          mainComplaint: 'Fibromialgia com pontos de dor difusos.',
          medicalHistory: 'Diagnóstico de fibromialgia há 3 anos.',
          medications: 'Amitriptilina 25mg.',
          allergies: 'Dipirona.',
        },
      },
    },
  })

  // Paciente 3 — Fisioterapia motora, PCD, sem retorno recente
  const rafael = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Rafael Teixeira',
      birthDate: new Date('1972-11-05'),
      phone: '(11) 99999-0003',
      classification: 'PCD',
      area: 'MOTOR',
      isActive: true,
      clinicalRecord: {
        create: {
          mainComplaint: 'Limitação de ADM em joelho direito pós-cirurgia de LCA.',
          medicalHistory: 'Reconstrução do LCA há 6 meses.',
          medications: 'Sem medicação contínua.',
          allergies: 'Sem alergias.',
        },
      },
    },
  })

  console.log(`✅ Seed concluído`)
  console.log(`   Usuário demo: demo@phisioflow.com / demo1234`)
  console.log(`   Pacientes: ${gervasio.name}, ${carla.name}, ${rafael.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

### Como executar

```bash
npx prisma db seed
```

---

## Checklist Final

- [ ] CRUD funciona via API (testar com curl ou Postman)
- [ ] Listagem com filtros renderiza no browser
- [ ] Ficha clínica abre com prontuário correto
- [x] Pacientes isolados por `userId` (multi-tenant verificado)
- [x] `npm test` passa com todos os testes de patients
- [ ] `npx prisma db seed` popula o banco sem erros
- [ ] Login com `demo@phisioflow.com` / `demo1234` funciona e mostra os 3 pacientes
- [x] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (Phase 3 marcada como ✅)
- [x] `CHANGELOG.md` atualizado
- [x] `.docs/domain/patients.md` criado
- [x] `.docs/api/patients.md` criado

## Estado Atual

- Implementação local da phase 3 está pronta no código e validada com `npm run lint`, `npm test -- --run src/server/modules/patients/application` e `npm run build`
- Ainda falta validação integrada contra o banco real (`migrate` + `seed`) e teste manual no browser com o usuário demo

## Notas para Próxima Sessão

Ao concluir, a Phase 4 (Registro SOAP) pode começar. O `patientId` será a chave estrangeira de todas as entidades clínicas.
