import React, { useState } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Image as ImageIcon,
  MessageSquare,
  Filter,
  User,
  MapPin,
  Star,
  Lightbulb
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";

export const ComplaintsAndFeedback = () => {
  const { complaints, feedback, streetlights, updateComplaintStatus } = useSimulation();
  const [activeTab, setActiveTab] = useState("complaints"); // "complaints" | "feedback"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [streetlightFilter, setStreetlightFilter] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  // Update status modal state
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("Under Review");
  const [adminNote, setAdminNote] = useState("");
  const [newSLStatus, setNewSLStatus] = useState("Working Normally");
  const [newMaintStatus, setNewMaintStatus] = useState("Resolved");
  const [submitting, setSubmitting] = useState(false);

  const filteredComplaints = (complaints || []).filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      c.id.toLowerCase().includes(q) ||
      c.streetlightId.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.problemType.toLowerCase().includes(q) ||
      c.userName.toLowerCase().includes(q) ||
      c.userEmail.toLowerCase().includes(q)
    );

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFeedback = (feedback || []).filter(fb => {
    const matchesSL = streetlightFilter === "all" || fb.streetlightId === streetlightFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      fb.id?.toLowerCase().includes(q) ||
      fb.streetlightId?.toLowerCase().includes(q) ||
      fb.streetlightLocation?.toLowerCase().includes(q) ||
      fb.userName?.toLowerCase().includes(q) ||
      fb.comment?.toLowerCase().includes(q)
    );
    return matchesSL && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" /> Submitted
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3 animate-spin" /> Under Review
          </span>
        );
      case "Maintenance Assigned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <AlertTriangle className="w-3 h-3" /> Maintenance Assigned
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const handleOpenStatusModal = (complaint) => {
    setActiveComplaint(complaint);
    setNewStatus(complaint.status || "Under Review");
    setAdminNote(complaint.adminResponse || "");
    setNewSLStatus("Working Normally");
    setNewMaintStatus("Resolved");
  };

  const handleSaveStatus = async () => {
    if (!activeComplaint) return;
    setSubmitting(true);
    await updateComplaintStatus(activeComplaint.id, {
      status: newStatus,
      adminResponse: adminNote,
      streetlightStatus: newSLStatus,
      maintenanceStatus: newMaintStatus
    });
    setSubmitting(false);
    setActiveComplaint(null);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              rating >= star ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
            Citizen Complaints & Feedback
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Manage citizen-reported streetlight defects, update linked streetlight conditions, and inspect streetlight-specific feedback.
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab("complaints")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "complaints"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Citizen Complaints ({(complaints || []).length})</span>
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "feedback"
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Citizen Feedback ({(feedback || []).length})</span>
          </button>
        </div>
      </div>

      {activeTab === "complaints" ? (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search complaint ID, Streetlight, User, Location..."
                className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Maintenance Assigned">Maintenance Assigned</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Complaints Grid/Table */}
          {filteredComplaints.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No complaints available.</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                No citizen complaints match your filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-black border border-brand-200 dark:border-brand-800">
                        {c.id}
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{c.problemType}</span>
                        </h3>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-brand-500" />
                            Pole: <strong className="text-brand-600 dark:text-brand-400">{c.streetlightId}</strong> ({c.location})
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {c.userName} ({c.userEmail})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(c.status)}
                      <button
                        onClick={() => handleOpenStatusModal(c)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-brand-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Respond & Update Streetlight
                      </button>
                    </div>
                  </div>

                  {/* Description & Photo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        "{c.description}"
                      </p>

                      {c.adminResponse && (
                        <div className="flex items-start gap-2 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs">
                          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-300 block text-[11px]">
                              Admin Response Note:
                            </span>
                            <span className="text-emerald-800 dark:text-emerald-200 font-medium text-[11px]">
                              {c.adminResponse}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {c.imageUrl && (
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setSelectedPhoto(c.imageUrl)}
                          className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-28 w-full cursor-pointer"
                        >
                          <img
                            src={c.imageUrl}
                            alt="Uploaded photo"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <ImageIcon className="w-4 h-4" /> Inspect Photo
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Citizen Feedback View Tab */
        <div className="space-y-5">
          {/* Admin Feedback Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, streetlight ID, comment..."
                className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter by Streetlight:</span>
              <select
                value={streetlightFilter}
                onChange={(e) => setStreetlightFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Streetlights</option>
                {(streetlights || []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} — {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredFeedback.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
              <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No feedback available.</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {streetlightFilter !== "all"
                  ? `No citizen feedback recorded for streetlight ${streetlightFilter}.`
                  : "No citizen feedback ratings have been submitted yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                        {fb.id}
                      </span>
                      {renderStars(fb.rating)}
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {fb.rating} / 5 Stars
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {fb.userName} ({fb.userEmail || fb.userId})
                      </span>
                      <span>
                        {new Date(fb.createdAt).toLocaleDateString()} {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Streetlight: <strong className="text-brand-600 dark:text-brand-400">{fb.streetlightId}</strong>
                    </span>
                    {fb.streetlightLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {fb.streetlightLocation}
                      </span>
                    )}
                    {fb.complaintId && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        Linked Complaint: <strong className="text-slate-800 dark:text-slate-200">{fb.complaintId}</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    "{fb.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Status & Streetlight Update Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Respond to Complaint {activeComplaint.id}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Linked Pole: {activeComplaint.streetlightId} — Citizen: {activeComplaint.userName}
                </p>
              </div>
              <button
                onClick={() => setActiveComplaint(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Complaint Resolution Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Maintenance Assigned">Maintenance Assigned</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Streetlight Operational Status
                  </label>
                  <select
                    value={newSLStatus}
                    onChange={(e) => setNewSLStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                  >
                    <option value="Working Normally">Working Normally</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maintenance Status
                  </label>
                  <select
                    value={newMaintStatus}
                    onChange={(e) => setNewMaintStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                  >
                    <option value="Resolved">Resolved</option>
                    <option value="Under Review">Under Review</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Response Note (Visible to Citizen)
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Enter dispatch notes, repair confirmation, or citizen notice..."
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveComplaint(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
              >
                {submitting ? "Saving..." : "Save Response & Update Streetlight"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 p-3 rounded-3xl max-w-3xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Image Inspection</span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img src={selectedPhoto} alt="Full size" className="max-w-full max-h-[70vh] rounded-xl object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
