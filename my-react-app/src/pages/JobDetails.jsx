import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [skillAnalysis, setSkillAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch job details
        const jobRes = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobData = await jobRes.json();
        if (!jobRes.ok)
          throw new Error(jobData?.message || "Failed to load job");

        setJob(jobData.data || jobData.job);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const handleAnalyzeSkills = async () => {
    try {
      setAnalysisLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const analysisRes = await fetch(
        `http://localhost:5000/api/ml/analyze-job/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const analysisData = await analysisRes.json();

      if (!analysisRes.ok) {
        throw new Error(analysisData?.message || "Failed to analyze skills");
      }

      setSkillAnalysis(analysisData.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      setError(null);
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to apply");

      setApplicationStatus("success");
      setTimeout(() => {
        navigate("/employee/jobs");
      }, 2000);
    } catch (e) {
      setError(e.message);
      setApplicationStatus("error");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Job not found</p>
          <button
            onClick={() => navigate("/employee/jobs")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/employee/jobs")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Jobs
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {applicationStatus === "success" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            Application submitted successfully! Redirecting...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-start gap-6 mb-6">
                {/* Company Logo - Real or Placeholder */}
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ display: job.companyLogo ? 'none' : 'block' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <p className="text-xl text-gray-600 font-medium mb-4">
                    {job.company || "Company Name"}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {job.location || "N/A"}
                    </span>
                    <span className="flex items-center gap-2">
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
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {job.jobType || "Full-time"}
                    </span>
                    <span className="flex items-center gap-2">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {job.salary
                        ? `${job.salary.min || ""}${job.salary.min ? "-" : ""}${
                            job.salary.max || ""
                          } ${job.salary.currency || ""}`.trim()
                        : "Negotiable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>

              {/* Analyze Match & Skills Button */}
              <button
                onClick={handleAnalyzeSkills}
                disabled={analysisLoading}
                className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-lg rounded-lg hover:from-green-600 hover:to-teal-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {analysisLoading ? "Analyzing..." : "🔬 Analyze Match & Skills"}
              </button>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6"
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
                Job Description
              </h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description || "No description available"}
              </div>
            </div>

            {/* Required Skills */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-3">
                {(job.requiredSkills || job.skills || []).map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 border-2 border-indigo-200 rounded-lg text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Department & Experience */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Department
                  </h3>
                  <p className="text-lg text-gray-900">
                    {job.department || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Experience Level
                  </h3>
                  <p className="text-lg text-gray-900">
                    {job.experienceLevel || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Skills Analysis */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* AI Skills Analysis */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI Skills Analysis
                </h2>

                {analysisLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing your skills...</p>
                  </div>
                ) : skillAnalysis ? (
                  <div className="space-y-6">
                    {/* Match Score */}
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                      <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Match Score
                      </p>
                      <div
                        className={`text-5xl font-bold mb-2 ${
                          skillAnalysis.matchScore >= 80
                            ? "text-green-600"
                            : skillAnalysis.matchScore >= 60
                            ? "text-blue-600"
                            : skillAnalysis.matchScore >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {skillAnalysis.matchScore?.toFixed(1) || "0"}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            skillAnalysis.matchScore >= 80
                              ? "bg-green-600"
                              : skillAnalysis.matchScore >= 60
                              ? "bg-blue-600"
                              : skillAnalysis.matchScore >= 40
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${skillAnalysis.matchScore || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Matched Skills */}
                    {skillAnalysis.matchedSkills &&
                      skillAnalysis.matchedSkills.length > 0 && (
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Matched Skills ({skillAnalysis.matchedSkills.length}
                            )
                          </h3>
                          <div className="space-y-2">
                            {skillAnalysis.matchedSkills.map((skill, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-green-50 rounded-md"
                              >
                                <svg
                                  className="w-4 h-4 text-green-600 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-green-800">
                                  {skill.skill || skill}
                                </span>
                                {skill.confidence && (
                                  <span className="ml-auto text-xs text-green-600 font-semibold">
                                    {skill.confidence}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Missing Skills */}
                    {skillAnalysis.missingSkills &&
                      skillAnalysis.missingSkills.length > 0 && (
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            Missing Skills ({skillAnalysis.missingSkills.length}
                            )
                          </h3>
                          <div className="space-y-2">
                            {skillAnalysis.missingSkills.map((skill, index) => (
                              <div
                                key={index}
                                className="p-3 bg-red-50 rounded-md border border-red-200"
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <svg
                                    className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-red-800 block">
                                      {skill.skill || skill}
                                    </span>
                                    {skill.confidence && (
                                      <span className="text-xs text-red-600 font-semibold">
                                        Confidence:{" "}
                                        {(skill.confidence * 100).toFixed(0)}% |
                                        Priority: {skill.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {(skill.youtube || skill.youtube_search) && (
                                  <a
                                    href={skill.youtube || skill.youtube_search}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md transition-colors"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                    Learn on YouTube
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                    <p className="text-gray-600 mb-2">No analysis available</p>
                    <p className="text-sm text-gray-500">
                      Upload your CV to get personalized insights
                    </p>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  About Company
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p className="font-semibold text-lg">
                    {job.company || "Company Name"}
                  </p>
                  <p className="text-sm leading-relaxed">
                    {job.companyDescription ||
                      "Join a dynamic team working on innovative projects. We offer competitive benefits and a great work environment."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
