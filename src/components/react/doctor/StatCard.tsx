import { FaArrowTrendUp, FaCalendarDays, FaUsers, FaFlask } from "react-icons/fa6";

interface Props {
  label: string;
  value: string;
  iconType: "calendar" | "users" | "beaker";
  trend?: string;
}

export default function StatCard({ label, value, iconType, trend }: Props) {
  const icons = {
    calendar: { icon: <FaCalendarDays size={20} />, bg: "bg-blue-50 text-blue-500" },
    users: { icon: <FaUsers size={20} />, bg: "bg-green-50 text-green-500" },
    beaker: { icon: <FaFlask size={20} />, bg: "bg-purple-50 text-purple-500" },
  };

  // Validar que iconType exista, si no, usar calendar como fallback
  const validIconType = iconType && icons[iconType] ? iconType : 'calendar';
  const iconConfig = icons[validIconType];

  // Debug: log para identificar problemas
  if (process.env.NODE_ENV === 'development' && iconType && !icons[iconType]) {
    console.warn(`StatCard: iconType "${iconType}" no es válido. Opciones válidas:`, Object.keys(icons));
  }

  return (
    <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${iconConfig.bg}`}>
          {iconConfig.icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
			<FaArrowTrendUp size={10} /> {trend}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
}