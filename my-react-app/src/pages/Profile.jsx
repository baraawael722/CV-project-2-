import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    role: 'employee',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    portfolio: 'johndoe.com'
  })

  const savedJobs = [
    { id: 1, title: 'Senior React Developer', company: 'TechCorp', match: 95 },
    { id: 2, title: 'Frontend Engineer', company: 'StartupXYZ', match: 88 },
    { id: 3, title: 'Full Stack Developer', company: 'MegaTech Inc', match: 82 }
  ]

  const savedCourses = [
    { id: 1, title: 'Advanced Docker & Kubernetes', progress: 0 },
    { id: 2, title: 'AWS Cloud Practitioner', progress: 0 },
    { id: 3, title: 'Advanced TypeScript', progress: 45 }
  ]

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      navigate('/login')
    }
  }

  const handleSave = () => {
    setEditing(false)
    // Save profile logic here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile 👤</h1>
          <p className="text-lg text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all"
                  >
                    ✏️ Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all"
                    >
                      ✅ Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-400 transition-all"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{profile.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Links Card */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Links</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🔗 LinkedIn</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.linkedin}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  ) : (
                    <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 hover:underline">
                      {profile.linkedin}
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">💻 GitHub</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  ) : (
                    <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 hover:underline">
                      {profile.github}
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🌐 Portfolio</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.portfolio}
                      onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  ) : (
                    <a href={`https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 hover:underline">
                      {profile.portfolio}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* CV Upload */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">CV / Resume</h2>
              <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="text-5xl mb-4">📄</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Upload New CV</h3>
                <p className="text-gray-600 mb-4">PDF, DOC, or DOCX (Max 5MB)</p>
                <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all">
                  Choose File
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Saved Items & Actions */}
          <div className="space-y-6">
            {/* Saved Jobs */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ Saved Jobs</h2>
              <div className="space-y-3">
                {savedJobs.map((job) => (
                  <div key={job.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{job.title}</h3>
                    <p className="text-xs text-gray-600">{job.company}</p>
                    <span className="inline-block mt-2 text-xs font-semibold text-green-600">{job.match}% Match</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all text-sm">
                View All Jobs →
              </button>
            </div>

            {/* Saved Courses */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📚 My Courses</h2>
              <div className="space-y-3">
                {savedCourses.map((course) => (
                  <div key={course.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <h3 className="font-bold text-gray-900 text-sm mb-2">{course.title}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1 inline-block">{course.progress}% Complete</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-all text-sm">
                View All Courses →
              </button>
            </div>

            {/* Logout */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-all"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
