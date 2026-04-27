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

async function main() {
  const demoEmail = 'demo@phisioflow.com'
  const demoPassword = 'demo1234'

  await prisma.payment.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.calendarEventLink.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.emailMessage.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.session.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.treatmentPlan.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.calendarConnection.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.clinicalRecord.deleteMany({
    where: { patient: { user: { email: demoEmail } } },
  })

  await prisma.document.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.patient.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.workplace.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.emailSettings.deleteMany({
    where: { user: { email: demoEmail } },
  })

  await prisma.user.deleteMany({
    where: { email: demoEmail },
  })

  const user = await prisma.user.create({
    data: {
      name: 'Dra. Ana Lima',
      email: demoEmail,
      password: await bcrypt.hash(demoPassword, 12),
    },
  })

  const gervasio = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Gervasio Mendes',
      birthDate: new Date('1948-03-12T00:00:00.000Z'),
      phone: '(11) 99999-0001',
      classification: 'ELDERLY',
      notes: 'Paciente com boa adesão ao plano terapêutico.',
      clinicalRecord: {
        create: {
          mainComplaint: 'Dor lombar crônica com irradiação para membros inferiores.',
          medicalHistory: 'Hipertensão controlada. Sem cirurgias anteriores.',
          medications: 'Losartana 50mg/dia.',
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
      phone: '(11) 99999-0002',
      email: 'carla.souza@exemplo.com',
      classification: 'STANDARD',
      notes: 'Prefere atendimentos no período da manhã.',
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

  const rafael = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Rafael Teixeira',
      birthDate: new Date('1972-11-05T00:00:00.000Z'),
      phone: '(11) 99999-0003',
      email: 'rafael.teixeira@exemplo.com',
      classification: 'PCD',
      notes: 'Paciente em retorno gradual aos treinos.',
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

  const clinica = await prisma.workplace.create({
    data: {
      userId: user.id,
      name: 'Clínica Movimento',
      kind: 'OWN_CLINIC',
      defaultAttendanceType: 'CLINIC',
      address: 'Rua das Flores, 120 — São Paulo',
      notes: 'Consultório principal com equipamentos completos.',
    },
  })

  const particular = await prisma.workplace.create({
    data: {
      userId: user.id,
      name: 'Atendimento Particular',
      kind: 'PARTICULAR',
      defaultAttendanceType: 'HOME_CARE',
      notes: 'Pacientes atendidos em domicílio.',
    },
  })

  const gervasioOrtopedicaPlan = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: gervasio.id,
      workplaceId: clinica.id,
      area: 'ORTOPEDICA',
      specialties: ['TERAPIA_MANUAL'],
      attendanceType: 'CLINIC',
      pricingModel: 'PER_SESSION',
      sessionPrice: 180,
      notes: 'Plano ortopedico para controle de dor lombar e manutencao funcional.',
    },
  })

  const gervasioPilatesPlan = await prisma.treatmentPlan.create({
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
      notes: 'Pacote de Pilates terapeutico para estabilidade e prevencao.',
    },
  })

  const carlaEsteticaPlan = await prisma.treatmentPlan.create({
    data: {
      userId: user.id,
      patientId: carla.id,
      workplaceId: particular.id,
      area: 'ESTETICA',
      specialties: ['LIBERACAO_MIOFASCIAL'],
      attendanceType: 'HOME_CARE',
      pricingModel: 'PER_SESSION',
      sessionPrice: 220,
      notes: 'Plano estetico com atendimento domiciliar e recursos manuais.',
    },
  })

  const now = new Date()
  const daysFromNow = (days: number, hour: number, minute = 0) => {
    const date = new Date(now)
    date.setDate(date.getDate() + days)
    date.setHours(hour, minute, 0, 0)
    return date
  }

  const daysAgo = (days: number, hour: number, minute = 0) => {
    const date = new Date(now)
    date.setDate(date.getDate() - days)
    date.setHours(hour, minute, 0, 0)
    return date
  }

  const gervasioOrtoSession = await prisma.session.create({
    data: {
      userId: user.id,
      patientId: gervasio.id,
      treatmentPlanId: gervasioOrtopedicaPlan.id,
      date: daysAgo(14, 9),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 180,
      paymentStatus: 'PAID',
      subjective: 'Paciente relata melhora da dor lombar. EVA 4/10.',
      objective:
        'Teste de Lasègue negativo bilateralmente. Força muscular 4/5 em flexores de tronco.',
      assessment: 'Evolução positiva. Mantendo ganho de amplitude lombar.',
      plan: 'Progredir carga nos exercícios de estabilização e manter frequência semanal.',
    },
  })

  await prisma.session.create({
    data: {
      userId: user.id,
      patientId: gervasio.id,
      treatmentPlanId: gervasioPilatesPlan.id,
      date: daysAgo(7, 9),
      duration: 60,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      subjective: 'Sem queixas de dor em repouso. Dor leve ao esforço (EVA 2/10).',
      objective: 'Mobilidade lombar em 80% do esperado para a idade. Sem sinais neurológicos.',
      assessment: 'Alta funcional próxima. Considerar espaçamento das sessões.',
      plan: 'Iniciar programa de manutenção domiciliar e retorno em 15 dias.',
    },
  })

  await prisma.session.create({
    data: {
      userId: user.id,
      patientId: rafael.id,
      date: daysAgo(2, 16, 30),
      duration: 50,
      status: 'REALIZADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PENDING',
      subjective: 'Paciente tolerou bem o treino e relata confiança maior para subir escadas.',
      objective: 'ADM de joelho em 120 graus, sem edema. Controle excêntrico melhorado.',
      assessment: 'Boa progressão pós-LCA. Liberar exercícios funcionais com cautela.',
      plan: 'Evoluir agachamento unilateral assistido e treino proprioceptivo.',
    },
  })

  await prisma.session.create({
    data: {
      userId: user.id,
      patientId: carla.id,
      treatmentPlanId: carlaEsteticaPlan.id,
      date: daysFromNow(1, 8, 30),
      duration: 45,
      status: 'AGENDADO',
      workplaceId: particular.id,
      attendanceType: 'HOME_CARE',
      expectedFee: 220,
      paymentStatus: 'PENDING',
      subjective: 'Paciente solicita foco em analgesia e mobilidade global.',
      plan: 'Sessão domiciliar com recursos manuais e orientação de exercícios leves.',
    },
  })

  await prisma.session.create({
    data: {
      userId: user.id,
      patientId: rafael.id,
      date: daysFromNow(2, 15),
      duration: 50,
      status: 'AGENDADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      expectedFee: 200,
      paymentStatus: 'PENDING',
      plan: 'Reavaliação funcional e progressão do treino de força.',
    },
  })

  await prisma.session.create({
    data: {
      userId: user.id,
      patientId: gervasio.id,
      treatmentPlanId: gervasioPilatesPlan.id,
      date: daysFromNow(4, 10),
      duration: 60,
      status: 'CANCELADO',
      workplaceId: clinica.id,
      attendanceType: 'CLINIC',
      subjective: 'Paciente em viagem, solicitou reagendamento.',
      plan: 'Remarcar após retorno à rotina.',
    },
  })

  // Pagamentos demo
  // Gervasio plano ortopedico (PER_SESSION) — 1 sessão paga
  await prisma.payment.create({
    data: {
      userId: user.id,
      sessionId: gervasioOrtoSession.id,
      amount: 180,
      method: 'PIX',
      status: 'PAID',
      paidAt: daysAgo(14, 10),
      notes: 'Pagamento à vista no dia da sessão.',
    },
  })

  // Gervasio pacote Pilates — 600 já pago de 1500
  await prisma.payment.create({
    data: {
      userId: user.id,
      treatmentPlanId: gervasioPilatesPlan.id,
      amount: 600,
      method: 'CREDIT_CARD',
      status: 'PAID',
      paidAt: daysAgo(20, 10),
      notes: 'Primeira parcela do pacote.',
    },
  })

  console.log('Seed concluído')
  console.log(`Usuário demo: ${demoEmail} / ${demoPassword}`)
  console.log(`Pacientes: ${gervasio.name}, ${carla.name}, ${rafael.name}`)
  console.log(`Locais: ${clinica.name}, ${particular.name}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
