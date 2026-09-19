import React from "react";
import { Lightbulb, Send, Star, FileText, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSimulation } from "../../context/SimulationContext";

export const UserDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { summary, complaints, feedback } = useSimulation();

  const userComplaints = (complaints || []).filter(c => c.userId === user?.id || c.userEmail === user?.email);
  const userFeedback = (feedback || []).filter(f => f.userId === user?.id || f.userEmail === user?.email);
  const resolvedComplaints = userComplaints.filter(c => c.status === "Resolved");

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-emerald-50 mb-3">
            Citizen Services Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            Report municipal streetlight defects, track resolution notes from municipal administrators, and provide streetlight-specific ratings and feedback.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("report-problem")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Report a Problem</span>
            </button>
            <button
              onClick={() => onNavigate("user-feedback")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-extrabold text-xs border border-emerald-500/40 transition-all cursor-pointer"
            >
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Give Feedback</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitored Streetlights</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{summary?.total || 24}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">My Reported Complaints</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{userComplaints.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resolved Complaints</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{resolvedComplaints.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>Citizen Portal Services</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate("my-complaints")}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-brand-500 text-left transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" /> My Complaints
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {userComplaints.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Track real-time status and municipal response notes on reported defects.
            </p>
          </button>

          <button
            onClick={() => onNavigate("user-feedback")}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-brand-500 text-left transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Give Feedback
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                {userFeedback.length} submitted
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Rate specific streetlights and municipal repair resolution quality.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
