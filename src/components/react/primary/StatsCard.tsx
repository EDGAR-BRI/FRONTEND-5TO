import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    trendLabel?: string;
    subText?: string;
    subTextClass?: string;
    icon?: React.ReactNode;
    color?: "primary" | "success" | "danger" | "warning";
    variant?: "default" | "compact";
    className?: string;
}

export const StatsCard = ({ title, value, trend, trendUp, trendLabel = "vs mes anterior", subText, subTextClass, icon, color = "primary", variant = "default", className }: StatsCardProps) => {
    const colorClasses = {
        primary: "bg-primary-200 text-primary-700",
        success: "bg-green-50 text-green-700",
        danger: "bg-red-50 text-red-700",
        warning: "bg-yellow-50 text-yellow-700",
    };

    const baseClasses = "bg-primary-100 rounded-xl border border-primary-200 transition-all duration-200 cursor-default hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-md hover:shadow-primary-500/30 hover:bg-primary-50/30";

    if (variant === "compact") {
        return (
            <article className={`${baseClasses} ${className || ""} p-4 flex items-center gap-4 overflow-hidden`}>
                {icon && (
                    <div className={`p-3 rounded-xl shrink-0 ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
                <div className="min-w-0">
                    <p className="text-sm font-medium text-cool-gray-60 leading-tight truncate">{title}</p>
                    <h3 className="text-2xl font-bold text-cool-gray-90 leading-tight">{value}</h3>
                    {trend && !subText && (
                        <span className={`text-xs font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
                            {trendUp ? "↑" : "↓"} {trend}
                        </span>
                    )}
                    {subText && (
                        <span className={`text-xs font-medium ${subTextClass || "text-cool-gray-50"}`}>
                            {subText}
                        </span>
                    )}
                </div>
            </article>
        );
    }

    return (
        <article className={`${baseClasses} ${className || ""} p-6 flex flex-col justify-between h-full`}>
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
            {trend && !subText && (
                <div className="mt-4 flex items-center text-xs font-medium">
                    <span className={trendUp ? "text-green-600" : "text-red-600"}>
                        {trendUp ? "↑" : "↓"} {trend}
                    </span>
                    <span className="text-cool-gray-50 ml-2">{trendLabel}</span>
                </div>
            )}
            {subText && (
                <div className="mt-4 flex items-center text-xs font-medium">
                    <span className={subTextClass || "text-cool-gray-50"}>{subText}</span>
                </div>
            )}
        </article>
    );
};
