import React from "react";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Sparkles, 
  MessageSquareWarning, 
  Star, 
  History, 
  User, 
  LogOut,
  Send,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSimulation } from "../context/SimulationContext";

export const Sidebar = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { complaints } = useSimulation();

  const isAdmin = user?.role === "admin";
  const pendingComplaintsCount = (complaints || []).filter(c => c.status !== "Resolved").length;

  const adminNavItems = [
    { id: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
    { id: "streetlights", label: "Streetlights Grid", icon: Lightbulb },
    { id: "ai-predictions", label: "AI Predictive Analytics", icon: Sparkles },
    { id: "complaints", label: "Citizen Complaints & Feedback", icon: MessageSquareWarning, badge: pendingComplaintsCount },
    { id: "history", label: "AI Prediction History", icon: History },
    { id: "profile", label: "Admin Profile", icon: User },
  ];

  const userNavItems = [
    { id: "user-dashboard", label: "Citizen Services Portal", icon: LayoutDashboard },
    { id: "report-problem", label: "Report a Problem", icon: Send },
    { id: "my-complaints", label: "My Complaints", icon: FileText },
    { id: "user-feedback", label: "Give Feedback", icon: Star },
    { id: "user-profile", label: "My Profile", icon: User },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 min-h-screen transition-colors duration-200">
      {/* City Portal Header */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shrink-0">
            SM
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">Smart City Portal</h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate">
              {isAdmin ? "Central Command Center" : "Citizen Services Portal"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-4 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer group ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`} />
                <span className="truncate leading-normal text-left">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl p-3 mb-3 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate">{user?.name}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Switch User / Logout</span>
        </button>
      </div>
    </aside>
  );
};
