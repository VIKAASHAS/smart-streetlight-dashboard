import React from "react";

export const HealthGauge = ({ score = 100, size = 96, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#10b981"; // Emerald
  let textColor = "text-emerald-600";
  let label = "Healthy";

  if (score < 60) {
    strokeColor = "#ef4444"; // Rose
    textColor = "text-rose-600";
    label = "Critical";
  } else if (score < 90) {
    strokeColor = "#f59e0b"; // Amber
    textColor = "text-amber-600";
    label = "Attention";
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-xl font-bold ${textColor}`}>{score}</span>
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};
