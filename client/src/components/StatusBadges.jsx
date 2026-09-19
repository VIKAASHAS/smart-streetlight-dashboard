import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";

export const HealthBadge = ({ score, status, size = "md" }) => {
  let color = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  let dotColor = "bg-emerald-500";
  let label = "Healthy";

  if (score < 60 || status === "Critical") {
    color = "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse";
    dotColor = "bg-rose-500";
    label = "Critical";
  } else if (score < 90 || status === "Needs Attention") {
    color = "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    dotColor = "bg-amber-500";
    label = "Needs Attention";
  }

  const px = size === "sm" ? "px-2.5 py-1 text-xs font-semibold" : "px-3 py-1 text-xs font-bold";

  return (
    <span className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-full border ${color} ${px}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}></span>
      <span>{label} ({score})</span>
    </span>
  );
};

export const RiskBadge = ({ risk, size = "md" }) => {
  let bg = "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
  let label = "Low Risk";

  if (risk === "High") {
    bg = "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
    icon = <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-bounce shrink-0" />;
    label = "High Risk";
  } else if (risk === "Medium") {
    bg = "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
    label = "Medium Risk";
  }

  const px = size === "sm" ? "px-2.5 py-1 text-xs font-semibold" : "px-3 py-1 text-xs font-bold";

  return (
    <span className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-xl border ${bg} ${px}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};

export const ComplaintStatusBadge = ({ status }) => {
  const styles = {
    "Submitted": "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    "Under Review": "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    "Maintenance Assigned": "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800",
    "Resolved": "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
  };

  return (
    <span className={`whitespace-nowrap inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles["Submitted"]}`}>
      {status}
    </span>
  );
};
