import { useMemo } from 'react'
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewList,
  createViewWeek,
  createViewMonthGrid,
  type CalendarEvent,
  type CalendarType,
} from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'

import { Button, ButtonTheme } from '@/components/react/primary/Button'

type ClinicalCalendarId = 'consulta' | 'cirugia' | 'bloqueo'
type AppointmentStatus = 'pending' | 'confirmed' | 'attended' | 'cancelled'
type AppointmentType = 'first-visit' | 'follow-up' | 'emergency'

type ClinicalMetadata = {
  status: AppointmentStatus
  type: AppointmentType
  patientId: string
  isTelemedicine: boolean
}

type ClinicalEvent = CalendarEvent & {
  calendarId: ClinicalCalendarId
  metadata: ClinicalMetadata
}

const appointmentTypeLabel: Record<AppointmentType, string> = {
  'first-visit': 'Primera vez',
  'follow-up': 'Control',
  emergency: 'Urgencia',
}

const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  attended: 'Atendida',
  cancelled: 'Cancelada',
}

function withClinicalEventUI(event: ClinicalEvent): ClinicalEvent {
  const currentOptions = event._options ?? {}
  const existingClasses = currentOptions.additionalClasses ?? []
  const uniqueClasses = Array.from(
    new Set([
      ...existingClasses,
      `sx-calendar-${event.calendarId}`,
      `sx-status-${event.metadata.status}`,
    ])
  )

  return {
    ...event,
    _options: {
      ...currentOptions,
      additionalClasses: uniqueClasses,
      disableDND: event.calendarId === 'bloqueo',
      disableResize: event.calendarId === 'bloqueo',
    },
  }
}

