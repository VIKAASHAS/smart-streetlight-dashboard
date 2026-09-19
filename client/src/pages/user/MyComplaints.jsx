import React, { useState } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Image as ImageIcon,
  MessageSquare,
  Send
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { useAuth } from "../../context/AuthContext";

export const MyComplaints = ({ onNavigate }) => {
  const { complaints } = useSimulation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Filter complaints for current user
  const userComplaints = complaints.filter(c => 
    c.userId === user?.id || c.userEmail === user?.email
  );

  const filteredComplaints = userComplaints.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.streetlightId.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.problemType.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Reported Complaints
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Track real-time status and municipal team updates on your submitted streetlight issues.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate("report-problem")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Report New Problem</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Complaint ID, Streetlight ID, Location, or Issue..."
          className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No complaints submitted yet.</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? "No complaint reports match your search query." : "You haven't submitted any streetlight complaints yet."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => onNavigate && onNavigate("report-problem")}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Report a Problem Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-black border border-brand-200 dark:border-brand-800">
                    {c.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {c.problemType}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Streetlight: <span className="font-bold text-brand-600 dark:text-brand-400">{c.streetlightId}</span> ({c.location})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(c.status)}
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Description & Photo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    "{c.description}"
                  </p>

                  {/* Admin Note if present */}
                  {c.adminResponse && (
                    <div className="flex items-start gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs">
                      <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 block text-[11px]">
                          Municipal Response Note:
                        </span>
                        <span className="text-emerald-800 dark:text-emerald-200 font-medium text-[11px]">
                          {c.adminResponse}
                        </span>
                        {c.streetlightStatus && (
                          <div className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            Connected Streetlight Condition: <span className="underline">{c.streetlightStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Give Feedback Action Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => onNavigate && onNavigate("user-feedback")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      ⭐ Give Feedback & Rate Resolution
                    </button>
                  </div>
                </div>

                {/* Photo Thumbnail */}
                {c.imageUrl && (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setSelectedPhoto(c.imageUrl)}
                      className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-28 w-full cursor-pointer"
                    >
                      <img
                        src={c.imageUrl}
                        alt="Complaint Attachment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ImageIcon className="w-4 h-4" /> View Full Photo
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Lightbox Modal */}
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
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Complaint Attachment Photo</span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img src={selectedPhoto} alt="Full Size" className="max-w-full max-h-[70vh] rounded-xl object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
