import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Send,
} from "lucide-react";

export default function ReportIssue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
  });

  const [preview, setPreview] = useState(null);

  const categories = [
    "Garbage",
    "Road Damage",
    "Water Leakage",
    "Street Light",
    "Drainage",
    "Electricity",
    "Cleanliness",
    "Other",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude.toFixed(5);
      const lng = pos.coords.longitude.toFixed(5);

      setForm({
        ...form,
        location: `${lat}, ${lng}`,
      });
    }, (err) => {
      setError("Unable to get your location. Please enter it manually.");
    });
  };

  const parseLocation = (locationStr) => {
    if (!locationStr) return null;
    
    const parts = locationStr.split(',').map(p => p.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          type: 'Point',
          coordinates: [lng, lat],
          address: locationStr
        };
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.title.trim()) {
      setError("Please enter an issue title");
      return;
    }

    if (!form.category) {
      setError("Please select a category");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter a description");
      return;
    }

    if (!form.location.trim()) {
      setError("Please provide a location");
      return;
    }

    const location = parseLocation(form.location);
    if (!location) {
      setError("Invalid location format. Please use: latitude, longitude");
      return;
    }

    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        location: location,
        severity: 3,
        status: 'pending'
      };

      const res = await fetch(`${apiBase}/api/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit issue');
        return;
      }

      alert("Issue Submitted Successfully ✅");
      navigate("/user/my-issues");
    } catch (err) {
      console.error('Error submitting issue:', err);
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-300 hover:text-violet-200 mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <h1 className="text-3xl font-bold">Report New Issue</h1>
          <p className="text-slate-300 mt-2">
            Help improve your community by reporting civic issues.
          </p>

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Issue Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Garbage overflow near gate"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-300 rounded-xl px-4 py-3 outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/10 text-white rounded-xl px-4 py-3 outline-none"
              >
                <option value="" className="text-black">
                  Select category
                </option>

                {categories.map((item, i) => (
                  <option key={i} className="text-black">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Description
              </label>

              <textarea
                rows="4"
                name="description"
                placeholder="Describe the issue..."
                value={form.description}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-300 rounded-xl px-4 py-3 outline-none"
              ></textarea>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Upload Image
              </label>

              <label className="border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImage}
                />

                <Upload className="text-violet-200" />
                <span className="mt-2 text-sm text-slate-300">
                  Click to upload image
                </span>
              </label>

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-4 w-40 h-32 object-cover rounded-xl border border-white/10"
                />
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Location
              </label>

              <div className="flex gap-3">
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  placeholder="Auto detect or type manually"
                  onChange={handleChange}
                  className="flex-1 bg-white/10 border border-white/10 text-white placeholder-slate-300 rounded-xl px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={getLocation}
                  className="px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
                >
                  <MapPin />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition hover:scale-[1.02] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Send size={18} />
              {loading ? 'Submitting...' : 'Submit Issue'}
            </button>
                 </form>
        </div>
      </div>
    </div>
  );
}