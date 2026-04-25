import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { PatientForm } from '@/components/patients/PatientForm'
import { formatDateOnlyInputValue } from '@/lib/date'
import { getSession } from '@/lib/session'
import {
  getPatientUseCase,
  PatientNotFoundError,
} from '@/server/modules/patients/application/get-patient'

async function loadPatient(id: string, userId: string) {
  try {
    return await getPatientUseCase(id, userId)
  } catch (err) {
    if (err instanceof PatientNotFoundError) {
      return null
    }

    throw err
  }
}

export default async function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const patient = await loadPatient(id, session.userId!)

  if (!patient) {
    notFound()
  }

  return (
    <div className="max-w-[1040px] space-y-6 sm:space-y-8">
      <div>
        <Link
          href={`/pacientes/${id}`}
          className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar para ficha clínica
        </Link>
        <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
          Editar Paciente
        </h1>
        <p className="mt-1 font-body text-[14px] text-muted-foreground">
          Atualize os dados cadastrais e o prontuário base.
        </p>
      </div>

      <PatientForm
        patientId={id}
        initialData={{
          name: patient.name,
          birthDate: patient.birthDate ? formatDateOnlyInputValue(patient.birthDate) : '',
          phone: patient.phone ?? '',
          email: patient.email ?? '',
          classification: patient.classification,
          notes: patient.notes ?? '',
          mainComplaint: patient.clinicalRecord?.mainComplaint ?? '',
          medicalHistory: patient.clinicalRecord?.medicalHistory ?? '',
          medications: patient.clinicalRecord?.medications ?? '',
          allergies: patient.clinicalRecord?.allergies ?? '',
          address: patient.address ?? '',
          neighborhood: patient.neighborhood ?? '',
          city: patient.city ?? '',
          homeCareNotes: patient.homeCareNotes ?? '',
          homeCarePriority: patient.homeCarePriority ?? 'NORMAL',
        }}
      />
    </div>
  )
}
