import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function HRDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingCVs, setMatchingCVs] = useState(false);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    activeApplications: 0,
    avgMatchRate: 0,
  });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const chartData = [
    { label: "Mon", view: 180, applied: 90 },
    { label: "Tue", view: 210, applied: 100 },
    { label: "Wed", view: 260, applied: 122 },
    { label: "Thu", view: 240, applied: 115 },
    { label: "Fri", view: 180, applied: 70 },
    { label: "Sat", view: 110, applied: 50 },
    { label: "Sun", view: 140, applied: 70 },
  ];

  useEffect(() => {
    // Get user from localStorage
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
    fetchDashboardData(token);

    // Update user data when it changes in localStorage
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
    };

    const interval = setInterval(handleStorageChange, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      // Fetch candidates
      const candidatesRes = await fetch(
        "http://localhost:5000/api/candidates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch jobs
      const jobsRes = await fetch("http://localhost:5000/api/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (candidatesRes.ok && jobsRes.ok) {
        const candidatesData = await candidatesRes.json();
        const jobsData = await jobsRes.json();

        // Update stats
        setStats({
          totalJobs: jobsData.count || 0,
          totalCandidates: candidatesData.count || 0,
          activeApplications:
            candidatesData.data?.reduce(
              (acc, c) => acc + (c.applications?.length || 0),
              0
            ) || 0,
          avgMatchRate: 85, // Calculate from actual data
        });

        // Set recent data
        setRecentCandidates(candidatesData.data?.slice(0, 5) || []);
        setRecentJobs(jobsData.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleDeleteJob = async (jobId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Remove from list
        setRecentJobs(recentJobs.filter((job) => job._id !== jobId));
        // Update stats
        setStats((prev) => ({
          ...prev,
          totalJobs: Math.max(0, prev.totalJobs - 1),
        }));
        showToast("✅ Job deleted successfully", "success");
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to delete job", "error");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      showToast("Error deleting job", "error");
    }
  };

  const handleFindMatchingCVs = async (job) => {
    setMatchingCVs(true);
    setSelectedJob(job);
    setMatchedCandidates([]);

    try {
      const token = localStorage.getItem("token");
      console.log("🎯 Finding matching CVs for job:", job.title);

      const response = await fetch("http://localhost:5000/api/ml/match-cvs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: job._id }),
        signal: AbortSignal.timeout(90000), // 90 second timeout for BERT processing
      });

      const data = await response.json();
      console.log("📥 Matched CVs response:", data);

      if (response.ok && data.success) {
        const candidates = data.data || [];
        if (candidates.length > 0) {
          // Navigate to dedicated page with job and candidates data
          navigate("/hr/matched-candidates", {
            state: { job, candidates },
          });
        } else {
          showToast("⚠️ No matching CVs found in database", "info");
        }
      } else {
        console.error("❌ Error:", data.message);
        showToast(data.message || "Failed to find matching CVs", "error");
      }
    } catch (error) {
      console.error("❌ Error finding matching CVs:", error);
      if (error.name === "AbortError") {
        showToast(
          "⏱️ Request timed out. The AI model is taking too long to process.",
          "error"
        );
      } else {
        showToast("Error: " + error.message, "error");
      }
    } finally {
      setMatchingCVs(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const startRange = new Date();
  const endRange = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
      {/* Top Header */}
      <header className="bg-white px-8 py-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user.name}
        </h1>

        {/* User Menu */}
        <div className="relative">
          <button className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0) || "S"}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Edit Profile</p>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-6 space-y-6">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Jobs Views Card - Green */}
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl p-6 shadow-lg border-4 border-black">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">2,345</p>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Jobs views
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
              <span>+15%</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>

          {/* Jobs Applications Card - Purple */}
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl p-6 shadow-lg border-4 border-black">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">4,345</p>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Jobs Applications
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
              <span>+4%</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>

          {/* Posted Jobs Card - Yellow */}
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl p-6 shadow-lg border-4 border-black">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">2,345</p>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Posted Jobs
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-orange-600">
              <span>+10%</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>

          {/* Unread Message Card - Pink */}
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-6 shadow-lg border-4 border-black">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">2,345</p>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Unread Message
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-rose-600">
              <span>+10%</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Chart and Latest Job Posts */}
        <div className="grid lg:grid-cols-1 gap-6">
          {/* Listing Performance Chart - Full Width */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Listing Performance
            </h3>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="text-sm text-gray-600 font-medium">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="text-sm text-gray-600 font-medium">
                  Applications
                </span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-around h-64 gap-3 px-4">
              {chartData.map((item, index) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="w-full flex flex-col-reverse items-center gap-3 h-48">
                    {/* Views Bar - Yellow (bottom) */}
                    <div className="w-full relative flex flex-col items-center">
                      <div
                        className="w-full bg-yellow-400 rounded-t-2xl transition-all hover:bg-yellow-500 shadow-md"
                        style={{
                          height: `${Math.max((item.view / 300) * 180, 20)}px`,
                        }}
                      ></div>
                    </div>
                    {/* Applications Bar - Green (top) */}
                    <div className="w-full relative flex flex-col items-center">
                      <div
                        className="w-full bg-emerald-400 rounded-t-2xl transition-all hover:bg-emerald-500 shadow-md"
                        style={{
                          height: `${Math.max(
                            (item.applied / 150) * 180,
                            15
                          )}px`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">
                      {index + 11}
                    </p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Job Posts - Full Width */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Latest Job Posts
              </h3>
              <button
                onClick={() => navigate("/hr/jobs")}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                See All →
              </button>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="font-semibold">No job posts yet</p>
                <button
                  onClick={() => navigate("/hr/jobs")}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-purple-600 hover:to-pink-600 transition"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentJobs.map((job, index) => {
                  const colors = [
                    "from-blue-400 to-blue-500",
                    "from-orange-400 to-red-500",
                    "from-pink-400 to-rose-500",
                    "from-green-400 to-emerald-500",
                    "from-purple-400 to-violet-500",
                    "from-yellow-400 to-amber-500",
                  ];
                  const icons = [
                    <div key="1" className="w-6 h-6 bg-white rounded"></div>,
                    <div key="2" className="grid grid-cols-2 gap-0.5">
                      <div className="w-2 h-2 bg-white"></div>
                      <div className="w-2 h-2 bg-white"></div>
                      <div className="w-2 h-2 bg-white"></div>
                      <div className="w-2 h-2 bg-white"></div>
                    </div>,
                    <svg
                      key="3"
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>,
                  ];

                  return (
                    <div
                      key={job._id}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-lg transition-all"
                    >
                      {/* Header with Icon */}
                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                            colors[index % 6]
                          } flex items-center justify-center flex-shrink-0 shadow-md`}
                        >
                          {icons[index % 3]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 mb-1 text-lg line-clamp-2">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-500">{job.company || 'Company'}</p>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                              +{job.requiredSkills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {job.description || "No description available"}
                      </p>

                      {/* Job Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="truncate">{job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {job.jobType || "Full Time"}
                          </div>
                          <div className="flex items-center gap-1 text-purple-600 font-semibold">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            {job.applicantsCount || 0} Applied
                          </div>
                        </div>
                      </div>

                      {/* Salary */}
                      {job.salaryMin && job.salaryMax && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">
                            ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                            <span className="text-sm text-gray-500 font-normal ml-1">
                              /month
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFindMatchingCVs(job)}
                          disabled={matchingCVs}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {matchingCVs && selectedJob?._id === job._id
                            ? "Finding..."
                            : "Find CVs"}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
