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
const CV_CLASSIFIER_URL = process.env.CV_CLASSIFIER_URL || 'http://127.0.0.1:5002';
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

/**
 * Match CVs to Job Description (for HR)
 * Finds best matching candidate CVs for a given job description
 */
export const matchCVsToJob = async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'jobId is required'
            });
        }

        console.log('🎯 HR: Finding matching CVs for job:', jobId);

        // Get the job description
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const jobDescription = job.description || '';
        if (!jobDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Job description is empty'
            });
        }

        // Get all candidates with CV text
        const candidates = await Candidate.find({
            resumeText: { $exists: true, $ne: '' }
        });

        if (candidates.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No CVs found in database'
            });
        }

        console.log(`📄 Found ${candidates.length} candidates with CVs`);

        // Prepare CV texts
        const cvTexts = candidates.map(c => c.resumeText || '');

        // Call Python script to match CVs to job
        const { spawn } = await import('child_process');
        const scriptPath = path.join(__dirname, '..', 'scripts', 'match_cvs_to_job.py');

        const python = spawn('python', [scriptPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: false,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });

        const inputData = {
            job_description: jobDescription,
            cv_texts: cvTexts,
            top_k: 10
        };

        // Send input to Python
        python.stdin.write(JSON.stringify(inputData));
        python.stdin.end();

        let outputData = '';
        let errorData = '';

        python.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorData += data.toString();
            console.log('🐍 Python:', data.toString().trim());
        });

        // Wait for Python to complete
        await new Promise((resolve, reject) => {
            python.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${errorData}`));
                } else {
                    resolve();
                }
            });

            python.on('error', (error) => {
                reject(new Error(`Failed to start Python: ${error.message}`));
            });

            // Timeout after 60 seconds
            setTimeout(() => {
                python.kill();
                reject(new Error('Python script timeout (60s)'));
            }, 60000);
        });

        // Parse Python output
        const result = JSON.parse(outputData);

        if (!result.success) {
            throw new Error(result.error || 'Python matcher failed');
        }

        // Map results back to full candidate objects
        // Note: Python returns 'job_index' but we're matching CVs, so it's actually cv_index
        const matchedCandidates = result.matches.map(match => {
            const cvIndex = match.job_index !== undefined ? match.job_index : match.cv_index;
            const candidate = candidates[cvIndex];

            if (!candidate) {
                console.error(`⚠️ No candidate found at index ${cvIndex}`);
                return null;
            }

            return {
                _id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                skills: candidate.skills,
                experience: candidate.experience,
                education: candidate.education,
                matchScore: Math.round(match.similarity_score * 100) / 100,
                resumeText: candidate.resumeText.substring(0, 300) + '...' // Preview only
            };
        }).filter(c => c !== null);

        console.log(`✅ Matched ${matchedCandidates.length} candidates to job`);
        matchedCandidates.slice(0, 5).forEach((c, idx) => {
            console.log(`   ${idx + 1}. ${c.name}: ${c.matchScore}%`);
        });

        return res.status(200).json({
            success: true,
            data: matchedCandidates,
            jobTitle: job.title,
            method: 'python_bert_hybrid_cv_matching'
        });

    } catch (error) {
        console.error('❌ Error matching CVs to job:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Classify CV to determine job title/role
 * Uses cv_classifier_merged.keras model + Groq API
 */
export const classifyCV = async (req, res) => {
    try {
        console.log('🎯 Classifying CV for user:', req.user.email);

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

        // Call CV Classifier Service
        console.log('🔬 Calling CV Classifier Service at:', CV_CLASSIFIER_URL);

        const response = await axios.post(`${CV_CLASSIFIER_URL}/classify`, {
            cv_text: cvText,
            use_groq_analysis: true
        }, {
            timeout: 30000 // 30 seconds timeout
        });

        if (response.data.success) {
            console.log('✅ Classification successful!');
            console.log('   Job Title:', response.data.job_title);
            console.log('   Confidence:', response.data.confidence);
            console.log('   AI Analysis:', response.data.ai_analysis);

            // Update candidate with classified job title
            candidate.jobTitle = response.data.job_title;
            await candidate.save();

            return res.status(200).json({
                success: true,
                data: {
                    jobTitle: response.data.job_title,
                    confidence: response.data.confidence,
                    decision_method: response.data.decision_method,
                    ai_analysis: response.data.ai_analysis,
                    keras_prediction: response.data.keras_prediction
                },
                message: 'CV classified successfully!'
            });
        } else {
            throw new Error(response.data.error || 'Classification failed');
        }

    } catch (error) {
        console.error('❌ Error classifying CV:', error.message);

        // Check if it's a connection error
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'CV Classifier Service is not running. Please start it first.',
                hint: 'Run: python ml-service/cv_classifier_service.py'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

