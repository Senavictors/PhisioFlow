import 'server-only'

import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'
import type { SessionWithPatient } from '@/server/modules/sessions/infra/session.repository'

const APP_TIME_ZONE = 'America/Sao_Paulo'

export interface GoogleCalendarSummary {
  id: string
  summary: string
  primary: boolean
}

export interface GoogleCalendarEventInput {
  calendarId: string
  session: SessionWithPatient
}

function getCalendarApi(auth: OAuth2Client) {
  return google.calendar({ version: 'v3', auth })
}

function buildLocation(session: SessionWithPatient) {
  if (session.type !== 'HOME_CARE') return undefined

  return [session.patient.address, session.patient.neighborhood, session.patient.city]
    .filter(Boolean)
    .join(', ')
}

function buildEventResource(session: SessionWithPatient) {
  const start = new Date(session.date)
  const end = new Date(start.getTime() + session.duration * 60_000)
  const location = buildLocation(session)

  return {
    summary: `Atendimento - ${session.patient.name}`,
    description: [
      'Evento sincronizado pelo PhysioFlow.',
      `Tipo: ${session.type === 'HOME_CARE' ? 'Domiciliar' : 'Presencial'}`,
      `Status: ${session.status}`,
    ].join('\n'),
    location,
    start: {
      dateTime: start.toISOString(),
      timeZone: APP_TIME_ZONE,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: APP_TIME_ZONE,
    },
  }
}

export async function listGoogleCalendars(auth: OAuth2Client): Promise<GoogleCalendarSummary[]> {
  const calendar = getCalendarApi(auth)
  const response = await calendar.calendarList.list({
    minAccessRole: 'writer',
  })

  return (response.data.items ?? [])
    .filter((item) => item.id && item.summary)
    .map((item) => ({
      id: item.id!,
      summary: item.summary!,
      primary: Boolean(item.primary),
    }))
}

export async function createGoogleCalendarEvent(
  auth: OAuth2Client,
  input: GoogleCalendarEventInput
) {
  const calendar = getCalendarApi(auth)
  const response = await calendar.events.insert({
    calendarId: input.calendarId,
    requestBody: buildEventResource(input.session),
  })

  if (!response.data.id) {
    throw new Error('Google Calendar não retornou o ID do evento criado.')
  }

  return response.data.id
}

export async function updateGoogleCalendarEvent(
  auth: OAuth2Client,
  input: GoogleCalendarEventInput & { eventId: string }
) {
  const calendar = getCalendarApi(auth)
  const response = await calendar.events.update({
    calendarId: input.calendarId,
    eventId: input.eventId,
    requestBody: buildEventResource(input.session),
  })

  if (!response.data.id) {
    throw new Error('Google Calendar não retornou o ID do evento atualizado.')
  }

  return response.data.id
}

export async function deleteGoogleCalendarEvent(
  auth: OAuth2Client,
  input: { calendarId: string; eventId: string }
) {
  const calendar = getCalendarApi(auth)

  try {
    await calendar.events.delete({
      calendarId: input.calendarId,
      eventId: input.eventId,
    })
  } catch (error) {
    const status =
      (error as { code?: number; status?: number }).code ?? (error as { status?: number }).status
    if (status === 404 || status === 410) return
    throw error
  }
}
