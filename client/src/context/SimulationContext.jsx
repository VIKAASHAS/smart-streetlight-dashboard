import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total: 24,
    healthy: 19,
    attention: 2,
    critical: 3,
    activeFailuresCount: 3,
    activeOnlyCount: 3,
    pendingOnlyCount: 0,
    resolvedToday: 0,
    overallRiskScore: 32
  });
  const [spotlight, setSpotlight] = useState(null);
  const [simulationState, setSimulationState] = useState({ cycle: 18, activeScenario: "normal" });
  const [streetlights, setStreetlights] = useState([]);
  const [failures, setFailures] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [predictionsHistory, setPredictionsHistory] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [selectedLight, setSelectedLight] = useState(null);

  const fetchFeedback = useCallback(async () => {
    try {
      const url = user?.role === "user" ? `/api/feedback?userId=${user.id}` : "/api/feedback";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    }
  }, [user]);

  const fetchComplaints = useCallback(async () => {
    try {
      const url = user?.role === "user" ? `/api/complaints?userId=${user.id}` : "/api/complaints";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    }
  }, [user]);

  const fetchAllData = useCallback(async () => {
    try {
      const compUrl = user?.role === "user" ? `/api/complaints?userId=${user.id}` : "/api/complaints";
      const fbUrl = user?.role === "user" ? `/api/feedback?userId=${user.id}` : "/api/feedback";
      const [statusRes, lightsRes, historyRes, notifRes, compRes, fbRes] = await Promise.all([
        fetch("/api/status"),
        fetch("/api/streetlights"),
        fetch("/api/predictions/history"),
        fetch(`/api/notifications?role=${user?.role || "admin"}&userId=${user?.id || ""}`),
        fetch(compUrl),
        fetch(fbUrl)
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setSummary(data.summary || {});
        setSpotlight(data.spotlight || null);
        if (data.failures) setFailures(data.failures);
        if (data.recentActivity) setRecentActivity(data.recentActivity);
        if (data.simulation) setSimulationState(data.simulation);
      }

      if (lightsRes.ok) {
        const lights = await lightsRes.json();
        setStreetlights(lights);
      }

      if (historyRes.ok) {
        const hists = await historyRes.json();
        setPredictionsHistory(hists);
      }

      if (notifRes.ok) {
        const notifs = await notifRes.json();
        setNotifications(notifs);
      }

      if (compRes.ok) {
        const comps = await compRes.json();
        setComplaints(comps);
      }

      if (fbRes.ok) {
        const fbs = await fbRes.json();
        setFeedback(fbs);
      }
    } catch (err) {
      console.error("Failed to fetch simulation data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Submit Complaint
  const submitComplaint = async (complaintData) => {
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintData)
      });
      if (res.ok) {
        const newComp = await res.json();
        await fetchAllData();
        return { success: true, complaint: newComp };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || "Failed to submit complaint." };
      }
    } catch (err) {
      console.error("Submit complaint error:", err);
      return { success: false, error: "Network error submitting complaint." };
    }
  };

  // Update Complaint Status (Admin)
  const updateComplaintStatus = async (complaintId, statusOrPayload, adminResponseArg) => {
    try {
      let bodyData = {};
      if (typeof statusOrPayload === "object" && statusOrPayload !== null) {
        bodyData = statusOrPayload;
      } else {
        bodyData = { status: statusOrPayload, adminResponse: adminResponseArg };
      }

      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        await fetchAllData();
        return { success: true };
      }
    } catch (err) {
      console.error("Update complaint status error:", err);
    }
    return { success: false };
  };

  // Submit Feedback
  const submitFeedback = async (feedbackData) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...feedbackData,
          userName: feedbackData.userName || user?.name,
          userId: feedbackData.userId || user?.id,
          userEmail: feedbackData.userEmail || user?.email
        })
      });
      if (res.ok) {
        const newFb = await res.json();
        await fetchAllData();
        await fetchFeedback();
        return { success: true, feedback: newFb };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || "Failed to submit feedback." };
      }
    } catch (err) {
      console.error("Submit feedback error:", err);
      return { success: false, error: "Network error submitting feedback." };
    }
  };

  // Advance simulation cycle
  const advanceCycle = async (scenario = null) => {
    setAdvancing(true);
    try {
      const res = await fetch("/api/simulation/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Failed to advance cycle:", err);
    } finally {
      setAdvancing(false);
    }
  };

  // Reset database to initial state
  const resetDemoData = async () => {
    setLoading(true);
    try {
      await fetch("/api/simulation/reset", { method: "POST" });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to reset:", err);
    } finally {
      setLoading(false);
    }
  };

  // Process AI SL Action Confirmation (Resolved / Not Resolved)
  const handleSLAction = async (failureId, isResolved) => {
    try {
      const res = await fetch(`/api/failures/${failureId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.stats) setSummary(result.stats);
        if (result.recentActivity) setRecentActivity(result.recentActivity);
        await fetchAllData();
        return result;
      }
    } catch (err) {
      console.error("Failed to process SL action:", err);
    }
    return null;
  };

  // Mark notifications read
  const markNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user?.role, userId: user?.id })
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        summary,
        spotlight,
        simulationState,
        streetlights,
        failures,
        recentActivity,
        predictionsHistory,
        complaints,
        feedback,
        notifications,
        loading,
        advancing,
        selectedLight,
        setSelectedLight,
        fetchAllData,
        fetchComplaints,
        fetchFeedback,
        submitComplaint,
        updateComplaintStatus,
        submitFeedback,
        advanceCycle,
        resetDemoData,
        handleSLAction,
        markNotificationsRead
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    return {
      summary: {},
      spotlight: null,
      simulationState: { cycle: 18, activeScenario: "normal" },
      streetlights: [],
      failures: [],
      recentActivity: [],
      predictionsHistory: [],
      complaints: [],
      feedback: [],
      notifications: [],
      loading: false,
      advancing: false,
      selectedLight: null,
      setSelectedLight: () => {},
      fetchAllData: async () => {},
      fetchComplaints: async () => {},
      fetchFeedback: async () => {},
      submitComplaint: async () => ({ success: false }),
      updateComplaintStatus: async () => ({ success: false }),
      submitFeedback: async () => ({ success: false }),
      advanceCycle: async () => {},
      resetDemoData: async () => {},
      handleSLAction: async () => null,
      markNotificationsRead: async () => {}
    };
  }
  return context;
};
