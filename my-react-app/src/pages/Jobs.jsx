import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Jobs() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [savedJobs, setSavedJobs] = useState([])
  const [jobs, setJobs] = useState([])
  const [matchedJobs, setMatchedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchLoading, setMatchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    department: '',
    location: '',
    jobType: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    description: '',
    skills: '', // comma-separated → requiredSkills
    experienceLevel: 'Entry Level'
  })
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/jobs', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load jobs')
        // normalize
        const list = data.data || data.jobs || []
        setJobs(list)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const toggleSave = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId))
    } else {
      setSavedJobs([...savedJobs, jobId])
    }
  }

  const fetchMLMatches = async () => {
    try {
      setMatchLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      console.log('🎯 Fetching AI job matches...')

      const res = await fetch('http://localhost:5000/api/ml/match-jobs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: AbortSignal.timeout(60000) // 60 second timeout for ML processing
      })

      const data = await res.json()
      console.log('📥 Response:', data)

      if (!res.ok) {
        // Show specific error message
        if (data.message && data.message.includes('No CV found')) {
          throw new Error('⚠️ Please upload your CV first to get AI recommendations!')
        } else if (data.message && data.message.includes('No jobs available')) {
          throw new Error('⚠️ No jobs available yet. Check back later!')
        }
        throw new Error(data?.message || 'Failed to fetch matches')
      }

      if (!data.data || data.data.length === 0) {
        setError('⚠️ No matching jobs found. Try uploading a more detailed CV!')
        setMatchedJobs([])
      } else {
        setMatchedJobs(data.data || [])
        setFilter('ai-matched')
      }
    } catch (e) {
      console.error('❌ Error:', e.message)
      setError(e.message)
    } finally {
      setMatchLoading(false)
    }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      const payload = {
        title: newJob.title,
        description: newJob.description,
        department: newJob.department,
        requiredSkills: newJob.skills.split(',').map(s => s.trim()).filter(Boolean),
        experienceLevel: newJob.experienceLevel,
        salary: {
          min: newJob.salaryMin ? Number(newJob.salaryMin) : undefined,
          max: newJob.salaryMax ? Number(newJob.salaryMax) : undefined,
          currency: newJob.currency || 'USD'
        },
        location: newJob.location,
        jobType: newJob.jobType,
      }
      // Basic client-side required checks to avoid 400
      if (!payload.title || !payload.description || !payload.department || !payload.location) {
        throw new Error('Please fill title, description, department, and location')
      }
      if (!payload.requiredSkills.length) {
        throw new Error('Please provide at least one required skill')
      }
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to create job')
      setShowModal(false)
      setNewJob({ title: '', company: '', department: '', location: '', jobType: 'Full-time', salaryMin: '', salaryMax: '', currency: 'USD', description: '', skills: '', experienceLevel: 'Entry Level' })
      // refresh list
      setJobs(prev => [data.data || data.job, ...prev])
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        // Remove from list
        setJobs(jobs.filter(job => (job._id || job.id) !== jobId))
        setMatchedJobs(matchedJobs.filter(job => (job._id || job.id) !== jobId))
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Error deleting job')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
          <p className="text-lg text-gray-600">Find your perfect match based on your skills</p>
        </div>

        {/* Top actions and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setFilter('remote')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'remote' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Remote
              </button>
              <button
                onClick={() => setFilter('fulltime')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'fulltime' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Full-time
              </button>
              <button
                onClick={() => setFilter('saved')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'saved' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Saved ({savedJobs.length})
              </button>
              {user?.role === 'employee' && (
                <button
                  onClick={fetchMLMatches}
                  disabled={matchLoading}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'ai-matched' ? 'bg-purple-600 text-white shadow-md' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md'
                    }`}
                >
                  {matchLoading ? 'Loading AI...' : 'AI Recommended'}
                </button>
              )}
            </div>
            {user?.role === 'hr' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md"
              >
                + Post New Job
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">{error}</div>
        )}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-medium">Loading jobs...</div>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {(filter === 'ai-matched' ? matchedJobs : jobs).map((job) => (
            <div key={job._id || job.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-200">
              <div className="flex items-start gap-6">
                {/* Logo */}
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-base text-gray-600 font-medium">{job.company}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-4 py-2 rounded-lg font-bold text-base shadow-sm ${((job.matchScore ?? job.match ?? 0) >= 90) ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        ((job.matchScore ?? job.match ?? 0) >= 80) ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                        {Number(job.matchScore ?? job.match ?? 0).toFixed(2)}% Match
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location || 'N/A'}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {job.jobType || 'Full-time'}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.salary ? `${job.salary.min ?? ''}${job.salary.min ? '-' : ''}${job.salary.max ?? ''} ${job.salary.currency || ''}`.trim() : 'Negotiable'}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.posted || 'Recently'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.requiredSkills || job.skills || []).map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-sm font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/employee/jobs/${job._id || job.id}`)}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md"
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => toggleSave(job._id || job.id)}
                      className={`px-6 py-3 font-semibold rounded-lg transition-all shadow-sm ${savedJobs.includes(job._id || job.id)
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                    >
                      {savedJobs.includes(job._id || job.id) ? 'Saved' : 'Save'}
                    </button>
                    <button 
                      onClick={() => navigate(`/employee/jobs/${job._id || job.id}`)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all shadow-sm border border-gray-300"
                    >
                      Details
                    </button>
                    {user?.role === 'hr' && (
                      <button
                        onClick={() => handleDeleteJob(job._id || job.id)}
                        className="px-6 py-3 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-all shadow-sm border border-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Job Modal (HR only) */}
        {showModal && user?.role === 'hr' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-gray-900">Post New Job</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Senior Frontend Developer"
                    value={newJob.title}
                    onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Company *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="e.g. TechCorp"
                    value={newJob.company}
                    onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="e.g. Engineering"
                      value={newJob.department}
                      onChange={e => setNewJob({ ...newJob, department: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="e.g. Remote / NYC"
                      value={newJob.location}
                      onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                    value={newJob.jobType}
                    onChange={e => setNewJob({ ...newJob, jobType: e.target.value })}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Range</label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Min"
                      type="number"
                      value={newJob.salaryMin}
                      onChange={e => setNewJob({ ...newJob, salaryMin: e.target.value })}
                    />
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Max"
                      type="number"
                      value={newJob.salaryMax}
                      onChange={e => setNewJob({ ...newJob, salaryMax: e.target.value })}
                    />
                    <select
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                      value={newJob.currency}
                      onChange={e => setNewJob({ ...newJob, currency: e.target.value })}
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>EGP</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description *</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={5}
                    value={newJob.description}
                    onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills * (comma-separated)</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="e.g. React, Node.js, MongoDB, REST APIs"
                    value={newJob.skills}
                    onChange={e => setNewJob({ ...newJob, skills: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                    value={newJob.experienceLevel}
                    onChange={e => setNewJob({ ...newJob, experienceLevel: e.target.value })}
                  >
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                    <option>Executive</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md"
                  >
                    Post Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
