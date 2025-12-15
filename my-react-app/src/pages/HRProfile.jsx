import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function HRProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    totalInterviews: 0,
  });
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    location: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== "hr") {
      navigate("/employee/dashboard");
      return;
    }

    setUser(userData);
    // Populate from server to ensure we have avatar and latest fields
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        const serverUser = data.user || {};
        setProfile({
          name: serverUser.name || userData.name || "",
          email: serverUser.email || userData.email || "",
          phone: serverUser.phone || "",
          department: "Human Resources",
          position: "HR Manager",
          location: serverUser.location || "Cairo, Egypt",
          avatar: serverUser.avatar || null,
        });
        if (serverUser.avatar) {
          setAvatarPreview(serverUser.avatar);
        }
      } catch (err) {
        // fallback to local data
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          department: "Human Resources",
          position: "HR Manager",
          location: "Cairo, Egypt",
        });
      }
    };

    fetchProfile();
    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const jobsRes = await fetch("http://localhost:5000/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const candidatesRes = await fetch(
        "http://localhost:5000/api/candidates",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (jobsRes.ok && candidatesRes.ok) {
        const jobsData = await jobsRes.json();
        const candidatesData = await candidatesRes.json();

        setStats({
          totalJobs: jobsData.count || 0,
          totalCandidates: candidatesData.count || 0,
          totalInterviews: Math.floor((candidatesData.count || 0) * 0.3),
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      let avatarBase64 = profile.avatar || null;
      if (avatarFile) {
        avatarBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
      }

      const payload = {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        avatar: avatarBase64,
      };

      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      // Update localStorage user object with new values including avatar
      const stored = JSON.parse(localStorage.getItem("user") || "null") || {};
      const updatedUser = {
        ...stored,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar || avatarBase64,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Dispatch custom event to notify TopNavbar and other components
      window.dispatchEvent(
        new CustomEvent("avatarUpdated", { detail: updatedUser })
      );

      setUser(updatedUser);
      if (updatedUser.avatar) setAvatarPreview(updatedUser.avatar);

      showToast("Profile updated successfully!", "success");
      setEditing(false);
      setAvatarFile(null);
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to save profile", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header with Gradient Background */}
      <div className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-48 rounded-b-3xl shadow-lg">
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="w-40 h-40 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-white overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-6xl font-bold">
                {user.name?.charAt(0).toUpperCase() || "H"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mt-24 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {profile.name}
        </h1>
        <p className="text-gray-600 mb-1">
          Member since{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          • {profile.location}
        </p>
        <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mt-2">
          {profile.position}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border-2 border-gray-100 hover:border-blue-300 transition">
            <p className="text-5xl font-bold text-blue-600 mb-2">
              {stats.totalJobs}
            </p>
            <p className="text-gray-600 font-semibold">Jobs Posted</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border-2 border-gray-100 hover:border-purple-300 transition">
            <p className="text-5xl font-bold text-purple-600 mb-2">
              {stats.totalCandidates}
            </p>
            <p className="text-gray-600 font-semibold">Candidates Reviewed</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border-2 border-gray-100 hover:border-green-300 transition">
            <p className="text-5xl font-bold text-green-600 mb-2">
              {stats.totalInterviews}
            </p>
            <p className="text-gray-600 font-semibold">Interviews Scheduled</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Profile Information
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Avatar upload - spans full width */}
            {editing && (
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-4">
                  Profile Photo
                </label>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
                  <div className="flex flex-col items-center gap-4">
                    {/* Upload Preview */}
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="profile preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-blue-400 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                            setProfile((p) => ({ ...p, avatar: null }));
                          }}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition text-lg font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6v6m0 0v6m0-6h6m0 0h-6m-6-6h6m0 0H6m0 0v6m0-6V6"
                        />
                      </svg>
                    )}

                    <div>
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files[0];
                            if (f) {
                              setAvatarFile(f);
                              setAvatarPreview(URL.createObjectURL(f));
                              setProfile((p) => ({ ...p, avatar: null }));
                            }
                          }}
                          className="hidden"
                        />
                        <span className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                          📸 Choose Photo
                        </span>
                      </label>
                      <p className="text-sm text-gray-600 mt-2">
                        or drag and drop
                      </p>
                    </div>

                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF • Max 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              ) : (
                <p className="text-lg text-gray-900 font-medium">
                  {profile.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-lg text-gray-900 font-medium">
                {profile.email}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              ) : (
                <p className="text-lg text-gray-900 font-medium">
                  {profile.phone || "Not provided"}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Department
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) =>
                    setProfile({ ...profile, department: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              ) : (
                <p className="text-lg text-gray-900 font-medium">
                  {profile.department}
                </p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Position
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profile.position}
                  onChange={(e) =>
                    setProfile({ ...profile, position: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              ) : (
                <p className="text-lg text-gray-900 font-medium">
                  {profile.position}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              ) : (
                <p className="text-lg text-gray-900 font-medium">
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
