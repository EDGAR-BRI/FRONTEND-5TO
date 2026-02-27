import { useMemo } from 'react'
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createPreactView,
  setRangeForMonth,
  toJSDate,
  type CalendarEvent,
  type CalendarType,
} from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { mergeLocales, translations as sxTranslations, esES } from '@schedule-x/translations'
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'

import { Fragment, h } from 'preact'

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

type ListViewProps = {
  $app: any
  id: string
}

function toPlainDateString(dateTime: any): string {
  if (!dateTime) return ''
  if (typeof dateTime.toPlainDate === 'function') return dateTime.toPlainDate().toString()
  return String(dateTime)
}

function buildDaysWithEventsInRange($app: any): Array<{ date: string; events: any[] }> {
  const range = $app?.calendarState?.range?.value
  if (!range?.start || !range?.end) return []

  const start = range.start.toPlainDate()
  const end = range.end.toPlainDate()

  const events: any[] = $app?.calendarEvents?.list?.value ?? []
  const byDate = new Map<string, any[]>()

  for (const event of events) {
    const startDateString = toPlainDateString(event.start)
    const endDateString = toPlainDateString(event.end)
    if (!startDateString) continue

    const eventStart = Temporal.PlainDate.from(startDateString)
    const eventEnd = endDateString ? Temporal.PlainDate.from(endDateString) : eventStart

    const clippedStart = Temporal.PlainDate.compare(eventStart, start) < 0 ? start : eventStart
    const clippedEnd = Temporal.PlainDate.compare(eventEnd, end) > 0 ? end : eventEnd

    if (Temporal.PlainDate.compare(clippedStart, clippedEnd) > 0) continue

    for (
      let cursor = clippedStart;
      Temporal.PlainDate.compare(cursor, clippedEnd) <= 0;
      cursor = cursor.add({ days: 1 })
    ) {
      const key = cursor.toString()
      const arr = byDate.get(key)
      if (arr) arr.push(event)
      else byDate.set(key, [event])
    }
  }

  const days = Array.from(byDate.entries())
    .map(([date, dayEvents]) => ({ date, events: dayEvents }))
    .sort((a, b) => a.date.localeCompare(b.date))

  for (const day of days) {
    day.events.sort((a, b) => String(a.start).localeCompare(String(b.start)))
  }

  return days
}

function formatListTimeAmPm($app: any, event: any): string {
  if (!(event.start instanceof Temporal.ZonedDateTime) || !(event.end instanceof Temporal.ZonedDateTime)) {
    return ''
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }

  const startZDT = Temporal.ZonedDateTime.from({
    year: event.start.year,
    month: event.start.month,
    day: event.start.day,
    hour: event.start.hour,
    minute: event.start.minute,
    timeZone: $app.config.timezone.value,
  })
  const endZDT = Temporal.ZonedDateTime.from({
    year: event.end.year,
    month: event.end.month,
    day: event.end.day,
    hour: event.end.hour,
    minute: event.end.minute,
    timeZone: $app.config.timezone.value,
  })

  const startLabel = startZDT.toLocaleString('en-US', timeOptions)
  const endLabel = endZDT.toLocaleString('en-US', timeOptions)
  return `${startLabel} – ${endLabel}`
}

