"""
Hybrid CV Classification Service
Uses Groq AI for intelligent analysis + keyword matching as fallback
No dependency on poorly-trained model
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import re
import sys
from typing import Optional, List
from collections import Counter

# Ensure UTF-8 stdout
sys.stdout.reconfigure(encoding="utf-8")

# Try to import Groq
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

app = FastAPI(title="CV Classification Service - Hybrid AI")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = None

# Comprehensive job categories with keyword patterns - ALL FIELDS
JOB_CATEGORIES_PATTERNS = {
    # Technical Roles
    "Machine Learning Engineer": {
        "keywords": ["machine learning", "ml", "deep learning", "neural network", "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "model training", "supervised learning", "unsupervised learning", "reinforcement learning", "computer vision", "nlp"],
        "weight": 3
    },
    "Data Scientist": {
        "keywords": ["data scien", "data analysis", "statistical", "pandas", "numpy", "data mining", "predictive model", "analytics", "r programming", "jupyter", "visualization", "insights", "regression", "classification"],
        "weight": 2.5
    },
    "AI Engineer": {
        "keywords": ["artificial intelligence", "ai", "computer vision", "nlp", "natural language", "chatbot", "transformers", "bert", "gpt", "llm", "ai model"],
        "weight": 3
    },
    "Software Engineer": {
        "keywords": ["software engineer", "software develop", "programming", "coding", "algorithms", "data structures", "oop", "object-oriented", "software design"],
        "weight": 2
    },
    "Full Stack Developer": {
        "keywords": ["full stack", "fullstack", "frontend", "backend", "mern", "mean", "lamp", "web application", "full-stack"],
        "weight": 2
    },
    "Frontend Developer": {
        "keywords": ["frontend", "front-end", "react", "angular", "vue", "html", "css", "javascript", "typescript", "ui", "responsive", "web design"],
        "weight": 2
    },
    "Backend Developer": {
        "keywords": ["backend", "back-end", "api", "rest", "graphql", "node", "express", "microservices", "server", "database"],
        "weight": 2
    },
    "DevOps Engineer": {
        "keywords": ["devops", "docker", "kubernetes", "k8s", "ci/cd", "jenkins", "terraform", "ansible", "deployment", "infrastructure", "automation"],
        "weight": 2.5
    },
    "Data Engineer": {
        "keywords": ["data engineer", "etl", "data pipeline", "spark", "hadoop", "airflow", "kafka", "data warehouse", "snowflake", "bigquery", "data integration"],
        "weight": 2.5
    },
    "Mobile Developer": {
        "keywords": ["mobile", "ios", "android", "react native", "flutter", "swift", "kotlin", "app development", "mobile app"],
        "weight": 2.5
    },
    "Cloud Engineer": {
        "keywords": ["aws", "azure", "gcp", "cloud", "ec2", "s3", "lambda", "cloud architecture", "cloud computing"],
        "weight": 2.5
    },
    "QA Engineer": {
        "keywords": ["qa", "quality assurance", "testing", "test automation", "selenium", "pytest", "test cases", "bug", "quality control"],
        "weight": 2
    },
    "Database Administrator": {
        "keywords": ["database admin", "dba", "mysql", "postgresql", "oracle", "sql server", "database management", "sql"],
        "weight": 2
    },
    "Cybersecurity Analyst": {
        "keywords": ["security", "cybersecurity", "penetration test", "vulnerability", "encryption", "firewall", "security analyst", "infosec", "threat"],
        "weight": 2.5
    },
    
    # Business & Management Roles
    "Project Manager": {
        "keywords": ["project manag", "pmp", "agile", "scrum", "project planning", "stakeholder", "timeline", "budget", "resource management", "coordination"],
        "weight": 2.5
    },
    "Product Manager": {
        "keywords": ["product manag", "product owner", "roadmap", "feature", "product strategy", "user story", "backlog", "product development"],
        "weight": 2.5
    },
    "Business Analyst": {
        "keywords": ["business analyst", "requirements", "stakeholder", "process improvement", "business process", "analysis", "documentation", "workflow"],
        "weight": 2
    },
    "Operations Manager": {
        "keywords": ["operations manag", "process optimization", "supply chain", "logistics", "inventory", "operational excellence", "efficiency"],
        "weight": 2
    },
    "Human Resources Manager": {
        "keywords": ["human resources", "hr manager", "recruitment", "talent acquisition", "employee relations", "hiring", "onboarding", "hr"],
        "weight": 2
    },
    "Sales Manager": {
        "keywords": ["sales manag", "business development", "client acquisition", "revenue", "sales strategy", "account management", "sales target"],
        "weight": 2
    },
    "Marketing Manager": {
        "keywords": ["marketing manag", "digital marketing", "brand", "campaign", "market research", "marketing strategy", "seo", "sem", "social media"],
        "weight": 2
    },
    
    # Finance & Accounting
    "Financial Analyst": {
        "keywords": ["financial analyst", "finance", "financial modeling", "investment", "budgeting", "forecasting", "excel", "financial planning"],
        "weight": 2
    },
    "Accountant": {
        "keywords": ["accountant", "accounting", "bookkeeping", "financial reporting", "audit", "tax", "general ledger", "accounts payable", "accounts receivable"],
        "weight": 2
    },
    "Investment Analyst": {
        "keywords": ["investment", "portfolio", "equity", "valuation", "financial markets", "trading", "stock", "bonds"],
        "weight": 2.5
    },
    
    # Healthcare & Medical
    "Medical Doctor": {
        "keywords": ["medical doctor", "physician", "md", "clinical", "patient care", "diagnosis", "treatment", "medicine", "healthcare"],
        "weight": 3
    },
    "Nurse": {
        "keywords": ["nurse", "nursing", "patient care", "rn", "registered nurse", "healthcare", "clinical care"],
        "weight": 2.5
    },
    "Pharmacist": {
        "keywords": ["pharmacist", "pharmacy", "medication", "pharmaceutical", "drug", "prescription"],
        "weight": 2.5
    },
    
    # Education & Training
    "Teacher": {
        "keywords": ["teacher", "teaching", "education", "curriculum", "classroom", "student", "lesson plan", "educator"],
        "weight": 2
    },
    "Training Specialist": {
        "keywords": ["training", "instructor", "learning", "course development", "e-learning", "facilitation", "workshop"],
        "weight": 2
    },
    
    # Design & Creative
    "Graphic Designer": {
        "keywords": ["graphic design", "photoshop", "illustrator", "creative", "visual design", "branding", "typography", "layout"],
        "weight": 2
    },
    "UI/UX Designer": {
        "keywords": ["ui", "ux", "user experience", "user interface", "figma", "sketch", "wireframe", "prototype", "design thinking"],
        "weight": 2.5
    },
    "Content Writer": {
        "keywords": ["content writ", "copywriting", "blog", "article", "content creation", "seo writing", "technical writing"],
        "weight": 2
    },
    
    # Legal & Compliance
    "Lawyer": {
        "keywords": ["lawyer", "attorney", "legal", "law", "litigation", "contract", "legal counsel", "legal advice"],
        "weight": 2.5
    },
    "Compliance Officer": {
        "keywords": ["compliance", "regulatory", "audit", "policy", "risk management", "governance"],
        "weight": 2
    },
    
    # Customer Service & Support
    "Customer Service Representative": {
        "keywords": ["customer service", "customer support", "call center", "client support", "help desk", "customer care"],
        "weight": 1.5
    },
    "Technical Support Specialist": {
        "keywords": ["technical support", "it support", "troubleshooting", "help desk", "tech support", "user support"],
        "weight": 2
    },
    
    # Administrative
    "Administrative Assistant": {
        "keywords": ["administrative", "office management", "scheduling", "coordination", "clerical", "admin", "receptionist"],
        "weight": 1.5
    },
    "Executive Assistant": {
        "keywords": ["executive assistant", "c-level support", "executive support", "calendar management", "travel coordination"],
        "weight": 2
    }
}


class CVClassificationRequest(BaseModel):
    cv_text: str
    use_groq_analysis: bool = True


class PredictionItem(BaseModel):
    job_title: str
    confidence: float


class CVClassificationResponse(BaseModel):
    success: bool
    job_title: str
    confidence: float
    decision_method: str
    top_5_predictions: List[PredictionItem]
    ai_analysis: Optional[str] = None
    keras_prediction: Optional[str] = None


def extract_keywords_score(cv_text: str) -> dict:
    """Calculate weighted scores for each job category"""
    cv_lower = cv_text.lower()
    
    scores = {}
    
    for job_title, pattern_data in JOB_CATEGORIES_PATTERNS.items():
        keywords = pattern_data["keywords"]
        weight = pattern_data["weight"]
        
        score = 0
        matches_found = []
        
        for keyword in keywords:
            # Use word boundaries for accurate matching
            pattern = r'\b' + re.escape(keyword)
            matches = re.findall(pattern, cv_lower, re.IGNORECASE)
            if matches:
                score += len(matches) * weight
                matches_found.append(keyword)
        
        if score > 0:
            scores[job_title] = {
                "score": score,
                "matches": matches_found
            }
    
    return scores


def classify_with_keywords(cv_text: str) -> dict:
    """Keyword-based classification with weighted scoring"""
    
    scores = extract_keywords_score(cv_text)
    
    if not scores:
        return {
            "job_title": "Software Engineer",
            "confidence": 0.3,
            "method": "default",
            "top_5": []
        }
    
    # Sort by score
    sorted_jobs = sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True)
    
    best_job = sorted_jobs[0][0]
    best_score = sorted_jobs[0][1]["score"]
    
    # Calculate confidence (normalize to 0-1)
    total_score = sum(job[1]["score"] for job in sorted_jobs)
    confidence = min(0.95, best_score / max(total_score, 1))
    
    # Get top 5
    top_5 = []
    for job, data in sorted_jobs[:5]:
        job_confidence = data["score"] / max(total_score, 1)
        top_5.append({
            "job_title": job,
            "confidence": round(job_confidence, 3)
        })
    
    return {
        "job_title": best_job,
        "confidence": confidence,
        "method": "keyword_weighted",
        "top_5": top_5,
        "matches": sorted_jobs[0][1]["matches"][:5]
    }


def classify_with_groq(cv_text: str) -> dict:
    """Use Groq AI for intelligent classification"""
    
    if not groq_client or not GROQ_AVAILABLE:
        return None
    
    try:
        # All available job categories
        all_jobs = list(JOB_CATEGORIES_PATTERNS.keys())
        job_list = ", ".join(all_jobs[:20])  # Show first 20
        
        prompt = f"""You are an expert career counselor and HR specialist. Analyze this CV/Resume carefully and determine the MOST SUITABLE job title.

