import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser || !token) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)

    // Redirect HR to HR dashboard
    if (userData.role === 'hr') {
      navigate('/hr/dashboard')
      return
    }

    setUser(userData)
  }, [navigate])

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-2">Welcome Back, {user.name}!</h1>
          <p className="text-xl text-white opacity-95">Let's continue your career journey</p>
        </div>

        {/* Employee Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-600 font-semibold">CV Status</p>
            <p className="text-2xl font-bold text-gray-900">Ready</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 font-semibold">Job Matches</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <svg className="w-10 h-10 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm text-gray-600 font-semibold">Learning</p>
            <p className="text-2xl font-bold text-gray-900">3 Active</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <svg className="w-10 h-10 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-600 font-semibold">Skill Score</p>
            <p className="text-2xl font-bold text-gray-900">85%</p>
          </div>
        </div>

        {/* CV Upload CTA - Prominent Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-3xl font-bold text-white">Ready to Get Matched?</h2>
              </div>
              <p className="text-xl text-white/90 mb-4">
                Upload your CV to unlock personalized job recommendations powered by AI!
              </p>
              <div className="flex gap-4 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  AI-Powered Analysis
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Instant Matching
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Skill Gap Insights
                </span>
              </div>
            </div>
            <Link
              to="/employee/profile"
              className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:bg-emerald-50 transition-all duration-300 flex items-center gap-3 group"
            >
              <span>Upload CV Now</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Career Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Career Progress</h2>
            <span className="text-3xl font-bold text-blue-600">65%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-sm text-gray-600">Keep going! You're making great progress.</p>
        </div>

        {/* Next Tasks */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Tasks</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600 hover:bg-blue-100 transition-all">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Complete React Course</h3>
                <p className="text-sm text-gray-600">Learning Path • 2 hours remaining</p>
              </div>
              <Link to="/employee/learning" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm">
                Continue
              </Link>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-600 hover:bg-green-100 transition-all">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Apply to Frontend Developer Jobs</h3>
                <p className="text-sm text-gray-600">Jobs • 5 matching opportunities</p>
              </div>
              <Link to="/employee/jobs" className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-sm">
                View Jobs
              </Link>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600 hover:bg-purple-100 transition-all">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Practice Interview Questions</h3>
                <p className="text-sm text-gray-600">AI Interview • 10 questions ready</p>
              </div>
              <Link to="/employee/interview" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-sm">
                Start Practice
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Recommendations */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Recommendations</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Job Recommendation */}
            <div className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <svg className="w-10 h-10 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="font-bold text-gray-900 mb-1">Senior React Developer</h3>
              <p className="text-sm text-gray-600 mb-2">TechCorp • Remote</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-600">95% Match</span>
                <Link to="/employee/jobs" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">View →</Link>
              </div>
            </div>

            {/* Course Recommendation */}
            <div className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:shadow-md transition-all">
              <svg className="w-10 h-10 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="font-bold text-gray-900 mb-1">Advanced TypeScript</h3>
              <p className="text-sm text-gray-600 mb-2">Udemy • 8 hours</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-purple-600">Recommended</span>
                <Link to="/employee/learning" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">Start →</Link>
              </div>
            </div>

            {/* Skill Gap */}
            <div className="p-4 bg-white border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all">
              <svg className="w-10 h-10 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="font-bold text-gray-900 mb-1">Docker & Kubernetes</h3>
              <p className="text-sm text-gray-600 mb-2">Skill Gap Identified</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-orange-600">Learn Now</span>
                <Link to="/employee/skills" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">Analyze →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
