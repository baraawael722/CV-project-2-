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
    const chartData = [
        { label: 'Mon', view: 180, applied: 90 },
        { label: 'Tue', view: 210, applied: 100 },
        { label: 'Wed', view: 260, applied: 122 },
        { label: 'Thu', view: 240, applied: 115 },
        { label: 'Fri', view: 180, applied: 70 },
        { label: 'Sat', view: 110, applied: 50 },
        { label: 'Sun', view: 140, applied: 70 }
    ]

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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading Dashboard...</p>
                </div>
            </div>
        )
    }

    const startRange = new Date()
    const endRange = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Good morning, {user.name}</h1>
                    <p className="text-sm text-gray-500">Here is your job listings statistic report from {startRange.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {endRange.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
                        onClick={() => navigate('/hr/jobs')}
                    >
                        Post a job
                    </button>
                    <div className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white">
                        {startRange.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endRange.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* Dashboard content */}
            <main className="p-8 space-y-8">
                    {/* Top stat cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white p-6 shadow-md">
                            <p className="text-sm opacity-90">New candidates to review</p>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-5xl font-bold">{stats.totalCandidates || 76}</p>
                                <span className="text-2xl">→</span>
                            </div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white p-6 shadow-md">
                            <p className="text-sm opacity-90">Schedule for today</p>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-5xl font-bold">3</p>
                                <span className="text-2xl">→</span>
                            </div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 shadow-md">
                            <p className="text-sm opacity-90">Messages received</p>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-5xl font-bold">{stats.activeApplications || 24}</p>
                                <span className="text-2xl">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart + side metrics */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Job statistics</h3>
                                    <p className="text-xs text-gray-500">Showing jobStatistic Jul 19-25</p>
                                </div>
                                <div className="flex gap-2 text-xs">
                                    <button className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold">Week</button>
                                    <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600">Month</button>
                                    <button className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600">Year</button>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm font-semibold text-gray-700 mb-4">
                                <button className="border-b-2 border-indigo-600 pb-2">Overview</button>
                                <button className="text-gray-500">Jobs View</button>
                                <button className="text-gray-500">Jobs Applied</button>
                            </div>

                            <div className="grid grid-cols-7 gap-3 h-56 items-end mb-6">
                                {chartData.map((item) => (
                                    <div key={item.label} className="flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col justify-end gap-1">
                                            <div className="mx-auto text-[10px] text-white bg-gray-900 rounded px-1 py-[2px]">{item.view}</div>
                                            <div className="w-9 sm:w-10 bg-amber-400 rounded-md" style={{ height: `${item.view / 4}px` }}></div>
                                            <div className="mx-auto text-[10px] text-white bg-gray-900 rounded px-1 py-[2px]">{item.applied}</div>
                                            <div className="w-9 sm:w-10 bg-sky-500 rounded-md" style={{ height: `${item.applied / 3}px` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-600">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-500">Job Views</p>
                                    <p className="text-3xl font-bold text-gray-900">2,342</p>
                                    <p className="text-xs text-emerald-600 font-semibold">This Week 6.4%</p>
                                </div>
                                <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <p className="text-sm text-gray-500">Job Applied</p>
                                    <p className="text-3xl font-bold text-gray-900">654</p>
                                    <p className="text-xs text-rose-600 font-semibold">This Week 0.5%</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
                                <p className="text-sm text-gray-500">Job Open</p>
                                <p className="text-5xl font-bold text-gray-900">{stats.totalJobs || 12}</p>
                                <p className="text-sm text-gray-500 mt-1">Jobs Opened</p>
                            </div>

                            <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Applicants Summary</h4>
                                <p className="text-5xl font-bold text-gray-900 mb-4">{stats.totalCandidates || 67}</p>
                                <div className="space-y-2 text-xs text-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-500"></span>Full Time</span>
                                        <span className="font-semibold text-gray-900">45</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-400"></span>Internship</span>
                                        <span className="font-semibold text-gray-900">32</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-teal-400"></span>Part-Time</span>
                                        <span className="font-semibold text-gray-900">24</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500"></span>Contract</span>
                                        <span className="font-semibold text-gray-900">30</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-sky-500"></span>Remote</span>
                                        <span className="font-semibold text-gray-900">22</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Keep existing lists for functionality */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Candidates</h2>
                            {recentCandidates.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No candidates yet</div>
                            ) : (
                                <div className="space-y-3">
                                    {recentCandidates.map((candidate) => (
                                        <div key={candidate._id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{candidate.name}</p>
                                                <p className="text-sm text-gray-600">{candidate.email}</p>
                                            </div>
                                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">View</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Job Posts</h2>
                            {recentJobs.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No job posts yet</div>
                            ) : (
                                <div className="space-y-3">
                                    {recentJobs.map((job) => (
                                        <div key={job._id} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{job.title}</p>
                                                    <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                                                    <p className="text-xs text-gray-500">{job.applicantsCount || 0} applicants</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleFindMatchingCVs(job)}
                                                        disabled={matchingCVs}
                                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
                                                    >
                                                        {matchingCVs ? 'Matching...' : 'Find CVs'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteJob(job._id)}
                                                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition"
                                                    >
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
                </main>
        </div>
    )
}