CV/Resume Content:
{cv_text[:3000]}

Available Job Categories (and similar roles):
{job_list}, and many more including healthcare, finance, education, design, legal, administrative, and management roles.

IMPORTANT INSTRUCTIONS:
1. Read the ENTIRE CV carefully
2. Consider: skills, experience, education, certifications, achievements
3. Choose the job title that BEST matches the candidate's PRIMARY expertise
4. Be specific and accurate - don't default to generic titles
5. Consider non-technical roles (business, finance, healthcare, etc.)

Respond with ONLY a JSON object:
{{
  "job_title": "Most Accurate Job Title",
  "confidence": 0.85,
  "reasoning": "Brief explanation based on CV content"
}}

The job title MUST be one that accurately represents the candidate's main professional identity."""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert HR recruiter with 20+ years of experience in career counseling across ALL industries (tech, healthcare, finance, education, legal, etc.). You provide accurate, specific job title classifications based on CV analysis."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,  # Lower temperature for more accurate results
            max_tokens=250
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Try to parse JSON response
        import json
        
        # Extract JSON if wrapped in markdown
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        
        return {
            "job_title": result.get("job_title", "Software Engineer"),
            "confidence": float(result.get("confidence", 0.7)),
            "method": "groq_ai",
            "reasoning": result.get("reasoning", "AI analysis")
        }
        
    except Exception as e:
        print(f"⚠️  Groq classification failed: {e}")
        return None


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    global groq_client
    
    print("\n" + "=" * 60)
    print("🚀 CV Classification Service - Hybrid AI")
    print("=" * 60)
    
    # Try to initialize Groq
    if GROQ_AVAILABLE:
        try:
            api_key = os.getenv("GROQ_API_KEY")
            if api_key:
                groq_client = Groq(api_key=api_key)
                print("✅ Groq AI enabled")
            else:
                print("⚠️  GROQ_API_KEY not set - Groq disabled")
        except Exception as e:
            print(f"⚠️  Groq initialization failed: {e}")
    else:
        print("⚠️  Groq library not installed - using keyword matching only")
    
    print(f"✅ Loaded {len(JOB_CATEGORIES_PATTERNS)} job categories")
    print("=" * 60 + "\n")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CV Classification - Hybrid AI",
        "status": "running",
        "groq_enabled": groq_client is not None,
        "job_categories": len(JOB_CATEGORIES_PATTERNS),
        "method": "groq_ai + keyword_matching"
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "groq_available": groq_client is not None,
        "categories_count": len(JOB_CATEGORIES_PATTERNS)
    }


