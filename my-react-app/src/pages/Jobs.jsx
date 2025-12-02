import React, { useEffect, useState } from 'react'

export default function Jobs() {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Opportunities 💼</h1>
          <p className="text-lg text-gray-600">Find your perfect match based on your skills</p>
        </div>

        {/* Top actions and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm ${filter === 'all' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                All Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setFilter('remote')}
                className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm ${filter === 'remote' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                🌍 Remote
              </button>
              <button
                onClick={() => setFilter('fulltime')}
                className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm ${filter === 'fulltime' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                💼 Full-time
              </button>
              <button
                onClick={() => setFilter('saved')}
                className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm ${filter === 'saved' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                ⭐ Saved ({savedJobs.length})
              </button>
              {user?.role === 'employee' && (
                <button
                  onClick={fetchMLMatches}
                  disabled={matchLoading}
                  className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm ${filter === 'ai-matched' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    }`}
                >
                  {matchLoading ? '⏳ Loading...' : '🎯 AI Recommended'}
                </button>
              )}
            </div>
            {user?.role === 'hr' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all shadow-md"
              >
                + Add Job Description
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">{error}</div>
        )}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded">Loading jobs...</div>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {(filter === 'ai-matched' ? matchedJobs : jobs).map((job) => (
            <div key={job._id || job.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
              <div className="flex items-start gap-6">
                {/* Logo */}
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl">
                  {job.logo || '💼'}
                </div>

                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-lg text-gray-600">{job.company}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-4 py-2 rounded-full font-bold text-lg ${((job.matchScore ?? job.match ?? 0) >= 90) ? 'bg-green-100 text-green-700' :
                        ((job.matchScore ?? job.match ?? 0) >= 80) ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                        {Number(job.matchScore ?? job.match ?? 0).toFixed(2)}% Match
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">📍 {job.location || 'N/A'}</span>
                    <span className="flex items-center gap-1">💼 {job.jobType || 'Full-time'}</span>
                    <span className="flex items-center gap-1">💰 {job.salary ? `${job.salary.min ?? ''}${job.salary.min ? '-' : ''}${job.salary.max ?? ''} ${job.salary.currency || ''}`.trim() : '—'}</span>
                    <span className="flex items-center gap-1">🕒 {job.posted || 'Recently'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.requiredSkills || job.skills || []).map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md">
                      Apply Now →
                    </button>
                    <button
                      onClick={() => toggleSave(job._id || job.id)}
                      className={`px-6 py-3 font-bold rounded-full transition-all shadow-sm ${savedJobs.includes(job._id || job.id)
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                      {savedJobs.includes(job._id || job.id) ? '⭐ Saved' : '🤍 Save'}
                    </button>
                    <button className="px-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-full hover:bg-gray-200 transition-all shadow-sm">
                      View Details
                    </button>
                    {user?.role === 'hr' && (
                      <button
                        onClick={() => handleDeleteJob(job._id || job.id)}
                        className="px-6 py-3 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition-all shadow-sm"
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl">
              <h3 className="text-2xl font-bold mb-4">Add Job Description</h3>
              <form onSubmit={handleCreateJob} className="space-y-3">
                <input className="w-full border rounded p-2" placeholder="Title" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required />
                <input className="w-full border rounded p-2" placeholder="Company" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} required />
                <input className="w-full border rounded p-2" placeholder="Department" value={newJob.department} onChange={e => setNewJob({ ...newJob, department: e.target.value })} required />
                <input className="w-full border rounded p-2" placeholder="Location" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} required />
                <select className="w-full border rounded p-2" value={newJob.jobType} onChange={e => setNewJob({ ...newJob, jobType: e.target.value })}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Remote</option>
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <input className="w-full border rounded p-2" placeholder="Salary Min" type="number" value={newJob.salaryMin} onChange={e => setNewJob({ ...newJob, salaryMin: e.target.value })} />
                  <input className="w-full border rounded p-2" placeholder="Salary Max" type="number" value={newJob.salaryMax} onChange={e => setNewJob({ ...newJob, salaryMax: e.target.value })} />
                  <select className="w-full border rounded p-2" value={newJob.currency} onChange={e => setNewJob({ ...newJob, currency: e.target.value })}>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>EGP</option>
                  </select>
                </div>
                <textarea className="w-full border rounded p-2" placeholder="Description" rows={4} value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} required />
                <input className="w-full border rounded p-2" placeholder="Required Skills (comma-separated)" value={newJob.skills} onChange={e => setNewJob({ ...newJob, skills: e.target.value })} required />
                <select className="w-full border rounded p-2" value={newJob.experienceLevel} onChange={e => setNewJob({ ...newJob, experienceLevel: e.target.value })}>
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                  <option>Executive</option>
                </select>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create Job</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
