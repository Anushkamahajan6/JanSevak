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
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Issue Submitted Successfully ✅");
    navigate("/user");
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
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition hover:scale-[1.02]"
            >
              <Send size={18} />
              Submit Issue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}