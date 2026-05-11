import { FaChartColumn } from "react-icons/fa6";

export default function ActivityChart() {
  const activityData = [
    { day: "Lun", count: 18 },
    { day: "Mar", count: 25 },
    { day: "Mié", count: 15 },
    { day: "Jue", count: 32 },
    { day: "Vie", count: 22 },
    { day: "Sáb", count: 10 },
  ];

  const max = Math.max(...activityData.map((d) => d.count));

  return (
    <div className="bg-white p-2 h-full flex flex-col justify-between ">

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-primary-800 text-sm flex items-center gap-2 uppercase tracking-wide">
			<FaChartColumn size={18} className="text-blue-500" /> Flujo de Pacientes
        </h3>
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Últimos 6 días</span>
      </div>


      <div className="mb-6">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Total Atenciones</p>
        <h4 className="text-2xl font-black text-slate-800">122</h4>
      </div>

      <div className="flex items-end justify-between gap-2 h-32 w-full px-2 flex-1">
        {activityData.map((data, i) => {
          let barColor = "bg-slate-200"; 
          if (data.count >= 30) barColor = "bg-orange-500"; 
          if (data.day === "Jue") barColor = "bg-[#1e3a8a]"; 

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full relative flex justify-center">
                <div className="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-20">
                  {data.count} pacientes
                </div>
                <div 
                  className={`w-full max-w-[14px] rounded-full transition-all duration-500 cursor-pointer ${barColor} group-hover:brightness-110`}
                  style={{ height: `${(data.count / max) * 100}px` }}
                ></div>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase">{data.day}</span>
            </div>
          );
        })}
      </div>

      {/* <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
        <p className="text-[9px] text-slate-400 font-medium italic">* Datos de consulta semanal</p>
        <button className="text-[9px] font-black text-blue-600 uppercase hover:text-blue-800 transition-colors">Ver Detalles</button>
      </div> */}
    </div>
  );
}