import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import axios from 'axios';
import { hybridMatch } from '../utils/hybridMatcher.js';
import { getPythonMatcher } from '../utils/pythonMatcher.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ML_SERVICE_URL = process.env.ML_HOST || 'http://127.0.0.1:5001';
const USE_PYTHON_MATCHER = process.env.USE_PYTHON_MATCHER !== 'false'; // Default: true

// Initialize Python service on module load
let pythonServiceReady = false;
const pythonMatcher = getPythonMatcher();

pythonMatcher.start()
    .then(() => {
        pythonServiceReady = true;
        console.log('✅ Python BERT Matcher Service started successfully!');
    })
    .catch((error) => {
        pythonServiceReady = false;
        console.error('❌ Failed to start Python service:', error.message);
        console.log('⚠️  Will fallback to JavaScript matcher');
    });

export const matchCV = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: 'cvFile is required' });
        }
        return res.status(501).json({ success: false, message: 'ML integration disabled' });
    } catch (err) {
        const status = err.response?.status || 500;
        const data = err.response?.data || { success: false, error: err.message };
        return res.status(status).json(data);
    }
};

export const matchJobs = async (req, res) => {
    try {
        console.log('🎯 Matching jobs for user:', req.user.email);

        // Get candidate's CV text
        const candidate = await Candidate.findOne({ email: req.user.email });
        if (!candidate || !candidate.resumeText || candidate.resumeText.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'No CV found. Please upload your CV first.'
            });
        }

        const cvText = candidate.resumeText;
        console.log('📄 CV Text Length:', cvText.length, 'characters');
        console.log('📄 CV Preview:', cvText.substring(0, 100) + '...');

        // Fetch active jobs to match against
        const jobs = await Job.find({ status: 'Active' });
        if (!jobs || jobs.length === 0) {
            return res.status(422).json({
                success: false,
                message: 'No jobs available'
            });
        }

        console.log(`💼 Found ${jobs.length} active jobs to match`);

        // Use Python matcher with BERT embeddings (same as test_my_cv.py)
        if (USE_PYTHON_MATCHER && pythonServiceReady) {
            try {
                console.log('🐍 Using Persistent Python BERT Matcher (70% Semantic BERT + 30% Keywords)');

                // Prepare job descriptions (description field only!)
                const jobDescriptions = jobs.map(job => job.description || '');

                // Call persistent Python service (model already loaded in memory!)
                const matches = await pythonMatcher.match(cvText, jobDescriptions, 10);

                // Map results back to full job objects
                const jobsWithScores = matches.map(match => ({
                    ...jobs[match.job_index].toObject(),
                    matchScore: Math.round(match.similarity_score * 100) / 100
                }));

                console.log(`✅ Python BERT Matcher returned ${jobsWithScores.length} matches`);
                jobsWithScores.slice(0, 5).forEach((job, idx) => {
                    console.log(`   ${idx + 1}. "${job.title}": ${job.matchScore}%`);
                });

                return res.status(200).json({
                    success: true,
                    data: jobsWithScores,
                    method: 'python_bert_hybrid_persistent',
                    note: 'Using BERT embeddings + keyword matching (same as test_my_cv.py) - Fast persistent service!'
                });

            } catch (pythonError) {
                console.error('❌ Python matcher failed:', pythonError.message);
                console.log('⚠️  Falling back to JavaScript hybrid matcher...');
                // Fall through to JavaScript matcher
            }
        } else if (USE_PYTHON_MATCHER && !pythonServiceReady) {
            console.log('⚠️  Python service not ready, using JavaScript fallback');
        }

        // Fallback: Use JavaScript Hybrid Matcher
        console.log('🚀 Using JavaScript Hybrid Matcher (token-based semantic + keywords)');
        const matches = hybridMatch(cvText, jobs, 10);

        const jobsWithScores = matches.map(match => ({
            ...match.job.toObject(),
            matchScore: match.matchScore
        }));

        console.log(`✅ Returning ${jobsWithScores.length} jobs with match scores`);

        return res.status(200).json({
            success: true,
            data: jobsWithScores,
            method: 'javascript_hybrid',
            note: 'Token-based matching (fallback mode)'
        });

    } catch (err) {
        console.error('❌ Error in matchJobs:', err.message);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

export const getMatchInputs = async (req, res) => {
    try {
        const email = (req.query?.email || '').trim().toLowerCase();
        let candidate = null;
        if (email) {
            candidate = await Candidate.findOne({ email });
        } else {
            candidate = await Candidate.findOne({ resumeText: { $exists: true, $ne: '' } }).sort({ createdAt: -1 });
        }
        if (!candidate || !candidate.resumeText || candidate.resumeText.trim() === '') {
            return res.status(400).json({ success: false, message: 'No candidate resumeText found. Provide ?email=' });
        }

        const cvText = candidate.resumeText;
        const text = (cvText || '').toLowerCase();
        const normalize = (s) => s.toLowerCase().replace(/\+/g, 'p').replace(/#/g, 'sharp').replace(/node\.?\s*js/g, 'nodejs');
        const tokenize = (s) => normalize(s).replace(/[^a-z0-9\s]+/g, ' ').split(/\s+/).filter(Boolean);
        const stop = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'will', 'shall', 'have', 'has', 'are', 'was', 'were', 'to', 'in', 'on', 'of', 'a', 'an', 'by', 'at', 'as', 'or', 'your', 'you', 'we', 'our']);
        const filterTokens = (arr) => arr.filter(w => !stop.has(w) && w.length > 2);
        const makeBigrams = (arr) => arr.slice(0, Math.max(0, arr.length - 1)).map((_, i) => `${arr[i]} ${arr[i + 1]}`);
        const stem = (w) => w.replace(/(ing|ed|s)$/, '');
        const cvTokensRaw = tokenize(text);
        const cvTokens = filterTokens(cvTokensRaw).map(stem);
        const cvBigrams = makeBigrams(cvTokens);

        const jobs = await Job.find({ status: 'Active' });
        if (!jobs || jobs.length === 0) {
            return res.status(422).json({ success: false, message: 'No jobs available' });
        }
        const limit = Math.min(parseInt(req.query?.limit || '10'), 50);
        const jobsPayload = jobs.slice(0, limit).map(job => {
            const jobText = (job.description || '').toLowerCase();
            const jobTokensRaw = tokenize(jobText);
            const jobTokens = filterTokens(jobTokensRaw).map(stem);
            const jobBigrams = makeBigrams(jobTokens);
            return {
                jobId: job._id?.toString?.() || job.id || 'unknown',
                title: job.title || '',
                descLen: jobText.length,
                tokenCount: jobTokens.length,
                bigramCount: jobBigrams.length,
                sampleTokens: jobTokens.slice(0, 30)
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                candidateEmail: candidate.email,
                cv: {
                    textLength: cvText.length,
                    tokenCount: cvTokens.length,
                    bigramCount: cvBigrams.length,
                    sampleTokens: cvTokens.slice(0, 30),
                    preview: cvText.substring(0, 100)
                },
                jobs: jobsPayload
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

