import React, { useState } from "react";
import { Send, CheckCircle2, Upload, AlertCircle, Eye, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSimulation } from "../../context/SimulationContext";

export const ReportProblem = ({ onNavigate }) => {
  const { user } = useAuth();
  const { streetlights, submitComplaint } = useSimulation();

  const [streetlightId, setStreetlightId] = useState("");
  const [problemType, setProblemType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  
  // Validation & state feedback
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewFullModal, setViewFullModal] = useState(false);

  const problemOptions = [
    { type: "Light not working", desc: "Complete darkness / zero luminous output", icon: "🌑" },
    { type: "Light blinking", desc: "Rapid flickering or strobe behavior", icon: "⚡" },
    { type: "Dim light", desc: "Low visibility / reduced output brightness", icon: "💡" },
    { type: "Light staying ON", desc: "Light remains ON during daylight hours", icon: "☀️" },
    { type: "Physical damage", desc: "Damaged pole, loose base door, exposed wires", icon: "⚠️" },
    { type: "Other", desc: "Any other abnormal operational behavior", icon: "🔧" }
  ];

  const handlePoleSelect = (id) => {
    setStreetlightId(id);
    if (errors.streetlightId) setErrors(prev => ({ ...prev, streetlightId: null }));
    const found = streetlights.find(l => l.id === id);
    if (found) {
      setLocation(found.location);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
        alert("Please select a valid image file (JPG, JPEG, PNG, or WEBP).");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be under 10MB.");
        return;
      }

      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFileName("");
  };

  const validate = () => {
    const newErrors = {};
    if (!streetlightId || !streetlightId.trim()) {
      newErrors.streetlightId = "Please select a Streetlight ID.";
    }
    if (!problemType || !problemType.trim()) {
      newErrors.problemType = "Please select a problem type.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validate()) return;
    if (isSubmitting) return; // Prevent duplicate submission

    setIsSubmitting(true);

    const payload = {
      streetlightId: streetlightId.trim(),
      location: location || "Municipal Ward",
      problemType: problemType.trim(),
      description: description.trim() || `Reported ${problemType} by resident.`,
      userName: user?.name || "Citizen User",
      userEmail: user?.email || "user@citylight.gov",
      userId: user?.id || "usr_01",
      imageUrl: imagePreview || null
    };

    const created = await submitComplaint(payload);
    setIsSubmitting(false);

    if (created) {
      setSuccessMessage("Complaint submitted successfully.");
      // Clear form
      setStreetlightId("");
      setProblemType("");
      setLocation("");
      setDescription("");
      setImagePreview(null);
      setImageFileName("");
      setErrors({});
    } else {
      alert("Failed to submit complaint. Please check server connection.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Report a Streetlight Problem
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Help maintain neighborhood lighting safety. Submit a report to the Municipal Command Center.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("my-complaints")}
            className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs transition-all cursor-pointer font-bold"
          >
            Track Complaints →
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-200">
        {/* Step 1: Select Streetlight Pole ID */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            1. Select Streetlight Pole ID <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <select
                value={streetlightId}
                onChange={(e) => handlePoleSelect(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition-all ${
                  errors.streetlightId
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-slate-300 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-400"
                }`}
              >
                <option value="">-- Choose Streetlight ID --</option>
                {streetlights.map(light => (
                  <option key={light.id} value={light.id}>
                    {light.id} — {light.location} ({light.zone})
                  </option>
                ))}
              </select>
              {errors.streetlightId && (
                <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.streetlightId}</span>
                </p>
              )}
            </div>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location landmark (Auto-filled or manual)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Step 2: Problem Type Visual Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            2. Select Problem Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {problemOptions.map(p => {
              const isSelected = problemType === p.type;
              return (
                <div
                  key={p.type}
                  onClick={() => {
                    setProblemType(p.type);
                    if (errors.problemType) setErrors(prev => ({ ...prev, problemType: null }));
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-slate-900 dark:text-white ring-2 ring-emerald-500 shadow-xs"
                      : "bg-slate-50/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="text-xl mb-1">{p.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{p.type}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{p.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.problemType && (
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.problemType}</span>
            </p>
          )}
        </div>

        {/* Step 3: Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            3. Complaint Description (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide additional details (e.g. flickering occurs every few minutes after dusk...)"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
        </div>

        {/* Step 4: Photo Upload Evidence */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            4. Upload Photo Evidence (JPG, JPEG, PNG, WEBP - Max 10MB)
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950 transition-all">
              <input
                type="file"
                id="complaint-photo"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="complaint-photo" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload photo evidence</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Supports JPG, JPEG, PNG, or WEBP (Saved permanently)</span>
              </label>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 w-32 h-24 bg-slate-900 shrink-0">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setViewFullModal(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all text-xs font-bold"
                >
                  <Eye className="w-4 h-4 mr-1" /> Preview
                </button>
              </div>

              <div className="flex-1 text-xs space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Photo Ready to Upload</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 truncate font-medium max-w-xs">{imageFileName || "photo_evidence.jpg"}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Permanently saved to database storage.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewFullModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? "Submitting Complaint..." : "Submit Complaint"}</span>
        </button>
      </form>

      {/* Full Size Image Preview Modal */}
      {viewFullModal && imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn" onClick={() => setViewFullModal(false)}>
          <div className="relative max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewFullModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={imagePreview} alt="Full Size Evidence" className="max-h-[80vh] w-auto rounded-2xl object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
