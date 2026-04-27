import { NextResponse } from 'next/server'
import type { TherapyArea } from '@/generated/prisma/client'
import { getSession } from '@/lib/session'
import { financeSummaryDTO } from '@/server/modules/finance/http/finance.dto'
import { getFinanceSummaryUseCase } from '@/server/modules/finance/application/get-finance-summary'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parsed = financeSummaryDTO.safeParse({
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    granularity: searchParams.get('granularity') ?? undefined,
    workplaceIds: searchParams.get('workplaceIds') ?? undefined,
    areas: searchParams.get('areas') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const summary = await getFinanceSummaryUseCase({
    userId: session.userId,
    from: new Date(parsed.data.from),
    to: new Date(parsed.data.to),
    granularity: parsed.data.granularity,
    workplaceIds: parsed.data.workplaceIds,
    areas: parsed.data.areas as TherapyArea[] | undefined,
  })

  return NextResponse.json(summary)
}
