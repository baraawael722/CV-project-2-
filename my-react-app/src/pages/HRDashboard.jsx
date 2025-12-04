import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function HRDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [matchingCVs, setMatchingCVs] = useState(false)
    const [matchedCandidates, setMatchedCandidates] = useState([])
    const [selectedJob, setSelectedJob] = useState(null)
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalCandidates: 0,
        activeApplications: 0,
        avgMatchRate: 0
    })
    const [recentCandidates, setRecentCandidates] = useState([])
    const [recentJobs, setRecentJobs] = useState([])

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('token')

        if (!storedUser || !token) {
            navigate('/login')
            return
        }

        const userData = JSON.parse(storedUser)
        if (userData.role !== 'hr') {
            navigate('/employee/dashboard')
            return
        }

        setUser(userData)
        fetchDashboardData(token)
    }, [navigate])

    const fetchDashboardData = async (token) => {
        try {
            // Fetch candidates
            const candidatesRes = await fetch('http://localhost:5000/api/candidates', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            // Fetch jobs
            const jobsRes = await fetch('http://localhost:5000/api/jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (candidatesRes.ok && jobsRes.ok) {
                const candidatesData = await candidatesRes.json()
                const jobsData = await jobsRes.json()

                // Update stats
                setStats({
                    totalJobs: jobsData.count || 0,
                    totalCandidates: candidatesData.count || 0,
                    activeApplications: candidatesData.data?.reduce((acc, c) => acc + (c.applications?.length || 0), 0) || 0,
                    avgMatchRate: 85 // Calculate from actual data
                })

                // Set recent data
                setRecentCandidates(candidatesData.data?.slice(0, 5) || [])
                setRecentJobs(jobsData.data?.slice(0, 5) || [])
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
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
                setRecentJobs(recentJobs.filter(job => job._id !== jobId))
                // Update stats
                setStats(prev => ({
                    ...prev,
                    totalJobs: Math.max(0, prev.totalJobs - 1)
                }))
            } else {
                const data = await res.json()
                alert(data.message || 'Failed to delete job')
            }
        } catch (error) {
            console.error('Error deleting job:', error)
            alert('Error deleting job')
        }
    }

    const handleFindMatchingCVs = async (job) => {
        setMatchingCVs(true)
        setSelectedJob(job)
        setMatchedCandidates([])

        try {
            const token = localStorage.getItem('token')
            console.log('🎯 Finding matching CVs for job:', job.title)

            const response = await fetch('http://localhost:5000/api/ml/match-cvs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobId: job._id }),
                signal: AbortSignal.timeout(90000) // 90 second timeout for BERT processing
            })

            const data = await response.json()
            console.log('📥 Matched CVs response:', data)

            if (response.ok && data.success) {
                const candidates = data.data || []
                if (candidates.length > 0) {
                    // Navigate to dedicated page with job and candidates data
                    navigate('/hr/matched-candidates', {
                        state: { job, candidates }
                    })
                } else {
                    alert('⚠️ No matching CVs found in database')
                }
            } else {
                console.error('❌ Error:', data.message)
                alert(data.message || 'Failed to find matching CVs')
            }
        } catch (error) {
            console.error('❌ Error finding matching CVs:', error)
            if (error.name === 'AbortError') {
                alert('⏱️ Request timed out. The AI model is taking too long to process.')
            } else {
                alert('Error: ' + error.message)
            }
        } finally {
            setMatchingCVs(false)
        }
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}! 👔</h1>
                            <p className="text-xl text-white/90">HR Dashboard - Manage Your Recruitment Pipeline</p>
                        </div>
                        <div className="hidden md:block text-6xl">💼</div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Jobs */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-semibold mb-1">Total Jobs</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💼</span>
                            </div>
                        </div>
                        <Link to="/jobs" className="text-blue-600 text-sm font-semibold mt-3 inline-block hover:underline">
                            View all jobs →
                        </Link>
                    </div>

                    {/* Total Candidates */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-semibold mb-1">Total Candidates</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalCandidates}</p>
                            </div>
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👥</span>
                            </div>
                        </div>
                        <p className="text-green-600 text-sm font-semibold mt-3">
                            +{Math.floor(stats.totalCandidates * 0.12)} this week
                        </p>
                    </div>

                    {/* Active Applications */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-semibold mb-1">Applications</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.activeApplications}</p>
                            </div>
                            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📋</span>
                            </div>
                        </div>
                        <p className="text-purple-600 text-sm font-semibold mt-3">
                            Pending review
                        </p>
                    </div>

                    {/* Average Match Rate */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-semibold mb-1">Avg Match Rate</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.avgMatchRate}%</p>
                            </div>
                            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🎯</span>
                            </div>
                        </div>
                        <p className="text-orange-600 text-sm font-semibold mt-3">
                            Quality matches
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions ⚡</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Link to="/jobs" className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Post New Job</h3>
                                    <p className="text-sm text-gray-600">Create job listing</p>
                                </div>
                            </div>
                        </Link>

                        <button className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Search Candidates</h3>
                                    <p className="text-sm text-gray-600">Find talent</p>
                                </div>
                            </div>
                        </button>

                        <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">View Analytics</h3>
                                    <p className="text-sm text-gray-600">Reports & insights</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Recent Candidates */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Candidates 👥</h2>
                        {recentCandidates.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-3">📭</div>
                                <p className="text-gray-600">No candidates yet</p>
                                <p className="text-sm text-gray-500 mt-1">Candidates will appear here once they register</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentCandidates.map((candidate) => (
                                    <div key={candidate._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                                                <p className="text-sm text-gray-600">{candidate.email}</p>
                                                <div className="flex gap-2 mt-2">
                                                    {candidate.skills?.slice(0, 3).map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Jobs */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Job Posts 💼</h2>
                        {recentJobs.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-3">📭</div>
                                <p className="text-gray-600">No job posts yet</p>
                                <Link to="/jobs" className="inline-block mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">
                                    Post Your First Job
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentJobs.map((job) => (
                                    <div key={job._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900">{job.title}</h3>
                                                <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                        {job.status || 'Active'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {job.applicantsCount || 0} applicants
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleFindMatchingCVs(job)}
                                                    disabled={matchingCVs}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {matchingCVs ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            AI Matching...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                            </svg>
                                                            Find CVs
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteJob(job._id)}
                                                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
