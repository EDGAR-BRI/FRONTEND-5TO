import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
} from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'

export default function MedicalCalendar() {
  // CONFIGURACIÓN SENIOR:
  // Definimos la configuración para que el motor Temporal tenga un punto de referencia claro.
  const calendar = useNextCalendarApp({
    // 1. FECHA SELECCIONADA: Obligatoria para evitar que el motor busque la fecha actual del sistema
    // y falle por discrepancias de zona horaria durante la hidratación.
    //selectedDate: Temporal.ZonedDateTime.from('2023-12-04T00:00:00+01:00[Europe/Berlin]'),
    
    locale: 'es-ES',
    firstDayOfWeek: 1,
    defaultView: 'week',
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    
    events: [
      {
        id: 1,
        title: 'Coffee with John',
        start: Temporal.ZonedDateTime.from('2026-02-27T10:05:00+01:00[Europe/Berlin]'),
        end: Temporal.ZonedDateTime.from('2026-02-27T10:35:00+01:00[Europe/Berlin]'),
        },
    ],
    plugins: [
      createDragAndDropPlugin(),
      createEventModalPlugin()
    ]
  })

  return (
    // 3. ALTURA DEFINIDA: Si el padre no tiene altura, los cálculos de coordenadas de Temporal fallan.
    <div className="calendar-container">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}