@app.post("/classify", response_model=CVClassificationResponse)
async def classify_endpoint(request: CVClassificationRequest):
    """Classify CV endpoint"""
    
    try:
        cv_text = request.cv_text.strip()
        
        if not cv_text or len(cv_text) < 50:
            raise HTTPException(
                status_code=400,
                detail="CV text is too short (minimum 50 characters)"
            )
        
        print(f"\n{'='*60}")
        print(f"📄 Classifying CV ({len(cv_text)} chars)")
        print(f"{'='*60}")
        
        # Try Groq AI first if enabled
        groq_result = None
        if request.use_groq_analysis and groq_client:
            print("🤖 Using Groq AI for classification...")
            groq_result = classify_with_groq(cv_text)
        
        # Keyword-based classification
        print("🔍 Running keyword analysis...")
        keyword_result = classify_with_keywords(cv_text)
        
        # Decide which result to use
        if groq_result and groq_result.get("confidence", 0) > 0.6:
            # Use Groq result
            final_job = groq_result["job_title"]
            final_confidence = groq_result["confidence"]
            final_method = "groq_ai"
            ai_analysis = groq_result.get("reasoning", "")
            
            # Get keyword top 5 for additional context
            top_5 = keyword_result["top_5"]
            
        else:
            # Use keyword result
            final_job = keyword_result["job_title"]
            final_confidence = keyword_result["confidence"]
            final_method = keyword_result["method"]
            ai_analysis = f"Matched keywords: {', '.join(keyword_result.get('matches', []))}"
            top_5 = keyword_result["top_5"]
        
        print(f"\n✅ Result: {final_job} ({final_confidence*100:.1f}%)")
        print(f"   Method: {final_method}")
        print(f"{'='*60}\n")
        
        return CVClassificationResponse(
            success=True,
            job_title=final_job,
            confidence=final_confidence,
            decision_method=final_method,
            top_5_predictions=top_5,
            ai_analysis=ai_analysis,
            keras_prediction=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
        return CVClassificationResponse(
            success=False,
            job_title="Error",
            confidence=0.0,
            decision_method="error",
            top_5_predictions=[],
            keras_prediction=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    
    port = 5002
    print(f"\n🚀 Starting Hybrid CV Classification Service on port {port}...")
    print(f"📝 Health: http://localhost:{port}/health")
    print(f"🔬 Classify: POST http://localhost:{port}/classify")
    print("\nPress Ctrl+C to stop\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
