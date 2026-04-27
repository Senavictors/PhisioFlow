import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
})

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
})

// =============================================================================
// Helpers de data
// =============================================================================

const NOW = new Date()

function at(days: number, hour: number, minute = 0): Date {
  const d = new Date(NOW)
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

const daysAgo = (days: number, hour: number, minute = 0) => at(-days, hour, minute)
const daysFromNow = (days: number, hour: number, minute = 0) => at(days, hour, minute)

// =============================================================================
// Bibliotecas SOAP — variedade realista por área
// =============================================================================

const SOAP_LIBRARY = {
  ORTOPEDICA: [
    {
      subjective:
        'Paciente refere dor lombar leve (EVA 3/10) ao final do dia, sem irradiação. Sente melhora desde a última sessão.',
      objective:
        'Lasègue negativo bilateral. Mobilidade lombar 75% do esperado. Ativação de transverso satisfatória.',
      assessment: 'Evolução clínica favorável. Manter conduta atual.',
      plan: 'Progredir prancha lateral 30s × 3 e ponte unipodal. Orientar pausas posturais no trabalho.',
    },
    {
      subjective: 'Sem queixas álgicas em repouso. Dor moderada ao carregar peso (EVA 5/10).',
      objective:
        'Força flexores de tronco 4/5. Amplitude de quadril em rotação interna reduzida à direita.',
      assessment: 'Padrão de compensação por encurtamento de cadeia posterior.',
      plan: 'Liberação miofascial em isquiotibiais e glúteo médio. Exercício de mobilidade torácica.',
    },
    {
      subjective: 'Refere rigidez matinal de 15 minutos. Boa adesão aos exercícios domiciliares.',
      objective:
        'ADM lombar completa em flexão. Teste de Schober 5,5 cm. Sem sinais inflamatórios.',
      assessment: 'Manutenção funcional satisfatória.',
      plan: 'Espaçar sessões para quinzenal. Manter programa domiciliar.',
    },
  ],
  ESPORTIVA: [
    {
      subjective: 'Tolerou bem o treino. Confiança aumentada para subir e descer escadas.',
      objective:
        'ADM de joelho em 125°. Edema ausente. Salto unipodal 80% comparado ao lado contralateral.',
      assessment: 'Boa progressão pós-LCA. Liberar atividades funcionais com cautela.',
      plan: 'Avançar agachamento unipodal assistido + treino pliométrico de baixa intensidade.',
    },
    {
      subjective: 'Sem dor. Refere segurança aumentada nos movimentos do dia a dia.',
      objective: 'Teste de salto horizontal: 85% comparado ao lado saudável. Hop test estável.',
      assessment: 'Pronto para iniciar fase de retorno ao esporte.',
      plan: 'Iniciar sprints curtos e mudanças de direção controladas. Reavaliar em 4 semanas.',
    },
  ],
  PELVICA: [
    {
      subjective:
        'Refere melhora dos sintomas de incontinência ao esforço. Boa percepção do períneo.',
      objective:
        'Contração perineal grau 3/5 (Oxford). Coordenação respiração-períneo presente.',
      assessment: 'Evolução positiva. Manter conduta.',
      plan: 'Progressão para hipopressivos e treino funcional em pé.',
    },
    {
      subjective: 'Gestante de 30 semanas. Refere dor lombar baixa ao caminhar.',
      objective:
        'Postura com aumento de lordose lombar. Diástase abdominal 1,5 cm. Períneo funcional.',
      assessment: 'Adaptações posturais típicas do 3º trimestre.',
      plan: 'Mobilidade pélvica em quatro apoios. Orientação postural e respiração diafragmática.',
    },
  ],
  ESTETICA: [
    {
      subjective: 'Paciente satisfeita com resultado da drenagem. Refere sensação de leveza.',
      objective:
        'Redução visível de retenção em membros inferiores. Pele com melhor turgor e textura.',
      assessment: 'Resposta positiva ao protocolo de 5 sessões.',
      plan: 'Manter sessão semanal por mais 4 semanas. Orientar hidratação e atividade física leve.',
    },
    {
      subjective: 'Refere dor leve em região cervical posterior antes da sessão.',
      objective: 'Pontos-gatilho ativos em trapézio superior bilateral. Mobilidade cervical preservada.',
      assessment: 'Tensão muscular crônica de origem postural.',
      plan: 'Liberação miofascial + ventosaterapia. Orientação de pausas no trabalho.',
    },
  ],
  NEUROLOGICA: [
    {
      subjective:
        'Familiar relata melhora no equilíbrio durante as transferências. Paciente colaborativo.',
      objective:
        'Hemiparesia residual à direita grau 3/5. Marcha com bengala em pequenas distâncias. Berg 38/56.',
      assessment: 'Progresso lento porém consistente após 3 meses pós-AVC.',
      plan: 'Treino de marcha com obstáculos. Exercícios de dissociação de cinturas. Reavaliar Berg em 30 dias.',
    },
  ],
  CARDIORESPIRATORIA: [
    {
      subjective: 'Paciente refere menos cansaço ao subir escadas. Tosse produtiva matinal.',
      objective: 'SpO2 96% em repouso. Borg 3/10 ao final da sessão. Ausculta com roncos difusos.',
      assessment: 'Boa adesão ao plano respiratório. Manutenção da função.',
      plan: 'Progredir caminhada para 20 minutos diários. Manter higiene brônquica.',
    },
  ],
  PEDIATRICA: [
    {
      subjective: 'Mãe relata que a criança está mais ativa e participando das aulas de educação física.',
      objective:
        'ADM de tornozelo em dorsiflexão 15°. Marcha sem claudicação. Salto bipodal preservado.',
      assessment: 'Evolução excelente pós-fratura de tíbia. Próxima a alta funcional.',
      plan: 'Treino proprioceptivo em superfícies instáveis. Liberar atividades esportivas leves.',
    },
  ],
  PREVENTIVA: [
    {
      subjective: 'Refere postura sedentária prolongada no home office. Sem queixas álgicas.',
      objective: 'Anteriorização de cabeça leve. Encurtamento de peitoral menor bilateral.',
      assessment: 'Prevenção postural com excelente adesão.',
      plan: 'Programa de mobilidade torácica e fortalecimento de fixadores de escápula 3×/semana.',
    },
  ],
} as const

function pickSoap(area: keyof typeof SOAP_LIBRARY, idx = 0) {
  const items = SOAP_LIBRARY[area]
  return items[idx % items.length]
}

// =============================================================================
// Limpeza
// =============================================================================

async function cleanup(demoEmail: string) {
  await prisma.payment.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.calendarEventLink.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.emailMessage.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.session.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.treatmentPlan.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.calendarConnection.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.clinicalRecord.deleteMany({
    where: { patient: { user: { email: demoEmail } } },
  })
  await prisma.document.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.patient.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.workplace.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.emailSettings.deleteMany({ where: { user: { email: demoEmail } } })
  await prisma.user.deleteMany({ where: { email: demoEmail } })
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const demoEmail = 'demo@phisioflow.com'
  const demoPassword = 'demo1234'

  await cleanup(demoEmail)

  // ---------------------------------------------------------------------------
  // Usuário
  // ---------------------------------------------------------------------------

  const user = await prisma.user.create({
    data: {
      name: 'Dra. Ana Lima',
      email: demoEmail,
      password: await bcrypt.hash(demoPassword, 12),
    },
  })

  // ---------------------------------------------------------------------------
  // Locais de trabalho (3)
  // ---------------------------------------------------------------------------

  const clinica = await prisma.workplace.create({
    data: {
      userId: user.id,
      name: 'Clínica Movimento',
      kind: 'OWN_CLINIC',
      defaultAttendanceType: 'CLINIC',
      defaultSessionPrice: 180,
      address: 'Rua das Flores, 120 — Pinheiros, São Paulo',
      notes: 'Consultório principal com sala de Pilates e equipamentos completos.',
    },
  })

  const parceira = await prisma.workplace.create({
    data: {
      userId: user.id,
      name: 'Clínica Vital Parceira',
      kind: 'PARTNER_CLINIC',
      defaultAttendanceType: 'CLINIC',
      defaultSessionPrice: 200,
      defaultCommissionPct: 30,
      address: 'Av. Paulista, 1500 — Bela Vista, São Paulo',
      notes: 'Atendimentos parceiros com comissão de 30% para a clínica.',
    },
  })

  const particular = await prisma.workplace.create({
    data: {
      userId: user.id,
      name: 'Atendimento Particular',
      kind: 'PARTICULAR',
      defaultAttendanceType: 'HOME_CARE',
      defaultSessionPrice: 250,
      notes: 'Visitas domiciliares e atendimentos online.',
    },
  })

  // ---------------------------------------------------------------------------
  // Pacientes (10)
  // ---------------------------------------------------------------------------

  const gervasio = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Gervásio Mendes',
      birthDate: new Date('1948-03-12T00:00:00.000Z'),
      phone: '(11) 99201-0001',
      email: 'gervasio.mendes@exemplo.com',
      classification: 'ELDERLY',
      notes: 'Paciente com excelente adesão. Prefere atendimentos no início da manhã.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Dor lombar crônica com irradiação ocasional para coxa direita.',
          medicalHistory: 'Hipertensão controlada há 15 anos. Sem cirurgias prévias.',
          medications: 'Losartana 50mg/dia. AAS 100mg/dia.',
          allergies: 'Sem alergias conhecidas.',
        },
      },
    },
  })

  const carla = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Carla Souza',
      birthDate: new Date('1985-07-22T00:00:00.000Z'),
      phone: '(11) 99202-0002',
      email: 'carla.souza@exemplo.com',
      classification: 'STANDARD',
      notes: 'Prefere período da manhã. Trabalha em home office.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Fibromialgia com pontos de dor difusos e fadiga crônica.',
          medicalHistory: 'Diagnóstico de fibromialgia há 3 anos. Acompanhamento reumatológico ativo.',
          medications: 'Amitriptilina 25mg ao deitar. Pregabalina 75mg 2×/dia.',
          allergies: 'Dipirona.',
        },
      },
    },
  })

  const rafael = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Rafael Teixeira',
      birthDate: new Date('1972-11-05T00:00:00.000Z'),
      phone: '(11) 99203-0003',
      email: 'rafael.teixeira@exemplo.com',
      classification: 'POST_ACCIDENT',
      notes: 'Atleta amador retornando aos treinos pós cirurgia de LCA.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Limitação funcional em joelho direito pós-reconstrução de LCA.',
          medicalHistory:
            'Cirurgia de reconstrução do LCA (enxerto de tendão patelar) há 6 meses.',
          medications: 'Sem medicação contínua.',
          allergies: 'Sem alergias.',
        },
      },
    },
  })

  const mariana = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Mariana Albuquerque',
      birthDate: new Date('1992-02-18T00:00:00.000Z'),
      phone: '(11) 99204-0004',
      email: 'mariana.albuquerque@exemplo.com',
      classification: 'STANDARD',
      notes: 'Gestante (30ª semana). Foco em preparação para o parto.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Dor lombar baixa relacionada à gestação.',
          medicalHistory: 'Primeira gestação. Acompanhamento obstétrico regular.',
          medications: 'Suplementação de ferro e ácido fólico.',
          allergies: 'Sem alergias conhecidas.',
        },
      },
    },
  })

  const joaquim = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Joaquim Pereira',
      birthDate: new Date('1955-09-04T00:00:00.000Z'),
      phone: '(11) 99205-0005',
      classification: 'ELDERLY',
      notes: 'Paciente acamado em fase inicial. Acompanhante: filha (Marta).',
      address: 'Rua Cardeal Arcoverde, 850 — Pinheiros, São Paulo',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      homeCarePriority: 'URGENT',
      homeCareNotes:
        'Portão azul. Apartamento 14B. Filha Marta atende campainha. Cuidado com tapete na entrada.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Hemiparesia direita após AVC isquêmico há 3 meses.',
          medicalHistory: 'AVC isquêmico em 2026. HAS, DM2.',
          medications: 'AAS 100mg, Losartana 50mg, Atorvastatina 20mg, Metformina 850mg.',
          allergies: 'Sem alergias conhecidas.',
        },
      },
    },
  })

  const beatriz = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Beatriz Rocha',
      birthDate: new Date('1996-12-08T00:00:00.000Z'),
      phone: '(11) 99206-0006',
      email: 'beatriz.rocha@exemplo.com',
      classification: 'STANDARD',
      notes: 'Designer. Trabalha 8h+ no computador. Reclama de dor cervical.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Cervicalgia crônica com cefaleia tensional 2-3×/semana.',
          medicalHistory: 'Sem cirurgias. Postura sedentária prolongada.',
          medications: 'Dipirona conforme necessidade.',
          allergies: 'Sem alergias.',
        },
      },
    },
  })

  const lucas = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Lucas Vieira',
      birthDate: new Date('2014-05-30T00:00:00.000Z'),
      phone: '(11) 99207-0007',
      email: 'mae.lucas@exemplo.com',
      classification: 'POST_ACCIDENT',
      notes: 'Pré-adolescente. Acompanhante: mãe (Cristina). Atende na Clínica Vital.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Pós-fratura de tíbia (queda de bicicleta) há 8 semanas.',
          medicalHistory: 'Imobilização gessada por 6 semanas. Liberado para fisioterapia.',
          medications: 'Sem medicação atual.',
          allergies: 'Penicilina.',
        },
      },
    },
  })

  const helena = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Helena Castro',
      birthDate: new Date('1981-04-15T00:00:00.000Z'),
      phone: '(11) 99208-0008',
      email: 'helena.castro@exemplo.com',
      classification: 'STANDARD',
      notes: 'Pacote estético contratado para preparação de evento.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Retenção de líquidos e celulite grau 2 em membros inferiores.',
          medicalHistory: 'Sem comorbidades. Pratica musculação 3×/semana.',
          medications: 'Anticoncepcional oral.',
          allergies: 'Sem alergias.',
        },
      },
    },
  })

  const antonio = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Antônio Silva',
      birthDate: new Date('1953-06-20T00:00:00.000Z'),
      phone: '(11) 99209-0009',
      classification: 'ELDERLY',
      notes: 'DPOC moderada. Mora com a esposa. Cuidador presente nas sessões.',
      address: 'Rua Augusta, 2200 — Jardins, São Paulo',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      homeCarePriority: 'HIGH',
      homeCareNotes: 'Casa térrea com rampa. Portão preto. Levar oxímetro.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Dispneia aos médios esforços. Tosse produtiva matinal.',
          medicalHistory: 'DPOC há 8 anos. Ex-tabagista (40 maços/ano).',
          medications: 'Spiriva, Symbicort, oxigenoterapia domiciliar 2L/min noturno.',
          allergies: 'Sem alergias.',
        },
      },
    },
  })

  const camila = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Camila Tavares',
      birthDate: new Date('1990-10-25T00:00:00.000Z'),
      phone: '(11) 99210-0010',
      email: 'camila.tavares@exemplo.com',
      classification: 'STANDARD',
      notes: 'Atendimento online. Mora em outra cidade.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Tensão cervical e ombros pelo trabalho remoto.',
          medicalHistory: 'Sem patologias prévias.',
          medications: 'Sem medicação.',
          allergies: 'Sem alergias.',
        },
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Planos de tratamento (varied)
  // ---------------------------------------------------------------------------

  const planGervasioOrto = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: gervasio.id,
      workplaceId: clinica.id,
      area: 'ORTOPEDICA',
      specialties: ['TERAPIA_MANUAL'],
      attendanceType: 'CLINIC',
      pricingModel: 'PER_SESSION',
      sessionPrice: 180,
      notes: 'Plano ortopédico para controle de dor lombar e manutenção funcional.',
    },
  })

  const planGervasioPilates = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: gervasio.id,
      workplaceId: clinica.id,
      area: 'ORTOPEDICA',
      specialties: ['PILATES'],
      attendanceType: 'CLINIC',
      pricingModel: 'PACKAGE',
      totalSessions: 10,
      packageAmount: 1500,
      startsAt: daysAgo(20, 9),
      notes: 'Pacote de Pilates terapêutico (10 sessões) para estabilidade e prevenção.',
    },
  })

  const planCarlaPelvica = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: carla.id,
      workplaceId: particular.id,
      area: 'PELVICA',
      specialties: ['LIBERACAO_MIOFASCIAL'],
      attendanceType: 'HOME_CARE',
      pricingModel: 'PER_SESSION',
      sessionPrice: 250,
      notes: 'Plano de fisioterapia pélvica e manejo da fibromialgia em domicílio.',
    },
  })

  const planRafaelEsportiva = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: rafael.id,
      workplaceId: clinica.id,
      area: 'ESPORTIVA',
      specialties: ['TERAPIA_MANUAL', 'PILATES'],
      attendanceType: 'CLINIC',
      pricingModel: 'PACKAGE',
      totalSessions: 12,
      packageAmount: 2400,
      startsAt: daysAgo(25, 9),
      notes: 'Pacote de retorno ao esporte pós-LCA (12 sessões em 6 semanas).',
    },
  })

  const planMarianaPelvica = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: mariana.id,
      workplaceId: clinica.id,
      area: 'PELVICA',
      specialties: ['TERAPIA_MANUAL'],
      attendanceType: 'CLINIC',
      pricingModel: 'PER_SESSION',
      sessionPrice: 200,
      notes: 'Acompanhamento gestacional com foco em preparação para o parto.',
    },
  })

  const planJoaquimNeuro = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: joaquim.id,
      workplaceId: particular.id,
      area: 'NEUROLOGICA',
      specialties: ['TERAPIA_MANUAL'],
      attendanceType: 'HOME_CARE',
      pricingModel: 'PACKAGE',
      totalSessions: 20,
      packageAmount: 5000,
      startsAt: daysAgo(40, 9),
      notes: 'Reabilitação pós-AVC domiciliar (20 sessões).',
    },
  })

  const planBeatrizOrto = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: beatriz.id,
      workplaceId: clinica.id,
      area: 'ORTOPEDICA',
      specialties: ['TERAPIA_MANUAL', 'VENTOSATERAPIA'],
      attendanceType: 'CLINIC',
      pricingModel: 'PER_SESSION',
      sessionPrice: 180,
      notes: 'Tratamento de cervicalgia crônica com terapia manual e ventosaterapia.',
    },
  })

  const planLucasPed = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: lucas.id,
      workplaceId: parceira.id,
      area: 'PEDIATRICA',
      specialties: ['TERAPIA_MANUAL'],
      attendanceType: 'CLINIC',
      pricingModel: 'PER_SESSION',
      sessionPrice: 200,
      notes: 'Reabilitação pós-fratura de tíbia. Atende na Clínica Vital (parceira).',
    },
  })

  const planHelenaEstetica = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: helena.id,
      workplaceId: clinica.id,
      area: 'ESTETICA',
      specialties: ['LIBERACAO_MIOFASCIAL', 'VENTOSATERAPIA'],
      attendanceType: 'CLINIC',
      pricingModel: 'PACKAGE',
      totalSessions: 10,
      packageAmount: 2200,
      startsAt: daysAgo(15, 14),
      notes: 'Pacote estético de drenagem linfática e liberação miofascial.',
    },
  })

  const planAntonioCardio = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: antonio.id,
      workplaceId: particular.id,
      area: 'CARDIORESPIRATORIA',
      specialties: ['TERAPIA_MANUAL'],
      attendanceType: 'HOME_CARE',
      pricingModel: 'PER_SESSION',
      sessionPrice: 220,
      notes: 'Fisioterapia respiratória domiciliar para manejo de DPOC.',
    },
  })

  const planCamilaPreventiva = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: camila.id,
      workplaceId: particular.id,
      area: 'PREVENTIVA',
      specialties: ['TERAPIA_MANUAL'],
      attendanceType: 'ONLINE',
      pricingModel: 'PER_SESSION',
      sessionPrice: 160,
      notes: 'Atendimento online quinzenal para postura e mobilidade.',
    },
  })

  // ---------------------------------------------------------------------------
  // Sessões — passado (REALIZADO), hoje, próximas 2 semanas
  // ---------------------------------------------------------------------------

  type SessionInput = {
    label?: string
    patientId: string
    treatmentPlanId: string | null
    date: Date
    duration: number
    status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO'
    workplaceId: string
    attendanceType: 'CLINIC' | 'HOME_CARE' | 'HOSPITAL' | 'CORPORATE' | 'ONLINE'
    expectedFee: number | null
    paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' | 'REFUNDED' | null
    soap?: { subjective: string; objective: string; assessment: string; plan: string }
  }

  const sessionsPlan: SessionInput[] = [
    // ===== Gervásio (ortopédico avulso + pacote Pilates) =====
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioOrto.id,
      date: daysAgo(28, 8),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PAID',
      soap: pickSoap('ORTOPEDICA', 0),
    },
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioOrto.id,
      date: daysAgo(21, 8),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PAID',
      soap: pickSoap('ORTOPEDICA', 1),
    },
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioOrto.id,
      date: daysAgo(14, 8),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PAID',
      soap: pickSoap('ORTOPEDICA', 2),
    },
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioOrto.id,
      date: daysAgo(7, 8),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PENDING',
      soap: pickSoap('ORTOPEDICA', 0),
    },
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioOrto.id,
      date: daysFromNow(0, 8),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PENDING',
    },
    // pacote Pilates Gervásio (PACKAGE — sem expectedFee)
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioPilates.id,
      date: daysAgo(20, 11),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ORTOPEDICA', 1),
    },
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioPilates.id,
      date: daysAgo(13, 11),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ORTOPEDICA', 2),
    },
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioPilates.id,
      date: daysAgo(6, 11),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ORTOPEDICA', 0),
    },
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioPilates.id,
      date: daysFromNow(1, 11),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
    },
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioPilates.id,
      date: daysFromNow(8, 11),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
    },

    // ===== Carla (pélvica/fibromialgia domiciliar) =====
    {
      patientId: carla.id,
      treatmentPlanId: planCarlaPelvica.id,
      date: daysAgo(22, 9, 30),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 250,
      paymentStatus: 'PAID',
      soap: pickSoap('PELVICA', 0),
    },
    {
      patientId: carla.id,
      treatmentPlanId: planCarlaPelvica.id,
      date: daysAgo(15, 9, 30),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 250,
      paymentStatus: 'PAID',
      soap: pickSoap('PELVICA', 1),
    },
    {
      patientId: carla.id,
      treatmentPlanId: planCarlaPelvica.id,
      date: daysAgo(8, 9, 30),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 250,
      paymentStatus: 'PENDING',
      soap: pickSoap('PELVICA', 0),
    },
    {
      patientId: carla.id,
      treatmentPlanId: planCarlaPelvica.id,
      date: daysFromNow(1, 9, 30),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 250,
      paymentStatus: 'PENDING',
    },
    {
      patientId: carla.id,
      treatmentPlanId: planCarlaPelvica.id,
      date: daysFromNow(8, 9, 30),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 250,
      paymentStatus: 'PENDING',
    },

    // ===== Rafael (esportiva pacote) =====
    {
      patientId: rafael.id,
      treatmentPlanId: planRafaelEsportiva.id,
      date: daysAgo(23, 16, 30),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ESPORTIVA', 0),
    },
    {
      patientId: rafael.id,
      treatmentPlanId: planRafaelEsportiva.id,
      date: daysAgo(16, 16, 30),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ESPORTIVA', 1),
    },
    {
      patientId: rafael.id,
      treatmentPlanId: planRafaelEsportiva.id,
      date: daysAgo(9, 16, 30),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ESPORTIVA', 0),
    },
    {
      patientId: rafael.id,
      treatmentPlanId: planRafaelEsportiva.id,
      date: daysAgo(2, 16, 30),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ESPORTIVA', 1),
    },
    {
      patientId: rafael.id,
      treatmentPlanId: planRafaelEsportiva.id,
      date: daysFromNow(2, 17),
      duration: 50,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
    },
    {
      patientId: rafael.id,
      treatmentPlanId: planRafaelEsportiva.id,
      date: daysFromNow(9, 17),
      duration: 50,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
    },

    // ===== Mariana (gestante) =====
    {
      patientId: mariana.id,
      treatmentPlanId: planMarianaPelvica.id,
      date: daysAgo(18, 14),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PAID',
      soap: pickSoap('PELVICA', 1),
    },
    {
      patientId: mariana.id,
      treatmentPlanId: planMarianaPelvica.id,
      date: daysAgo(11, 14),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PAID',
      soap: pickSoap('PELVICA', 0),
    },
    {
      patientId: mariana.id,
      treatmentPlanId: planMarianaPelvica.id,
      date: daysAgo(4, 14),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PAID',
      soap: pickSoap('PELVICA', 1),
    },
    {
      patientId: mariana.id,
      treatmentPlanId: planMarianaPelvica.id,
      date: daysFromNow(3, 14),
      duration: 50,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PENDING',
    },
    {
      patientId: mariana.id,
      treatmentPlanId: planMarianaPelvica.id,
      date: daysFromNow(10, 14),
      duration: 50,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PENDING',
    },

    // ===== Joaquim (neuro pós-AVC domiciliar URGENT) =====
    {
      patientId: joaquim.id,
      treatmentPlanId: planJoaquimNeuro.id,
      date: daysAgo(28, 10, 30),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('NEUROLOGICA', 0),
    },
    {
      patientId: joaquim.id,
      treatmentPlanId: planJoaquimNeuro.id,
      date: daysAgo(21, 10, 30),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('NEUROLOGICA', 0),
    },
    {
      patientId: joaquim.id,
      treatmentPlanId: planJoaquimNeuro.id,
      date: daysAgo(14, 10, 30),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('NEUROLOGICA', 0),
    },
    {
      patientId: joaquim.id,
      treatmentPlanId: planJoaquimNeuro.id,
      date: daysAgo(7, 10, 30),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('NEUROLOGICA', 0),
    },
    {
      patientId: joaquim.id,
      treatmentPlanId: planJoaquimNeuro.id,
      date: daysFromNow(0, 10, 30),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: null,
      paymentStatus: null,
    },
    {
      patientId: joaquim.id,
      treatmentPlanId: planJoaquimNeuro.id,
      date: daysFromNow(7, 10, 30),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: null,
      paymentStatus: null,
    },

    // ===== Beatriz (cervicalgia avulso) =====
    {
      patientId: beatriz.id,
      treatmentPlanId: planBeatrizOrto.id,
      date: daysAgo(10, 18),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PAID',
      soap: pickSoap('ORTOPEDICA', 1),
    },
    {
      patientId: beatriz.id,
      treatmentPlanId: planBeatrizOrto.id,
      date: daysAgo(3, 18),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PENDING',
      soap: pickSoap('ORTOPEDICA', 2),
    },
    {
      patientId: beatriz.id,
      treatmentPlanId: planBeatrizOrto.id,
      date: daysFromNow(4, 18),
      duration: 50,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PENDING',
    },

    // ===== Lucas (pediátrica parceira) =====
    {
      patientId: lucas.id,
      treatmentPlanId: planLucasPed.id,
      date: daysAgo(17, 15),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: parceira.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PAID',
      soap: pickSoap('PEDIATRICA', 0),
    },
    {
      patientId: lucas.id,
      treatmentPlanId: planLucasPed.id,
      date: daysAgo(10, 15),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: parceira.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PAID',
      soap: pickSoap('PEDIATRICA', 0),
    },
    {
      patientId: lucas.id,
      treatmentPlanId: planLucasPed.id,
      date: daysAgo(3, 15),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: parceira.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PAID',
      soap: pickSoap('PEDIATRICA', 0),
    },
    {
      patientId: lucas.id,
      treatmentPlanId: planLucasPed.id,
      date: daysFromNow(4, 15),
      duration: 50,
      status: 'AGENDADO',
      workplaceId: parceira.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PENDING',
    },

    // ===== Helena (estética pacote — pago à vista) =====
    {
      patientId: helena.id,
      treatmentPlanId: planHelenaEstetica.id,
      date: daysAgo(15, 14),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ESTETICA', 0),
    },
    {
      patientId: helena.id,
      treatmentPlanId: planHelenaEstetica.id,
      date: daysAgo(11, 14),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ESTETICA', 0),
    },
    {
      patientId: helena.id,
      treatmentPlanId: planHelenaEstetica.id,
      date: daysAgo(7, 14),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ESTETICA', 0),
    },
    {
      patientId: helena.id,
      treatmentPlanId: planHelenaEstetica.id,
      date: daysAgo(3, 14),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: pickSoap('ESTETICA', 1),
    },
    {
      patientId: helena.id,
      treatmentPlanId: planHelenaEstetica.id,
      date: daysFromNow(2, 14),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
    },
    {
      patientId: helena.id,
      treatmentPlanId: planHelenaEstetica.id,
      date: daysFromNow(6, 14),
      duration: 60,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
    },

    // ===== Antônio (cardio HOME_CARE) =====
    {
      patientId: antonio.id,
      treatmentPlanId: planAntonioCardio.id,
      date: daysAgo(13, 8, 30),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 220,
      paymentStatus: 'PAID',
      soap: pickSoap('CARDIORESPIRATORIA', 0),
    },
    {
      patientId: antonio.id,
      treatmentPlanId: planAntonioCardio.id,
      date: daysAgo(6, 8, 30),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 220,
      paymentStatus: 'PENDING',
      soap: pickSoap('CARDIORESPIRATORIA', 0),
    },
    {
      patientId: antonio.id,
      treatmentPlanId: planAntonioCardio.id,
      date: daysFromNow(1, 8, 30),
      duration: 50,
      status: 'AGENDADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 220,
      paymentStatus: 'PENDING',
    },

    // ===== Camila (online preventiva) =====
    {
      patientId: camila.id,
      treatmentPlanId: planCamilaPreventiva.id,
      date: daysAgo(14, 19),
      duration: 45,
      status: 'REALIZADO',
      workplaceId: particular.id,
      attendanceType: 'ONLINE',
      expectedFee: 160,
      paymentStatus: 'PAID',
      soap: pickSoap('PREVENTIVA', 0),
    },
    {
      patientId: camila.id,
      treatmentPlanId: planCamilaPreventiva.id,
      date: daysFromNow(0, 19),
      duration: 45,
      status: 'AGENDADO',
      workplaceId: particular.id,
      attendanceType: 'ONLINE',
      expectedFee: 160,
      paymentStatus: 'PENDING',
    },

    // ===== Cancelados (fluxo realista) =====
    {
      patientId: gervasio.id,
      treatmentPlanId: planGervasioPilates.id,
      date: daysAgo(2, 11),
      duration: 60,
      status: 'CANCELADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: null,
      paymentStatus: null,
      soap: {
        subjective: 'Paciente em viagem de família.',
        objective: '',
        assessment: '',
        plan: 'Reagendar para próxima semana.',
      },
    },
  ]

  for (const item of sessionsPlan) {
    await prisma.session.create({
      data: {
        userId: user.id,
        patientId: item.patientId,
        treatmentPlanId: item.treatmentPlanId,
        date: item.date,
        duration: item.duration,
        status: item.status,
        workplaceId: item.workplaceId,
        attendanceType: item.attendanceType,
        expectedFee: item.expectedFee,
        paymentStatus: item.paymentStatus,
        subjective: item.soap?.subjective ?? null,
        objective: item.soap?.objective ?? null,
        assessment: item.soap?.assessment ?? null,
        plan: item.soap?.plan ?? null,
      },
    })
  }

  // ---------------------------------------------------------------------------
  // Pagamentos
  // ---------------------------------------------------------------------------

  // Avulsos pagos: para cada sessão REALIZADO com paymentStatus PAID, criar Payment
  const paidSessions = await prisma.session.findMany({
    where: { userId: user.id, paymentStatus: 'PAID' },
    select: { id: true, expectedFee: true, date: true },
  })

  const paymentMethods = ['PIX', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD'] as const
  for (const [i, s] of paidSessions.entries()) {
    if (!s.expectedFee) continue
    await prisma.payment.create({
      data: {
        userId: user.id,
        sessionId: s.id,
        amount: Number(s.expectedFee),
        method: paymentMethods[i % paymentMethods.length],
        status: 'PAID',
        paidAt: s.date,
        notes: 'Pagamento à vista no dia da sessão.',
      },
    })
  }

  // Pacote Helena — 100% pago à vista
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planHelenaEstetica.id,
      amount: 2200,
      method: 'PIX',
      status: 'PAID',
      paidAt: daysAgo(15, 13),
      notes: 'Pacote 10 sessões pago à vista (PIX).',
    },
  })

  // Pacote Rafael — 12 sessões: 1ª parcela paga, 2ª paga, 3ª pendente
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planRafaelEsportiva.id,
      amount: 800,
      method: 'CREDIT_CARD',
      status: 'PAID',
      paidAt: daysAgo(25, 9),
      notes: '1ª parcela do pacote esportiva.',
    },
  })
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planRafaelEsportiva.id,
      amount: 800,
      method: 'CREDIT_CARD',
      status: 'PAID',
      paidAt: daysAgo(5, 9),
      notes: '2ª parcela do pacote esportiva.',
    },
  })
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planRafaelEsportiva.id,
      amount: 800,
      method: 'CREDIT_CARD',
      status: 'PENDING',
      paidAt: daysFromNow(15, 9),
      dueAt: daysFromNow(15, 9),
      notes: '3ª parcela (a vencer).',
    },
  })

  // Pacote Pilates Gervásio — 1500: 600 pago, 900 pendente
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planGervasioPilates.id,
      amount: 600,
      method: 'CASH',
      status: 'PAID',
      paidAt: daysAgo(20, 11),
      notes: 'Entrada em dinheiro.',
    },
  })
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planGervasioPilates.id,
      amount: 900,
      method: 'PIX',
      status: 'PENDING',
      paidAt: daysFromNow(10, 12),
      dueAt: daysFromNow(10, 12),
      notes: 'Saldo do pacote (a vencer).',
    },
  })

  // Pacote Joaquim Neuro — 5000: 2 parcelas pagas, 2 pendentes
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planJoaquimNeuro.id,
      amount: 1250,
      method: 'BANK_TRANSFER',
      status: 'PAID',
      paidAt: daysAgo(40, 10),
      notes: '1ª parcela (4×).',
    },
  })
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planJoaquimNeuro.id,
      amount: 1250,
      method: 'BANK_TRANSFER',
      status: 'PAID',
      paidAt: daysAgo(10, 10),
      notes: '2ª parcela (4×).',
    },
  })
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planJoaquimNeuro.id,
      amount: 1250,
      method: 'BANK_TRANSFER',
      status: 'PENDING',
      paidAt: daysFromNow(20, 10),
      dueAt: daysFromNow(20, 10),
      notes: '3ª parcela (a vencer).',
    },
  })
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: planJoaquimNeuro.id,
      amount: 1250,
      method: 'BANK_TRANSFER',
      status: 'PENDING',
      paidAt: daysFromNow(50, 10),
      dueAt: daysFromNow(50, 10),
      notes: '4ª parcela (a vencer).',
    },
  })

  // ---------------------------------------------------------------------------
  // Documentos (3) — laudo, relatório, declaração
  // ---------------------------------------------------------------------------

  await prisma.document.create({
    data: {
      userId: user.id,
      patientId: rafael.id,
      type: 'LAUDO_FISIOTERAPEUTICO',
      title: 'Laudo de evolução pós-LCA — Rafael Teixeira',
      period: 'Fev–Abr 2026',
    },
  })
  await prisma.document.create({
    data: {
      userId: user.id,
      patientId: mariana.id,
      type: 'RELATORIO_PROGRESSO',
      title: 'Relatório de progresso gestacional — Mariana Albuquerque',
      period: 'Mar–Abr 2026',
    },
  })
  await prisma.document.create({
    data: {
      userId: user.id,
      patientId: beatriz.id,
      type: 'DECLARACAO_COMPARECIMENTO',
      title: 'Declaração de comparecimento — Beatriz Rocha',
      period: '17 abr 2026',
    },
  })

  // ---------------------------------------------------------------------------
  // Resumo
  // ---------------------------------------------------------------------------

  const totals = await Promise.all([
    prisma.patient.count({ where: { userId: user.id } }),
    prisma.treatmentPlan.count({ where: { userId: user.id } }),
    prisma.session.count({ where: { userId: user.id } }),
    prisma.payment.count({ where: { userId: user.id } }),
    prisma.document.count({ where: { userId: user.id } }),
    prisma.workplace.count({ where: { userId: user.id } }),
  ])

  console.log('\n✓ Seed concluído')
  console.log(`  Usuário: ${demoEmail} / ${demoPassword}`)
  console.log(
    `  ${totals[0]} pacientes • ${totals[5]} locais • ${totals[1]} planos • ${totals[2]} sessões • ${totals[3]} pagamentos • ${totals[4]} documentos`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
