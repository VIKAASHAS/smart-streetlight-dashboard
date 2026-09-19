import React from "react";

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = "blue", onClick, active = false }) => {
  const colorMap = {
    blue: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    green: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    yellow: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    red: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900",
    purple: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      } ${
        active 
          ? "ring-2 ring-brand-500 border-transparent shadow-sm" 
          : "border-slate-200/80 dark:border-slate-800 shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};
