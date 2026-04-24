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

  await prisma.clinicalRecord.deleteMany({
    where: {
      patient: {
        user: {
          email: demoEmail,
        },
      },
    },
  })

  await prisma.patient.deleteMany({
    where: {
      user: {
        email: demoEmail,
      },
    },
  })

  await prisma.user.deleteMany({
    where: {
      email: demoEmail,
    },
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
      area: 'PILATES',
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
      area: 'AESTHETIC',
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
      area: 'MOTOR',
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

  console.log('Seed concluído')
  console.log(`Usuário demo: ${demoEmail} / ${demoPassword}`)
  console.log(`Pacientes: ${gervasio.name}, ${carla.name}, ${rafael.name}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