export default function MedicalCalendar() {
  const eventModalPlugin = useMemo(() => createEventModalPlugin(), [])
  const dragAndDropPlugin = useMemo(() => createDragAndDropPlugin(), [])

  const selectedDate = useMemo(() => {
    const todayString = Temporal.Now.zonedDateTimeISO().toPlainDate().toString()
    return Temporal.PlainDate.from(todayString)
  }, [])

  const calendars: Record<ClinicalCalendarId, CalendarType> = useMemo(
    () => ({
      consulta: {
        colorName: 'consulta',
        label: 'Consulta',
        lightColors: {
          main: '#0F62FE',
          container: '#BAE0FD',
          onContainer: '#001D6C',
        },
        darkColors: {
          main: '#78A9FF',
          container: '#003A6D',
          onContainer: '#E6F2FF',
        },
      },
      cirugia: {
        colorName: 'cirugia',
        label: 'Cirugía',
        lightColors: {
          main: '#DA1E28',
          container: '#FFD7D9',
          onContainer: '#5C0007',
        },
        darkColors: {
          main: '#FF8389',
          container: '#75000D',
          onContainer: '#FFECEE',
        },
      },
      bloqueo: {
        colorName: 'bloqueo',
        label: 'Bloqueo',
        readonly: true,
        lightColors: {
          main: '#4D5358',
          container: '#E0E0E0',
          onContainer: '#121619',
        },
        darkColors: {
          main: '#C1C7CD',
          container: '#343A3F',
          onContainer: '#F2F4F8',
        },
      },
    }),
    []
  )

  const events = useMemo<ClinicalEvent[]>(() => {
    const now = Temporal.Now.zonedDateTimeISO()
    const start1 = now.with({ hour: 9, minute: 0, second: 0, millisecond: 0 })
    const start2 = now.with({ hour: 11, minute: 30, second: 0, millisecond: 0 })
    const start3 = now.with({ hour: 13, minute: 0, second: 0, millisecond: 0 })

    return [
      withClinicalEventUI({
        id: 'consulta-001',
        title: 'María Pérez',
        start: start1,
        end: start1.add({ minutes: 30 }),
        calendarId: 'consulta',
        metadata: {
          status: 'confirmed',
          type: 'first-visit',
          patientId: '3b7d7f44-6a9a-4d2c-9ac2-7259fd2c2c2f',
          isTelemedicine: false,
        },
      }),
      withClinicalEventUI({
        id: 'cirugia-010',
        title: 'Carlos Gómez',
        start: start2,
        end: start2.add({ hours: 1 }),
        calendarId: 'cirugia',
        metadata: {
          status: 'pending',
          type: 'emergency',
          patientId: '9b3c2c0d-1f35-4f09-89f8-2d88c0db93d5',
          isTelemedicine: false,
        },
      }),
      withClinicalEventUI({
        id: 'bloqueo-almuerzo',
        title: 'Bloqueo: Almuerzo',
        start: start3,
        end: start3.add({ hours: 1 }),
        calendarId: 'bloqueo',
        metadata: {
          status: 'confirmed',
          type: 'follow-up',
          patientId: '00000000-0000-0000-0000-000000000000',
          isTelemedicine: false,
        },
      }),
    ]
  }, [])

  const calendar = useNextCalendarApp({
    locale: 'es-ES',
    firstDayOfWeek: 1,
    selectedDate,
    dayBoundaries: {
      start: '06:00',
      end: '22:00',
    },
    defaultView: 'week',
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewList()],

    calendars,
    events,

    callbacks: {
      onBeforeEventUpdate: (oldEvent: CalendarEvent, _newEvent: CalendarEvent) => {
        return oldEvent.calendarId !== 'bloqueo'
      },
    },

    plugins: [dragAndDropPlugin, eventModalPlugin],
  })

  const customComponents = useMemo(() => {
    const ClinicalEventModal = ({ calendarEvent }: { calendarEvent?: CalendarEvent }) => {
      const clinicalEvent = calendarEvent as ClinicalEvent | undefined
      const metadata = clinicalEvent?.metadata

      if (!clinicalEvent || !metadata) return null

      const patientName = clinicalEvent.title ?? 'Paciente'
      const typeLabel = appointmentTypeLabel[metadata.type] ?? metadata.type
      const status = metadata.status

      const goToPatient = () => {
        window.location.assign(`/dashboard/pacientes/${metadata.patientId}`)
      }

      const startTeleconsult = () => {
        window.location.assign(`/dashboard/pacientes/${metadata.patientId}?teleconsulta=1`)
      }

      const setStatus = (nextStatus: AppointmentStatus) => {
        if (!calendar) return
        const updated = withClinicalEventUI({
          ...(clinicalEvent as ClinicalEvent),
          metadata: {
            ...metadata,
            status: nextStatus,
          },
        })

        calendar.events.update(updated)
        eventModalPlugin.close()
      }

      return (
        <div className="sx-event-modal-clinic p-4 space-y-4">
          <div>
            <div className="text-base font-semibold text-primary-800">{patientName}</div>
            <div className="text-sm text-primary-700">{typeLabel}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              label="Ver Historia Clínica"
              variant={ButtonTheme.SECONDARY}
              size="sm"
              onClick={goToPatient}
            />
            {metadata.isTelemedicine ? (
              <Button
                label="Iniciar Teleconsulta"
                variant={ButtonTheme.PRIMARY}
                size="sm"
                onClick={startTeleconsult}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-primary-700">Estado</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(appointmentStatusLabel) as AppointmentStatus[]).map((next) => (
                <Button
                  key={next}
                  label={appointmentStatusLabel[next]}
                  variant={next === 'cancelled' ? ButtonTheme.DANGER_GHOST : ButtonTheme.GHOST}
                  size="sm"
                  disabled={status === next}
                  onClick={() => setStatus(next)}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }

    return { eventModal: ClinicalEventModal }
  }, [calendar, eventModalPlugin])

  return (
    // 3. ALTURA DEFINIDA: Si el padre no tiene altura, los cálculos de coordenadas de Temporal fallan.
    <div className="calendar-container h-full min-h-0 overflow-hidden">
      <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
    </div>
  )
}