import { Calendar, Users, FlaskConical, TrendingUp } from "lucide-react";

interface Props {
  label: string;
  value: string;
  iconType: "calendar" | "users" | "beaker";
  trend?: string;
}

export default function StatCard({ label, value, iconType, trend }: Props) {
  const icons = {
    calendar: { icon: <Calendar size={20} />, bg: "bg-blue-50 text-blue-500" },
    users: { icon: <Users size={20} />, bg: "bg-green-50 text-green-500" },
    beaker: { icon: <FlaskConical size={20} />, bg: "bg-yellow-50 text-yellow-500" },
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${icons[iconType].bg}`}>
          {icons[iconType].icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
            <TrendingUp size={10} /> {trend}
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