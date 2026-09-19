import React from "react";
import { X, Bell, CheckCircle2, AlertTriangle, AlertOctagon, Info, Check } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useAuth } from "../context/AuthContext";

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, markNotificationsRead } = useSimulation();
  const { user } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case "critical":
        return <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-colors duration-200">
          {/* Header */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {notifications.filter(n => !n.read).length} unread updates
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={markNotificationsRead}
                title="Mark all as read"
                className="p-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                No notifications right now.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all text-xs ${
                    n.read
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      : "bg-brand-50/50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-900 text-slate-800 dark:text-slate-200 font-medium shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span>}
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-2">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
