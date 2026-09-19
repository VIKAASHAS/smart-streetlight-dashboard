import React, { useState } from "react";
import { Zap, Bell, FastForward, RotateCcw, Play, Sparkles, User, Shield, LogOut, Sun, Moon } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const Navbar = ({ onOpenNotifications }) => {
  const { simulationState, advanceCycle, resetDemoData, advancing, notifications } = useSimulation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [selectedScenario, setSelectedScenario] = useState("normal");

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAdvance = (scenario = null) => {
    advanceCycle(scenario || selectedScenario);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 py-3.5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Title & Brand Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              AI-Enabled Predictive Maintenance Dashboard
            </h1>
            <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Predict problems before the streetlight fails.</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-all shadow-xs cursor-pointer"
            title="Toggle Light / Dark Mode"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>☀️ Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-brand-600" />
                <span>🌙 Dark</span>
              </>
            )}
          </button>

          {/* Admin Simulation Controller Pill */}
          {user?.role === "admin" && (
            <div className="hidden md:flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2.5">
                Cycle: <strong className="text-brand-600 dark:text-brand-400">Day {simulationState.cycle}</strong>
              </span>

              {/* Scenario Preset Selector */}
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1 focus:ring-1 focus:ring-brand-500 outline-none"
              >
                <option value="normal">Normal Grid Operation</option>
                <option value="surge_sl24">Scenario: SL-024 Power Surge</option>
                <option value="thermal_sl12">Scenario: SL-012 Heatwave Fault</option>
                <option value="flicker_sl07">Scenario: SL-007 Relay Flicker</option>
                <option value="repair_all">Scenario: Repair All Lights</option>
              </select>

              {/* Step Next Cycle Button */}
              <button
                onClick={() => handleAdvance()}
                disabled={advancing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{advancing ? "Simulating..." : "Next Cycle"}</span>
              </button>

              {/* Reset Data Button */}
              <button
                onClick={resetDemoData}
                title="Reset simulation to initial state"
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Role Badge & Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">{user?.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block uppercase tracking-wider ${
                user?.role === "admin" 
                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800" 
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              }`}>
                {user?.role === "admin" ? "Admin Access" : "Common User"}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout / Switch Account"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
