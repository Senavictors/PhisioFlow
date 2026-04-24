import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDashboardMetrics } from '@/server/modules/dashboard/application/get-metrics'

export async function GET() {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const metrics = await getDashboardMetrics(session.userId)
  return NextResponse.json(metrics)
}
