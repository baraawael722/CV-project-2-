import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function HRProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = React.useRef(null);
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
    setProfile({
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      department: "Human Resources",
      position: "HR Manager",
      location: "Cairo, Egypt",
    });

    // Load profile image from localStorage
    if (userData.profileImage) {
      setProfileImage(userData.profileImage);
    }

    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      // Fetch user profile from API
      const profileRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success && profileData.user) {
          // Update user in localStorage with latest data from backend
          const updatedUser = {
            ...user,
            ...profileData.user,
            role: user.role, // Keep the role from original user
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);

          // Set profile image if available
          if (profileData.user.profileImage) {
            setProfileImage(profileData.user.profileImage);
          }

          // Update profile form data
          setProfile({
            name: profileData.user.name || "",
            email: profileData.user.email || "",
            phone: profileData.user.phone || "",
            department: "Human Resources",
            position: "HR Manager",
            location: "Cairo, Egypt",
          });
        }
      }

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

        // Count job applications (interviews) from all candidates
        let totalInterviewsCount = 0;
        if (candidatesData.data && Array.isArray(candidatesData.data)) {
          totalInterviewsCount = candidatesData.data.reduce(
            (sum, candidate) => {
              return (
                sum +
                (candidate.applications ? candidate.applications.length : 0)
              );
            },
            0
          );
        }

        setStats({
          totalJobs: jobsData.count || jobsData.data?.length || 0,
          totalCandidates:
            candidatesData.count || candidatesData.data?.length || 0,
          totalInterviews: totalInterviewsCount,
        });

        console.log("✅ HR Stats loaded:", {
          jobs: jobsData.count || jobsData.data?.length,
          candidates: candidatesData.count || candidatesData.data?.length,
          interviews: totalInterviewsCount,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showToast("Please select an image file", "error");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      // Upload profile image if changed
      if (imageFile) {
        const formData = new FormData();
        formData.append("profileImage", imageFile);

        const uploadRes = await fetch(
          "http://localhost:5000/api/auth/me/upload-image",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();

        if (uploadRes.ok) {
          // Update user in localStorage with new profile image
          const updatedUser = {
            ...user,
            name: profile.name,
            phone: profile.phone,
            profileImage: uploadData.profileImage,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          setProfileImage(uploadData.profileImage);
          setImageFile(null);
        } else {
          showToast(uploadData.message || "Failed to upload image", "error");
          return;
        }
      } else {
        // Just update local storage
        const updatedUser = {
          ...user,
          name: profile.name,
          phone: profile.phone,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      showToast("Profile updated successfully!", "success");
      setEditing(false);
      
      // Refresh stats after updating profile
      fetchStats(token);
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile", "error");
    }
  };

  const refreshStats = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("🔄 Refreshing HR stats...");
      await fetchStats(token);
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
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-white">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                {user.name?.charAt(0).toUpperCase() || "H"}
              </div>
            )}
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center border-2 border-white"
                title="Change profile picture"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mt-20 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
          <button
            onClick={refreshStats}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
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
