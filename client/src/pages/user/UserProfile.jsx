import React from "react";
import { User, Mail, MapPin, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Citizen Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Your municipal resident account details.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {user?.name?.slice(0, 2).toUpperCase() || "US"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Verified Resident
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Residential Ward</span>
            <strong className="text-slate-800">{user?.location || "Metro Ward 4"}</strong>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Account Access Role</span>
            <strong className="text-emerald-700">Common User</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
