import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Send,
  Image as ImageIcon,
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
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      {/* Top */}
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Report New Issue
          </h1>
          <p className="text-slate-500 mt-2">
            Help improve your community by reporting civic issues.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Issue Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Garbage overflow near gate"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select category</option>

                {categories.map((item, i) => (
                  <option key={i}>{item}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>

              <textarea
                rows="4"
                name="description"
                placeholder="Describe the issue..."
                value={form.description}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Image
              </label>

              <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImage}
                />

                <Upload className="text-indigo-600" />
                <span className="mt-2 text-sm text-slate-500">
                  Click to upload image
                </span>
              </label>

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-4 w-40 h-32 object-cover rounded-xl border"
                />
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Location
              </label>

              <div className="flex gap-3">
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  placeholder="Auto detect or type manually"
                  onChange={handleChange}
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={getLocation}
                  className="px-4 rounded-xl bg-slate-100 hover:bg-slate-200"
                >
                  <MapPin />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
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