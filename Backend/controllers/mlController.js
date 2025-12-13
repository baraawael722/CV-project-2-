import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import axios from "axios";
import { hybridMatch } from "../utils/hybridMatcher.js";
import { getPythonMatcher } from "../utils/pythonMatcher.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ML_SERVICE_URL = process.env.ML_HOST || "http://127.0.0.1:5001";
const CV_CLASSIFIER_URL =
  process.env.CV_CLASSIFIER_URL || "http://127.0.0.1:5002";
const USE_PYTHON_MATCHER = process.env.USE_PYTHON_MATCHER !== "false"; // Default: true (Python BERT matcher)

// Python service DISABLED - using JavaScript matcher only for reliable results
let pythonServiceReady = false;
// const pythonMatcher = getPythonMatcher();

// pythonMatcher
//   .start()
//   .then(() => {
//     pythonServiceReady = true;
//     console.log("✅ Python BERT Matcher Service started successfully!");
//   })
//   .catch((error) => {
//     pythonServiceReady = false;
//     console.error("❌ Failed to start Python service:", error.message);
//     console.log("⚠️  Will fallback to JavaScript matcher");
//   });

export const matchCV = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "cvFile is required" });
    }
    return res
      .status(501)
      .json({ success: false, message: "ML integration disabled" });
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { success: false, error: err.message };
    return res.status(status).json(data);
  }
};

