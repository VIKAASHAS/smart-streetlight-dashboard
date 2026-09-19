import React, { useState } from "react";
import { Navigation } from "lucide-react";

export const CityMapView = ({ streetlights = [], onSelectLight }) => {
  const [selectedZone, setSelectedZone] = useState("all");

  const zones = ["all", "North District", "South District", "East District", "West District"];

  const filteredLights = selectedZone === "all"
    ? streetlights
    : streetlights.filter(l => l.zone.toLowerCase() === selectedZone.toLowerCase());

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Citywide Streetlight Grid Map</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive visual grid across municipal sectors. Click any pole for telemetry details.
          </p>
        </div>

        {/* Zone Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {zones.map(z => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedZone === z
                  ? "bg-slate-900 dark:bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {z === "all" ? "All Districts" : z}
            </button>
          ))}
        </div>
      </div>

      {/* Streetlight Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredLights.map(light => {
          const isCritical = light.currentStatus === "Critical" || light.healthScore < 60;
          const isAttention = light.currentStatus === "Needs Attention" || (light.healthScore >= 60 && light.healthScore < 90);
          
          let cardBg = "bg-slate-50/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30";
          let pinColor = "text-emerald-500 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400";
          
          if (isCritical) {
            cardBg = "bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 hover:border-rose-400 hover:bg-rose-100/40";
            pinColor = "text-rose-600 dark:text-rose-400 bg-rose-200 dark:bg-rose-900 animate-pulse";
          } else if (isAttention) {
            cardBg = "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 hover:border-amber-400 hover:bg-amber-100/40";
            pinColor = "text-amber-600 dark:text-amber-400 bg-amber-200 dark:bg-amber-900";
          }

          return (
            <div
              key={light.id}
              onClick={() => onSelectLight(light)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${cardBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{light.id}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pinColor}`}>
                    ●
                  </div>
                </div>
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate" title={light.location}>
                  {light.location.split("&")[0] || light.location}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mb-2">
                  {light.zone}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300">{light.healthScore} pts</span>
                <span className={`text-[10px] font-bold ${
                  isCritical ? "text-rose-600 dark:text-rose-400" : isAttention ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {light.powerConsumption}W
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Green: Healthy (90-100)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Yellow: Needs Attention (60-89)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Red: Critical (&lt;60)</span>
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredLights.length} Poles Monitored</span>
      </div>
    </div>
  );
};
