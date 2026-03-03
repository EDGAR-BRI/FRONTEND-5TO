import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon?: React.ReactNode;
    color?: "primary" | "success" | "danger" | "warning";

}

export const StatsCard = ({ title, value, trend, trendUp, icon, color = "primary" }: StatsCardProps) => {
    const colorClasses = {
        primary: "bg-primary-50 text-primary-700",
        success: "bg-green-50 text-green-700",
        danger: "bg-red-50 text-red-700",
        warning: "bg-yellow-50 text-yellow-700",
    };

    return (
        <article className="bg-primary-100 p-6 rounded-xl border-2 border-primary-300 flex flex-col justify-between h-full transition-all duration-200 cursor-default hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-md hover:shadow-primary-500/30 hover:bg-primary-50/30">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-cool-gray-60 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-cool-gray-90">{value}</h3>
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-xs font-medium">
                    <span className={trendUp ? "text-green-600" : "text-red-600"}>
                        {trendUp ? "↑" : "↓"} {trend}
                    </span>
                    <span className="text-cool-gray-50 ml-2">vs mes anterior</span>
                </div>
            )}
        </article>
    );
};
