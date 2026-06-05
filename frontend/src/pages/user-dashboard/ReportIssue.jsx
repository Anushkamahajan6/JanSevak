import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, MapPin, Send } from "lucide-react";

const CATEGORIES = [
  "Garbage & Waste",
  "Road Damage",
  "Water Leakage",
  "Drainage & Sewage",
  "Street Light",
  "Stray Animals",
  "Tree Fallen",
  "Public Property Damage",
  "Cleanliness",
  "Waterlogging",
  "Other",
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", description: "", location: "" });

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm({ ...form, location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}` }),
      () => setError("Unable to get location. Enter manually.")
    );
  };

  const parseLocation = (str) => {
    const parts = str.split(",").map(p => p.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]), lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) return { type: "Point", coordinates: [lng, lat], address: str };
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Enter an issue title"); return; }
    if (!form.category) { setError("Select a category"); return; }
    if (!form.description.trim()) { setError("Enter a description"); return; }
    if (!form.location.trim()) { setError("Provide a location"); return; }
    const location = parseLocation(form.location);
    if (!location) { setError("Invalid location format. Use: latitude, longitude"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: form.title, category: form.category, description: form.description, location, severity: 3, status: "pending" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to submit"); return; }
      navigate("/user/my-issues");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/user")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
          <h1 className="text-xl font-bold mb-1">Report an Issue</h1>
          <p className="text-slate-400 text-sm mb-6">Help your community by reporting a civic problem. You earn 10 points per report.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Issue Title</label>
              <input
                type="text" name="title" placeholder="e.g. Garbage overflow near main gate"
                value={form.title} onChange={handleChange} required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                name="category" value={form.category} onChange={handleChange} required
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 transition"
              >
                <option value="" className="bg-slate-900">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={4} name="description" placeholder="Describe the issue in detail..."
                value={form.description} onChange={handleChange} required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Photo (optional)</label>
              <label className="border border-dashed border-white/15 rounded-xl p-5 flex flex-col items-center cursor-pointer hover:bg-white/5 transition">
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                <Upload size={20} className="text-slate-400 mb-2" />
                <span className="text-xs text-slate-400">Click to upload image</span>
              </label>
              {preview && <img src={preview} alt="preview" className="mt-3 w-32 h-24 object-cover rounded-xl border border-white/10" />}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Location (lat, lng)</label>
              <div className="flex gap-2">
                <input
                  type="text" name="location" value={form.location}
                  placeholder="e.g. 28.61234, 77.20890"
                  onChange={handleChange}
                  className="flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 transition"
                />
                <button
                  type="button" onClick={getLocation}
                  className="px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition"
                  title="Auto-detect"
                >
                  <MapPin size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Click the pin icon to auto-detect your location.</p>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              <Send size={16} /> {loading ? "Submitting..." : "Submit Issue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}