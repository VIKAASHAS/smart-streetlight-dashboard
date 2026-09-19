import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Send, CheckCircle2, FileText, Lightbulb, MapPin } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { useAuth } from "../../context/AuthContext";

export const UserFeedback = ({ initialStreetlightId = "", initialComplaintId = "" }) => {
  const { streetlights, complaints, feedback, submitFeedback } = useSimulation();
  const { user } = useAuth();

  const [selectedStreetlightId, setSelectedStreetlightId] = useState(initialStreetlightId || "");
  const [rating, setRating] = useState(5); // Default 5 stars
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState(initialComplaintId || "");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // User's own complaints for optional link
  const userComplaints = (complaints || []).filter(c => c.userId === user?.id || c.userEmail === user?.email);
  // User's own submitted feedback from DB
  const userFeedback = (feedback || []).filter(f => f.userId === user?.id || f.userEmail === user?.email);

  // If initial streetlight passed via props or complaint selection
  useEffect(() => {
    if (initialStreetlightId) setSelectedStreetlightId(initialStreetlightId);
    if (initialComplaintId) setSelectedComplaintId(initialComplaintId);
  }, [initialStreetlightId, initialComplaintId]);

  // When complaint is selected, autofill linked streetlightId
  const handleComplaintChange = (e) => {
    const compId = e.target.value;
    setSelectedComplaintId(compId);
    if (compId) {
      const comp = userComplaints.find(c => c.id === compId);
      if (comp && comp.streetlightId) {
        setSelectedStreetlightId(comp.streetlightId);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedStreetlightId) {
      setErrorMessage("Please select a streetlight.");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Please enter your feedback comments.");
      return;
    }

    const linkedLight = (streetlights || []).find(l => l.id === selectedStreetlightId);
    const locationStr = linkedLight ? `${linkedLight.name} (${linkedLight.location})` : "Municipal Lighting Zone";

    setSubmitting(true);

    const result = await submitFeedback({
      rating: Number(rating),
      comment: comment.trim(),
      streetlightId: selectedStreetlightId,
      streetlightLocation: locationStr,
      complaintId: selectedComplaintId || null,
      userName: user?.name || "Citizen User",
      userId: user?.id || "usr_01",
      userEmail: user?.email || "user@citylight.gov"
    });

    setSubmitting(false);

    if (result.success) {
      setSuccessMessage("Feedback submitted successfully.");
      setComment("");
      setSelectedStreetlightId("");
      setSelectedComplaintId("");
      setRating(5);
    } else {
      setErrorMessage(result.error || "Unable to submit feedback. Please try again.");
    }
  };

  const renderStars = (currentRating, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = interactive ? (hoverRating || rating) >= star : currentRating >= star;
          return (
            <button
              key={star}
              type={interactive ? "button" : "button"}
              disabled={!interactive}
              onClick={() => {
                if (interactive) {
                  setRating(star);
                  if (errorMessage === "Please select a star rating.") setErrorMessage("");
                }
              }}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? "cursor-pointer transform hover:scale-110 transition-transform p-1" : "cursor-default"}`}
            >
              <Star
                className={`w-6 h-6 ${
                  active
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300 dark:text-slate-700"
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Citizen Streetlight Feedback & Rating
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Rate specific streetlights, submit repair satisfaction comments, and view your permanent feedback history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback Submission Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Give Feedback</h3>
              <p className="text-[11px] text-slate-400 font-medium">Select a streetlight & rate service</p>
            </div>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold animate-fadeIn">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Select Streetlight (REQUIRED) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Streetlight *
              </label>
              <select
                value={selectedStreetlightId}
                onChange={(e) => {
                  setSelectedStreetlightId(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Choose a Streetlight Pole --</option>
                {(streetlights || []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} — {l.name} ({l.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Optional Linked Complaint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Link to Complaint (Optional)
              </label>
              <select
                value={selectedComplaintId}
                onChange={handleComplaintChange}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none"
              >
                <option value="">No Complaint Linked</option>
                {userComplaints.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.problemType} (Pole: {c.streetlightId})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Star Rating (REQUIRED 1-5 Stars) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Satisfaction Rating *
                </label>
                <span className="text-xs font-black text-amber-500 dark:text-amber-400">
                  {rating} / 5 Stars
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center">
                {renderStars(rating, true)}
              </div>
            </div>

            {/* Field 4: Comments (REQUIRED) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Comments & Suggestions *
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Enter comments about streetlight performance, illumination brightness, or repair quality..."
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting..." : "Submit Feedback"}</span>
            </button>
          </form>
        </div>

        {/* Submitted Feedback History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>My Streetlight Feedback History</span>
          </h3>

          {userFeedback.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
              <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No feedback submitted yet.</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Select a streetlight from the dropdown on the left, pick a 1–5 star rating, and share your comments.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userFeedback.map((fb) => (
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

                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(fb.createdAt).toLocaleDateString()} {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
                        Complaint: <strong className="text-slate-800 dark:text-slate-200">{fb.complaintId}</strong>
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
      </div>
    </div>
  );
};
