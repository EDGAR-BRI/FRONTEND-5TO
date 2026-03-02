import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';


interface Cita {
  id: number;
  doctor: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: string;
}

interface EventoCalendario {
  id: number;
  title: string;
  start: Date;
  end: Date;
  estado: string;
}


const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const mensajesEspanol = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Cita',
  noEventsInRange: 'No hay citas en este rango.',
};

//arreglo tipo cita
export default function CalendarWidget({ citas }: { citas: Cita[] }) {
  
 
  const eventosAdaptados: EventoCalendario[] = citas.map((cita: Cita) => {
    const fechaBase = new Date(`${cita.fecha}T${cita.hora.includes('AM') ? cita.hora.replace(' AM', '') : cita.hora.replace(' PM', '')}`);
    
    if (cita.hora.includes('PM') && !cita.hora.startsWith('12')) {
        fechaBase.setHours(fechaBase.getHours() + 12);
    }

    const fechaFin = new Date(fechaBase);
    fechaFin.setMinutes(fechaFin.getMinutes() + 45);

    return {
      id: cita.id,
      title: `${cita.doctor} - ${cita.especialidad}`,
      start: fechaBase,
      end: fechaFin,
      estado: cita.estado
    };
  });

  const aplicarEstilosEvento = (evento: EventoCalendario) => {
    let bgClass = '';
    
    switch (evento.estado) {
      case 'Pendiente': bgClass = 'bg-amber-500'; break;
      case 'Confirmada': bgClass = 'bg-green-500'; break;
      case 'Cancelada': bgClass = 'bg-red-500'; break;
      case 'Finalizada': bgClass = 'bg-blue-500'; break;
      default: bgClass = 'bg-gray-500';
    }

    return {
      className: `${bgClass} text-white border-none rounded-md px-2 py-1 text-xs font-semibold shadow-sm`,
    };
  };

  return (
    <div className="h-[600px] w-full bg-white p-4">
        <style>{`
            .rbc-btn-group button { color: #374151; border-color: #E5E7EB; }
            .rbc-btn-group .rbc-active { background-color: #EFF6FF; color: #2563EB; box-shadow: none; }
            .rbc-today { background-color: #F8FAFC; }
            .rbc-header { padding: 8px 0; font-weight: 600; color: #6B7280; font-size: 0.875rem; text-transform: capitalize;}
        `}</style>
        
        <Calendar
            localizer={localizer}
            events={eventosAdaptados}
            startAccessor="start"
            endAccessor="end"
            culture="es"
            messages={mensajesEspanol}
            eventPropGetter={aplicarEstilosEvento}
            views={['month', 'week', 'day']}
            defaultView="month"
            step={30}
            showMultiDayTimes
        />
    </div>
  );
}
