import React, { useState } from "react";
import { Zap, Shield, User, Sparkles, AlertCircle, ArrowRight, Activity, Wrench, Sun, Moon, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const Login = () => {
  const { login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [roleTab, setRoleTab] = useState("admin"); // "admin" or "user"
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
  // Validation error states
  const [nameError, setNameError] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role) => {
    setRoleTab(role);
    setName("");
    setIdentifier("");
    setPassword("");
    setNameError("");
    setIdentifierError("");
    setPasswordError("");
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    
    let hasError = false;

    // Validate Name for Common User
    if (roleTab === "user") {
      if (!name || !name.trim()) {
        setNameError("Please enter your name.");
        hasError = true;
      } else {
        setNameError("");
      }
    }

    // Validate identifier (username/email)
    if (!identifier || !identifier.trim()) {
      setIdentifierError("Please enter your username/email.");
      hasError = true;
    } else {
      setIdentifierError("");
    }

    // Validate password
    if (!password || !password.trim()) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    setIsLoading(true);
    const result = await login(identifier.trim(), password.trim(), roleTab, roleTab === "user" ? name.trim() : undefined);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error || "Invalid username/email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 transition-colors duration-200">
      {/* Top Brand Banner */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-black">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              SmartCity Light AI
            </h1>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">Predictive Infrastructure Platform</p>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:border-brand-500 transition-all cursor-pointer"
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
        </div>
      </header>

      {/* Main Login Centerpiece */}
      <main className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-8">
        {/* Left Concept & Value Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            AI-Enabled Predictive Platform
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
            AI-Enabled Predictive Maintenance Dashboard for Smart Streetlight
          </h2>

          <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
            "Predict problems before the streetlight fails."
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Continuously monitors power draw, temperature shifts, switching cycles, and luminous output. Automatically pinpoints failing luminaires before darkness impacts citizens.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs mb-1">
                <Activity className="w-4 h-4" /> Explainable AI Risk
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Health scores (0–100) and plain-language root cause detection.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
                <Wrench className="w-4 h-4" /> Smart Triage
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Combines sensor anomalies with citizen complaint reports.</p>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-400/10 to-amber-300/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Portal Sign In</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Select your role and enter your credentials
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-6 border border-slate-200/60 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  roleTab === "admin"
                    ? "bg-slate-900 dark:bg-brand-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("user")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  roleTab === "user"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Common User Login</span>
              </button>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Form with Empty Fields and Strict Validation */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Field 1: Name (Required for Common User) */}
              {roleTab === "user" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      autoComplete="off"
                      placeholder="Enter your full name (e.g. Alex Johnson)"
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError("");
                        if (serverError) setServerError("");
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all ${
                        nameError
                          ? "border-rose-500 ring-2 ring-rose-500/20"
                          : "border-slate-300 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Field 2: Username / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {roleTab === "admin" ? "Admin Email or Username" : "User Email or Username"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    placeholder={roleTab === "admin" ? "e.g. admin@citylight.gov" : "e.g. user@citylight.gov"}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (identifierError) setIdentifierError("");
                      if (serverError) setServerError("");
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all ${
                      identifierError
                        ? "border-rose-500 ring-2 ring-rose-500/20"
                        : "border-slate-300 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                    }`}
                  />
                </div>
                {identifierError && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{identifierError}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                      if (serverError) setServerError("");
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all ${
                      passwordError
                        ? "border-rose-500 ring-2 ring-rose-500/20"
                        : "border-slate-300 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                    }`}
                  />
                </div>
                {passwordError && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  roleTab === "admin"
                    ? "bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                } disabled:opacity-50`}
              >
                <span>{isLoading ? "Signing In..." : roleTab === "admin" ? "Sign In as Admin" : "Sign In as Common User"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Discreet credentials helper for college demonstration */}
            <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">System Credentials:</span>
              <div className="flex justify-between flex-wrap gap-1">
                <span>Admin: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">admin@citylight.gov</code> / <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">admin123</code></span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span>Citizen: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">user@citylight.gov</code> / <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">user123</code></span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="max-w-6xl mx-auto w-full text-center py-4 text-xs text-slate-500 dark:text-slate-400">
        AI-Enabled Predictive Maintenance Dashboard for Smart Streetlight • Software-Only Predictive Simulation
      </footer>
    </div>
  );
};
