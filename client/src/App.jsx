import React, { useState, useEffect, Component } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { NotificationDrawer } from "./components/NotificationDrawer";

// Pages
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { StreetlightsList } from "./pages/admin/StreetlightsList";
import { AIPredictions } from "./pages/admin/AIPredictions";
import { ComplaintsAndFeedback } from "./pages/admin/ComplaintsAndFeedback";
import { PredictionHistory } from "./pages/admin/PredictionHistory";
import { AdminProfile } from "./pages/admin/AdminProfile";

import { UserDashboard } from "./pages/user/UserDashboard";
import { ReportProblem } from "./pages/user/ReportProblem";
import { MyComplaints } from "./pages/user/MyComplaints";
import { UserFeedback } from "./pages/user/UserFeedback";
import { UserProfile } from "./pages/user/UserProfile";

// Error Boundary Component to prevent blank screen crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error Boundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            <h2 className="text-xl font-black">Smart Streetlight Portal</h2>
            <p className="text-xs text-slate-400">
              An unexpected error occurred. The application state has been preserved.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-left font-mono text-[11px] text-rose-300 overflow-auto max-h-32">
              {this.state.error?.toString() || "Render exception"}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState(user?.role === "admin" ? "dashboard" : "user-dashboard");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Sync default page if role changes
  useEffect(() => {
    if (user?.role === "admin") {
      setActivePage("dashboard");
    } else if (user?.role === "user") {
      setActivePage("user-dashboard");
    }
  }, [user?.role]);

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    if (user.role === "admin") {
      switch (activePage) {
        case "dashboard":
          return <AdminDashboard onNavigate={setActivePage} />;
        case "streetlights":
          return <StreetlightsList />;
        case "ai-predictions":
          return <AIPredictions />;
        case "complaints":
          return <ComplaintsAndFeedback />;
        case "history":
          return <PredictionHistory />;
        case "profile":
          return <AdminProfile />;
        default:
          return <AdminDashboard onNavigate={setActivePage} />;
      }
    } else {
      switch (activePage) {
        case "user-dashboard":
          return <UserDashboard onNavigate={setActivePage} />;
        case "report-problem":
          return <ReportProblem onNavigate={setActivePage} />;
        case "my-complaints":
          return <MyComplaints onNavigate={setActivePage} />;
        case "user-feedback":
          return <UserFeedback />;
        case "user-profile":
          return <UserProfile />;
        default:
          return <UserDashboard onNavigate={setActivePage} />;
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenNotifications={() => setIsNotifOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SimulationProvider>
            <AppContent />
          </SimulationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