export const matchJobs = async (req, res) => {
  try {
    console.log("🎯 Matching jobs for user:", req.user.email);

    // Get candidate's CV text
    const candidate = await Candidate.findOne({ email: req.user.email });
    if (
      !candidate ||
      !candidate.resumeText ||
      candidate.resumeText.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "No CV found. Please upload your CV first.",
      });
    }

    const cvText = candidate.resumeText;
    console.log("📄 CV Text Length:", cvText.length, "characters");
    console.log("📄 CV Preview:", cvText.substring(0, 100) + "...");

    // Fetch active jobs to match against
    const jobs = await Job.find({ status: "Active" });
    if (!jobs || jobs.length === 0) {
      return res.status(422).json({
        success: false,
        message: "No jobs available",
      });
    }

    console.log(`💼 Found ${jobs.length} active jobs to match`);

    // Use Python matcher with BERT embeddings (same as test_my_cv.py)
    if (USE_PYTHON_MATCHER && pythonServiceReady) {
      try {
        console.log(
          "🐍 Using Persistent Python BERT Matcher (70% Semantic BERT + 30% Keywords)"
        );

        // Prepare job descriptions (description field only!)
        const jobDescriptions = jobs.map((job) => job.description || "");

        // Call persistent Python service (model already loaded in memory!)
        const matches = await pythonMatcher.match(cvText, jobDescriptions, 10);

        // Map results back to full job objects
        const jobsWithScores = matches.map((match) => ({
          ...jobs[match.job_index].toObject(),
          matchScore: Math.round(match.similarity_score * 100) / 100,
        }));

        console.log(
          `✅ Python BERT Matcher returned ${jobsWithScores.length} matches`
        );
        jobsWithScores.slice(0, 5).forEach((job, idx) => {
          console.log(`   ${idx + 1}. "${job.title}": ${job.matchScore}%`);
        });

        return res.status(200).json({
          success: true,
          data: jobsWithScores,
          method: "python_bert_hybrid_persistent",
          note: "Using BERT embeddings + keyword matching (same as test_my_cv.py) - Fast persistent service!",
        });
      } catch (pythonError) {
        console.error("❌ Python matcher failed:", pythonError.message);
        console.log("⚠️  Falling back to JavaScript hybrid matcher...");
        // Fall through to JavaScript matcher
      }
    } else if (USE_PYTHON_MATCHER && !pythonServiceReady) {
      console.log("⚠️  Python service not ready, using JavaScript fallback");
    }

    // Fallback: Use JavaScript Hybrid Matcher
    console.log(
      "🚀 Using JavaScript Hybrid Matcher (token-based semantic + keywords)"
    );
    const matches = hybridMatch(cvText, jobs, 10);

    const jobsWithScores = matches.map((match) => ({
      ...match.job.toObject(),
      matchScore: match.matchScore,
    }));

    console.log(`✅ Returning ${jobsWithScores.length} jobs with match scores`);

    return res.status(200).json({
      success: true,
      data: jobsWithScores,
      method: "javascript_hybrid",
      note: "Token-based matching (fallback mode)",
    });
  } catch (err) {
    console.error("❌ Error in matchJobs:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getMatchInputs = async (req, res) => {
  try {
    const email = (req.query?.email || "").trim().toLowerCase();
    let candidate = null;
    if (email) {
      candidate = await Candidate.findOne({ email });
    } else {
      candidate = await Candidate.findOne({
        resumeText: { $exists: true, $ne: "" },
      }).sort({ createdAt: -1 });
    }
    if (
      !candidate ||
      !candidate.resumeText ||
      candidate.resumeText.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "No candidate resumeText found. Provide ?email=",
      });
    }

    const cvText = candidate.resumeText;
    const text = (cvText || "").toLowerCase();
    const normalize = (s) =>
      s
        .toLowerCase()
        .replace(/\+/g, "p")
        .replace(/#/g, "sharp")
        .replace(/node\.?\s*js/g, "nodejs");
    const tokenize = (s) =>
      normalize(s)
        .replace(/[^a-z0-9\s]+/g, " ")
        .split(/\s+/)
        .filter(Boolean);
    const stop = new Set([
      "the",
      "and",
      "for",
      "with",
      "from",
      "into",
      "that",
      "this",
      "will",
      "shall",
      "have",
      "has",
      "are",
      "was",
      "were",
      "to",
      "in",
      "on",
      "of",
      "a",
      "an",
      "by",
      "at",
      "as",
      "or",
      "your",
      "you",
      "we",
      "our",
    ]);
    const filterTokens = (arr) =>
      arr.filter((w) => !stop.has(w) && w.length > 2);
    const makeBigrams = (arr) =>
      arr
        .slice(0, Math.max(0, arr.length - 1))
        .map((_, i) => `${arr[i]} ${arr[i + 1]}`);
    const stem = (w) => w.replace(/(ing|ed|s)$/, "");
    const cvTokensRaw = tokenize(text);
    const cvTokens = filterTokens(cvTokensRaw).map(stem);
    const cvBigrams = makeBigrams(cvTokens);

    const jobs = await Job.find({ status: "Active" });
    if (!jobs || jobs.length === 0) {
      return res
        .status(422)
        .json({ success: false, message: "No jobs available" });
    }
    const limit = Math.min(parseInt(req.query?.limit || "10"), 50);
    const jobsPayload = jobs.slice(0, limit).map((job) => {
      const jobText = (job.description || "").toLowerCase();
      const jobTokensRaw = tokenize(jobText);
      const jobTokens = filterTokens(jobTokensRaw).map(stem);
      const jobBigrams = makeBigrams(jobTokens);
      return {
        jobId: job._id?.toString?.() || job.id || "unknown",
        title: job.title || "",
        descLen: jobText.length,
        tokenCount: jobTokens.length,
        bigramCount: jobBigrams.length,
        sampleTokens: jobTokens.slice(0, 30),
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
          preview: cvText.substring(0, 100),
        },
        jobs: jobsPayload,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Chat endpoint to power frontend chatbot (employee interview page)
 * POST /api/ml/chat
 * Body: { question: string, context?: string }
 * Uses GROQ API if `GROQ_API_KEY` is set, otherwise proxies to ML_SERVICE_URL `/chat`.
 */
export const chatModel = async (req, res) => {
  try {
    const { question, context } = req.body || {};
    if (!question || question.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "question is required" });
    }

    // Prefer using Groq API when API key is available
    if (process.env.GROQ_API_KEY) {
      const GROQ_API_URL =
        process.env.GROQ_API_URL ||
        "https://api.groq.com/openai/v1/chat/completions";
      const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

      const payload = {
        model,
        messages: [
          {
            role: "system",
            content:
              context ||
              "You are a professional career assistant chatbot. Use only the provided CV content when answering.",
          },
          { role: "user", content: question },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      };

      console.log("🤖 Calling Groq API:", GROQ_API_URL);
      console.log("📝 Model:", model);
      console.log("❓ Question:", question.substring(0, 100));

      const response = await axios.post(GROQ_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      });

      const answer =
        response.data?.choices?.[0]?.message?.content ||
        response.data?.output ||
        response.data?.text ||
        JSON.stringify(response.data);

      console.log("✅ Groq API response received");
      return res.status(200).json({ success: true, answer });
    }

    // Fallback: ask the configured ML service (if it exposes a /chat proxy)
    const resp = await axios.post(
      `${ML_SERVICE_URL}/chat`,
      { question, context },
      { timeout: 60000 }
    );
    return res.status(resp.status).json(resp.data);
  } catch (err) {
    console.error("❌ chatModel error:", err?.message || err);
    if (err.response) {
      console.error("📋 Response status:", err.response.status);
      console.error(
        "📋 Response data:",
        JSON.stringify(err.response.data, null, 2)
      );
    }
    const status = err.response?.status || 500;
    const data = err.response?.data || { success: false, error: err.message };
    return res.status(status).json(data);
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
        message: "jobId is required",
      });
    }

    console.log("🎯 HR: Finding matching CVs for job:", jobId);

    // Get the job description
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const jobDescription = job.description || "";
    if (!jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is empty",
      });
    }

    // Get all candidates with CV text
    const candidates = await Candidate.find({
      resumeText: { $exists: true, $ne: "" },
    });

    if (candidates.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No CVs found in database",
      });
    }

    console.log(`📄 Found ${candidates.length} candidates with CVs`);

    // Prepare CV texts
    const cvTexts = candidates.map((c) => c.resumeText || "");

    // Call Python script to match CVs to job
    const { spawn } = await import("child_process");
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "match_cvs_to_job.py"
    );

    const python = spawn("python", [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    const inputData = {
      job_description: jobDescription,
      cv_texts: cvTexts,
      top_k: 10,
    };

    // Send input to Python
    python.stdin.write(JSON.stringify(inputData));
    python.stdin.end();

    let outputData = "";
    let errorData = "";

    python.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorData += data.toString();
      console.log("🐍 Python:", data.toString().trim());
    });

    // Wait for Python to complete
    await new Promise((resolve, reject) => {
      python.on("close", (code) => {
        if (code !== 0) {
          reject(
            new Error(`Python script exited with code ${code}: ${errorData}`)
          );
        } else {
          resolve();
        }
      });

      python.on("error", (error) => {
        reject(new Error(`Failed to start Python: ${error.message}`));
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        python.kill();
        reject(new Error("Python script timeout (60s)"));
      }, 60000);
    });

    // Parse Python output
    const result = JSON.parse(outputData);

    if (!result.success) {
      throw new Error(result.error || "Python matcher failed");
    }

    // Map results back to full candidate objects
    // Note: Python returns 'job_index' but we're matching CVs, so it's actually cv_index
    const matchedCandidates = result.matches
      .map((match) => {
        const cvIndex =
          match.job_index !== undefined ? match.job_index : match.cv_index;
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
          resumeText: candidate.resumeText.substring(0, 300) + "...", // Preview only
        };
      })
      .filter((c) => c !== null);

    console.log(`✅ Matched ${matchedCandidates.length} candidates to job`);
    matchedCandidates.slice(0, 5).forEach((c, idx) => {
      console.log(`   ${idx + 1}. ${c.name}: ${c.matchScore}%`);
    });

    return res.status(200).json({
      success: true,
      data: matchedCandidates,
      jobTitle: job.title,
      method: "python_bert_hybrid_cv_matching",
    });
  } catch (error) {
    console.error("❌ Error matching CVs to job:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Classify CV to determine job title/role
 * Uses cv_classifier_merged.keras model + Groq API
 */
export const classifyCV = async (req, res) => {
  try {
    console.log("🎯 Classifying CV for user:", req.user.email);

    // Get candidate's CV text
    const candidate = await Candidate.findOne({ email: req.user.email });
    if (
      !candidate ||
      !candidate.resumeText ||
      candidate.resumeText.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "No CV found. Please upload your CV first.",
      });
    }

    const cvText = candidate.resumeText;
    console.log("📄 CV Text Length:", cvText.length, "characters");

    // Call CV Classifier Service
    console.log("🔬 Calling CV Classifier Service at:", CV_CLASSIFIER_URL);

    const response = await axios.post(
      `${CV_CLASSIFIER_URL}/classify`,
      {
        cv_text: cvText,
        use_groq_analysis: true,
      },
      {
        timeout: 30000, // 30 seconds timeout
      }
    );

    if (response.data.success) {
      console.log("✅ Classification successful!");
      console.log("   Job Title:", response.data.job_title);
      console.log("   Confidence:", response.data.confidence);
      console.log("   AI Analysis:", response.data.ai_analysis);

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
          keras_prediction: response.data.keras_prediction,
        },
        message: "CV classified successfully!",
      });
    } else {
      throw new Error(response.data.error || "Classification failed");
    }
  } catch (error) {
    console.error("❌ Error classifying CV:", error.message);

    // Check if it's a connection error
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "CV Classifier Service is not running. Please start it first.",
        hint: "Run: python ml-service/cv_classifier_service.py",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Analyze a specific job against user's CV
 * Returns matched and missing skills
 */
export const analyzeJobForUser = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userEmail = req.user.email;

    console.log("🎯 Analyzing job", jobId, "for user:", userEmail);

    // Get the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Get candidate's CV
    const candidate = await Candidate.findOne({ email: userEmail });
    if (
      !candidate ||
      !candidate.resumeText ||
      candidate.resumeText.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "No CV found. Please upload your CV first.",
      });
    }

    const cvText = candidate.resumeText;
    const jobDescription = job.description || "";

    if (!jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is empty",
      });
    }

    console.log("📄 CV Text Length:", cvText.length);
    console.log("💼 Job Description Length:", jobDescription.length);

    // Extract skills from Job Description using intelligent pattern matching
    const extractSkillsFromText = (text) => {
      const commonSkills = [
        // Programming Languages
        "python",
        "javascript",
        "java",
        "c++",
        "c#",
        "php",
        "ruby",
        "go",
        "rust",
        "swift",
        "kotlin",
        "typescript",
        "r",
        "matlab",
        "scala",
        "perl",
        "dart",
        "objective-c",

        // Web Technologies
        "html",
        "css",
        "html5",
        "css3",
        "react",
        "vue",
        "angular",
        "node.js",
        "nodejs",
        "express",
        "next.js",
        "nuxt",
        "gatsby",
        "svelte",
        "jquery",
        "bootstrap",
        "tailwind",
        "sass",
        "less",

        // Backend & Frameworks
        "django",
        "flask",
        "fastapi",
        "spring",
        "spring boot",
        ".net",
        "asp.net",
        "laravel",
        "ruby on rails",
        "rails",
        "nest.js",
        "koa",
        "fastify",

        // Databases
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "redis",
        "sqlite",
        "oracle",
        "sql server",
        "cassandra",
        "dynamodb",
        "elasticsearch",
        "mariadb",
        "firebase",
        "firestore",

        // Cloud & DevOps
        "aws",
        "azure",
        "gcp",
        "google cloud",
        "docker",
        "kubernetes",
        "jenkins",
        "gitlab",
        "github actions",
        "terraform",
        "ansible",
        "ci/cd",
        "linux",
        "bash",
        "shell scripting",

        // Mobile Development
        "react native",
        "flutter",
        "ios",
        "android",
        "xamarin",
        "cordova",
        "ionic",

        // Data Science & ML
        "machine learning",
        "deep learning",
        "tensorflow",
        "pytorch",
        "keras",
        "scikit-learn",
        "pandas",
        "numpy",
        "data analysis",
        "data science",
        "nlp",
        "computer vision",
        "ai",

        // Tools & Others
        "git",
        "github",
        "gitlab",
        "bitbucket",
        "jira",
        "agile",
        "scrum",
        "rest api",
        "graphql",
        "microservices",
        "websocket",
        "oauth",
        "jwt",
        "testing",
        "unit testing",
        "jest",
        "mocha",
        "pytest",
        "selenium",
        "cypress",
        "postman",
        "swagger",
        "webpack",
        "babel",
        "npm",
        "yarn",

        // Concepts & Methodologies
        "oop",
        "functional programming",
        "design patterns",
        "solid",
        "tdd",
        "bdd",
        "mvc",
        "mvvm",
        "clean code",
        "refactoring",
        "version control",
        "code review",

        // Soft Skills (commonly required)
        "communication",
        "teamwork",
        "problem solving",
        "leadership",
        "time management",
        "analytical",
        "critical thinking",
        "collaboration",
        "adaptability",
      ];

      const textLower = text.toLowerCase();
      const foundSkills = new Set();

      // Find skills mentioned in the text
      commonSkills.forEach((skill) => {
        // Use word boundaries for better matching
        const pattern = new RegExp(
          `\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i"
        );
        if (pattern.test(textLower)) {
          foundSkills.add(skill);
        }
      });

      return Array.from(foundSkills);
    };

    // Extract skills from job description
    const jobDescriptionSkills = extractSkillsFromText(jobDescription);

    // Combine with required skills from database
    const allRequiredSkills = [
      ...new Set([...(job.requiredSkills || []), ...jobDescriptionSkills]),
    ];

    console.log(
      `📋 Found ${jobDescriptionSkills.length} skills in Job Description`
    );
    console.log(`📋 Total required skills: ${allRequiredSkills.length}`);
    console.log(
      `📋 Skills found:`,
      allRequiredSkills.slice(0, 10).join(", "),
      "..."
    );

    let matchScore = 0;
    let matchedSkills = [];
    let missingSkills = [];

    // Try to call Python script for hybrid ML+Smart analysis
    try {
      const { spawn } = await import("child_process");
      const scriptPath = path.join(
        __dirname,
        "..",
        "..",
        "last-one",
        "hybrid_matcher.py"
      );

      console.log("🤖 Running Hybrid Matcher (Smart + ML):", scriptPath);

      const python = spawn("python", [scriptPath, "--api-mode"], {
        cwd: path.join(__dirname, "..", "..", "last-one"),
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });

      const inputData = {
        cv_text: cvText,
        job_description: jobDescription,
        threshold: 0.3,
        top_n: 15,
      };

      // Send input to Python
      python.stdin.write(JSON.stringify(inputData));
      python.stdin.end();

      let outputData = "";
      let errorData = "";

      python.stdout.on("data", (data) => {
        outputData += data.toString();
      });

      python.stderr.on("data", (data) => {
        errorData += data.toString();
        console.log("🐍 Python:", data.toString().trim());
      });

      // Wait for Python to complete
      await new Promise((resolve, reject) => {
        python.on("close", (code) => {
          if (code !== 0) {
            console.error("❌ Python stderr:", errorData);
            reject(new Error(`Python script exited with code ${code}`));
          } else {
            resolve();
          }
        });

        python.on("error", (error) => {
          reject(new Error(`Failed to start Python: ${error.message}`));
        });

        // Timeout after 60 seconds
        setTimeout(() => {
          python.kill();
          reject(new Error("Python script timeout (60s)"));
        }, 60000);
      });

      // Parse Python output
      let result;
      try {
        result = JSON.parse(outputData);
        if (result.success) {
          matchScore = result.match_score || 0;
          matchedSkills = result.matched_skills || [];
          missingSkills = result.missing_skills || [];

          console.log("✅ ML Analysis successful:");
          console.log(`   📊 Match Score: ${matchScore}%`);
          console.log(`   ✅ Matched: ${matchedSkills.length} skills`);
          console.log(`   ❌ Missing: ${missingSkills.length} skills`);
        }
      } catch (parseError) {
        console.error("❌ Failed to parse Python output:", outputData);
        throw new Error("Invalid Python output");
      }
    } catch (pythonError) {
      console.warn(
        "⚠️ ML analysis failed, using basic matching:",
        pythonError.message
      );

      // Fallback: Calculate match score based on required skills
      const cvLower = cvText.toLowerCase();

      // Extract skills from CV
      const cvSkills = extractSkillsFromText(cvText);

      // Find matched skills
      matchedSkills = allRequiredSkills
        .filter((skill) => cvLower.includes(skill.toLowerCase()))
        .map((skill) => ({
          skill,
          confidence: "100%",
          source: "keyword_match",
        }));

      // Find missing skills
      const missingSkillsList = allRequiredSkills.filter(
        (skill) => !cvLower.includes(skill.toLowerCase())
      );

      missingSkills = missingSkillsList.map((skill) => ({
        skill,
        confidence: "95%",
        source: "extracted_from_job_description",
        youtube_search: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          skill + " tutorial"
        )}`,
        youtube_direct: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          "learn " + skill
        )}`,
      }));

      matchScore =
        allRequiredSkills.length > 0
          ? (matchedSkills.length / allRequiredSkills.length) * 100
          : 50;

      console.log(
        `📊 Fallback analysis: ${matchedSkills.length}/${allRequiredSkills.length} skills matched`
      );
    }

    console.log(
      `✅ Final Analysis: ${matchedSkills.length} matched, ${
        missingSkills.length
      } missing, ${matchScore.toFixed(1)}% match`
    );

    return res.status(200).json({
      success: true,
      data: {
        matchScore: Math.round(matchScore * 100) / 100,
        matchedSkills: matchedSkills,
        missingSkills: missingSkills,
        totalRequired: allRequiredSkills.length,
        extractedSkillsCount: jobDescriptionSkills.length,
        analysis: `Matched ${matchedSkills.length} out of ${allRequiredSkills.length} required skills. ${jobDescriptionSkills.length} skills extracted from job description.`,
      },
    });
  } catch (error) {
    console.error("❌ Error in analyzeJobForUser:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze job",
    });
  }
};