const viewListAmPm = createPreactView({
  name: 'list',
  label: 'Lista',
  setDateRange: setRangeForMonth,
  Component: ({ $app, id }: ListViewProps) => {
    const daysWithEvents = buildDaysWithEventsInRange($app)

    return h(
      'div',
      { id, className: 'sx__list-wrapper' },
      daysWithEvents.length === 0
        ? h('div', { className: 'sx__list-no-events' }, $app.translate('No events'))
        : daysWithEvents.map((day) => {
            const dayLabel = toJSDate(day.date).toLocaleDateString($app.config.locale.value, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })

            return h(
              'div',
              { key: day.date, className: 'sx__list-day', 'data-date': day.date },
              h(
                'div',
                { className: 'sx__list-day-header' },
                h('div', { className: 'sx__list-day-date' }, dayLabel)
              ),
              h(
                'div',
                { className: 'sx__list-day-events' },
                day.events.map((event) => {
                  const classNames = ['sx__event', 'sx__list-event']
                  if (event?._options?.additionalClasses) classNames.push(...event._options.additionalClasses)

                  const onClick = (e: UIEvent) => {
                    const target = e.currentTarget as unknown as HTMLElement | null
                    const plugin = $app?.config?.plugins?.eventModal
                    if (plugin && target) {
                      plugin.calendarEventElement.value = target
                      plugin.setCalendarEvent(event, target.getBoundingClientRect())
                    }

                    $app?.config?.callbacks?.onEventClick?.(
                      event._getExternalEvent ? event._getExternalEvent() : event,
                      e
                    )
                  }

                  const onDoubleClick = (e: UIEvent) => {
                    $app?.config?.callbacks?.onDoubleClickEvent?.(
                      event._getExternalEvent ? event._getExternalEvent() : event,
                      e
                    )
                  }

                  const onKeyDown = (e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      onClick(e as unknown as UIEvent)
                    }
                  }

                  const dayDate = day.date
                  const startDate = toPlainDateString(event.start)
                  const endDate = toPlainDateString(event.end)
                  const isMultiDay = startDate && endDate && startDate !== endDate
                  const isFirstDay = startDate === dayDate
                  const isLastDay = endDate === dayDate

                  const timeText = formatListTimeAmPm($app, event)
                  const [startText, endText] = timeText ? timeText.split(' – ') : ['', '']

                  const timeNode = !timeText
                    ? null
                    : !isMultiDay
                      ? h(
                          Fragment,
                          null,
                          h('div', { className: 'sx__list-event-start-time' }, startText),
                          h('div', { className: 'sx__list-event-end-time' }, endText)
                        )
                      : isFirstDay
                        ? h(
                            Fragment,
                            null,
                            h('div', { className: 'sx__list-event-start-time' }, startText),
                            h('div', { className: 'sx__list-event-arrow' }, '→')
                          )
                        : isLastDay
                          ? h(
                              Fragment,
                              null,
                              h('div', { className: 'sx__list-event-arrow' }, '←'),
                              h('div', { className: 'sx__list-event-end-time' }, endText)
                            )
                          : h('div', { className: 'sx__list-event-arrow' }, '↔')

                  return h(
                    'div',
                    {
                      key: event.id,
                      className: classNames.join(' '),
                      onClick,
                      onDblClick: onDoubleClick,
                      onKeyDown,
                      tabIndex: 0,
                      role: 'button',
                    },
                    h('div', {
                      className: 'sx__list-event-color-line',
                      style: { backgroundColor: `var(--sx-color-${event._color})` },
                    }),
                    h(
                      'div',
                      { className: 'sx__list-event-content' },
                      h('div', { className: 'sx__list-event-title' }, event.title),
                      h('div', { className: 'sx__list-event-times' }, timeNode)
                    )
                  )
                })
              ),
              h('div', { className: 'sx__list-day-margin' })
            )
          })
    )
  },
  hasSmallScreenCompat: true,
  hasWideScreenCompat: true,
  backwardForwardFn: (to: Temporal.ZonedDateTime | Temporal.PlainDate, n: number) => to.add({ months: n }),
  backwardForwardUnits: 1,
})

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

function atTime12(
  base: Temporal.ZonedDateTime,
  hour: number,
  minute: number,
  dayPeriod: 'AM' | 'PM'
) {
  const normalizedHour = ((hour % 12) + 12) % 12
  const hour24 = dayPeriod === 'PM' ? normalizedHour + 12 : normalizedHour
  return base.with({ hour: hour24, minute, second: 0, millisecond: 0 })
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
    const start1 = atTime12(now, 9, 0, 'AM')
    const start2 = atTime12(now, 11, 30, 'AM')
    const start3 = atTime12(now, 1, 0, 'PM')

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
    // NI SE LES OCURRA MOVER ESTA CONFIGURACIÓN DE LUGAR, O SE ROMPE LA INTERNACIONALIZACIÓN DE LAS FECHAS 
    // Y TODO EL PROYECTO SE IRA A LA MIERDA:
    locale: 'es-US',
    translations: mergeLocales(sxTranslations, { esUS: esES }),
    // FIN DE LA CONFIGURACIÓN CRÍTICA PARA FECHAS. NO MOVER NI MODIFICAR NADA.
    firstDayOfWeek: 1,
    selectedDate,
    dayBoundaries: {
      start: '06:00',
      end: '22:00',
    },
    weekOptions: {
      timeAxisFormatOptions: {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      },
    },
    defaultView: 'week',
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), viewListAmPm],

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