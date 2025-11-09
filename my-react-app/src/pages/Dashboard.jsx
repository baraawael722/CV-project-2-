import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-2">Welcome Back! 👋</h1>
          <p className="text-xl text-white opacity-95">Let's continue your career journey</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Tasks 📋</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600 hover:bg-blue-100 transition-all">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Complete React Course</h3>
                <p className="text-sm text-gray-600">Learning Path • 2 hours remaining</p>
              </div>
              <Link to="/learning" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm">
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
              <Link to="/jobs" className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-sm">
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
              <Link to="/interview" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-sm">
                Start Practice
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Recommendations */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Recommendations 💡</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Job Recommendation */}
            <div className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">💼</div>
              <h3 className="font-bold text-gray-900 mb-1">Senior React Developer</h3>
              <p className="text-sm text-gray-600 mb-2">TechCorp • Remote</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-600">95% Match</span>
                <Link to="/jobs" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">View →</Link>
              </div>
            </div>

            {/* Course Recommendation */}
            <div className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-bold text-gray-900 mb-1">Advanced TypeScript</h3>
              <p className="text-sm text-gray-600 mb-2">Udemy • 8 hours</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-purple-600">Recommended</span>
                <Link to="/learning" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">Start →</Link>
              </div>
            </div>

            {/* Skill Gap */}
            <div className="p-4 bg-white border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-bold text-gray-900 mb-1">Docker & Kubernetes</h3>
              <p className="text-sm text-gray-600 mb-2">Skill Gap Identified</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-orange-600">Learn Now</span>
                <Link to="/skills" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">Analyze →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
