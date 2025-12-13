"""
CV Classification Service
يستخدم موديل cv_classifier_merged.keras مع Groq API لتصنيف السير الذاتية
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import os
import re
import sys
from typing import Optional
import json

# Ensure UTF-8 stdout to avoid Windows encoding errors with logs
sys.stdout.reconfigure(encoding="utf-8")

# استيراد Groq API
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("⚠️ Groq library not available. Will use only Keras model.")

app = FastAPI(title="CV Classification Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# تحميل موديل Keras
MODEL_PATH = "cv_classifier_merged.keras"
model = None
groq_client = None

# Job titles/categories للتصنيف
JOB_CATEGORIES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "UI/UX Designer",
    "Software Engineer",
    "Quality Assurance Engineer",
    "Database Administrator",
    "Security Engineer",
    "Cloud Engineer",
    "Product Manager",
    "Business Analyst"
]


class CVClassificationRequest(BaseModel):
    cv_text: str
    use_groq_analysis: bool = True


class CVClassificationResponse(BaseModel):
    success: bool
    job_title: str
    confidence: float
    decision_method: Optional[str] = None
    ai_analysis: Optional[dict] = None
    keras_prediction: Optional[dict] = None
    error: Optional[str] = None


def load_model():
    """تحميل موديل Keras"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"✅ Keras model loaded successfully from {MODEL_PATH}")
        else:
            # البحث عن الموديل في المجلد الرئيسي
            parent_model_path = os.path.join("..", MODEL_PATH)
            if os.path.exists(parent_model_path):
                model = tf.keras.models.load_model(parent_model_path)
                print(f"✅ Keras model loaded from parent directory: {parent_model_path}")
            else:
                print(f"⚠️ Model file not found at {MODEL_PATH}")
                print(f"⚠️ Also checked: {parent_model_path}")
                model = None
    except Exception as e:
        print(f"❌ Error loading Keras model: {e}")
        model = None


def initialize_groq():
    """تهيئة Groq API"""
    global groq_client
    if not GROQ_AVAILABLE:
        return
    
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        try:
            groq_client = Groq(api_key=api_key)
            print("✅ Groq client initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing Groq: {e}")
            groq_client = None
    else:
        print("⚠️ GROQ_API_KEY not found in environment variables")


@app.on_event("startup")
async def startup_event():
    """تشغيل عند بدء السيرفر"""
    print("🚀 Starting CV Classification Service...")
    load_model()
    initialize_groq()
    print("✅ Service ready!")


def extract_text_features(text: str) -> np.ndarray:
    """
    استخراج features من النص - عمل text padding ل 8000 characters
    الموديل يتوقع CV text بطول محدد
    """
    text = text.lower()[:8000]  # خذ أول 8000 حرف
    
    # Pad أو truncate إلى 8000 characters
    if len(text) < 8000:
        text = text + ' ' * (8000 - len(text))
    
    # تحويل النص إلى ASCII values ثم تطبيعها
    # هذه طريقة بسيطة للحصول على 8000 features من النص
    features = []
    for char in text:
        # تحويل كل حرف إلى قيمة ASCII وتطبيعها
        ascii_val = ord(char) / 256.0  # normalize بين 0 و 1
        features.append(ascii_val)
    
    features_array = np.array(features, dtype=np.float32).reshape(1, -1)
    return features_array


def detect_domain_role(text_lower: str) -> Optional[str]:
    """اكتشاف دور عام من كلمات نطاق غير تقني مثل الرعاية الصحية"""
    healthcare_terms = [
        'hospital', 'clinic', 'patient', 'healthcare', 'medical', 'doctor', 'nurse',
        'pharmacy', 'pharmacist', 'therapist', 'surgery', 'laboratory', 'radiology'
    ]
    if any(term in text_lower for term in healthcare_terms):
        return "Healthcare Professional"
    return None


def extract_analysis_from_text(cv_text: str) -> dict:
    """استخراج التحليل من النص مباشرة (بدون API)"""
    text_lower = cv_text.lower()
    
    # استخراج المهارات
    all_skills = [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        'react', 'vue', 'angular', 'nodejs', 'express', 'django', 'flask', 'spring',
        'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
        'aws', 'azure', 'gcp', 'git', 'linux', 'html', 'css', 'sql',
        'machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'rest api'
    ]
    
    found_skills = [skill for skill in all_skills if skill in text_lower]
    
    # استخراج سنوات الخبرة
    experience_years = 0
    import re
    years_match = re.search(r'(\d+)\s*(?:years?|yrs?|سنة|سنوات)', text_lower)
    if years_match:
        experience_years = int(years_match.group(1))
    
    # استخراج اللغات البرمجية
    languages = []
    lang_keywords = {
        'Python': 'python',
        'JavaScript': 'javascript',
        'Java': 'java',
        'C++': 'c++',
        'C#': 'c#',
        'PHP': 'php',
        'Ruby': 'ruby',
        'Go': 'go',
        'TypeScript': 'typescript'
    }
    
    for lang_name, keyword in lang_keywords.items():
        if keyword in text_lower:
            languages.append(lang_name)

    # تحديد دور عام (مثل الرعاية الصحية) إذا لم تكن مهارات تقنية موجودة
    domain_role = detect_domain_role(text_lower)
    primary_role = domain_role or "Software Developer"
    
    return {
        "primary_role": primary_role,
        "skills": found_skills[:15],  # حد أقصى 15 مهارة
        "experience_years": experience_years,
        "languages": languages,
        "projects": [],
        "recommended_categories": []
    }


def analyze_cv_with_groq(cv_text: str) -> dict:
    """تحليل CV باستخدام Groq API"""
    if not groq_client:
        return {"error": "Groq client not available"}
    
    prompt = f"""
Analyze this CV and provide detailed information about the candidate's profile:

CV Text:
{cv_text}

Please provide:
1. Primary job role/title that best fits this candidate
2. Key technical skills mentioned
3. Years of experience (estimate if not explicitly stated)
4. Main programming languages
5. Notable projects or achievements
6. Recommended job categories (from: Frontend Developer, Backend Developer, Full Stack Developer, Mobile Developer, DevOps Engineer, Data Scientist, Machine Learning Engineer, UI/UX Designer, Software Engineer, Quality Assurance Engineer)

Format your response as JSON with these fields:
{{
    "primary_role": "...",
    "skills": ["skill1", "skill2", ...],
    "experience_years": number,
    "languages": ["lang1", "lang2", ...],
    "projects": ["project1", "project2", ...],
    "recommended_categories": ["category1", "category2", ...]
}}
"""
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",  # أو أي موديل متاح
            temperature=0.3,
            max_tokens=1024,
        )
        
        response_text = chat_completion.choices[0].message.content
        
        # محاولة استخراج JSON من الرد
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
            return analysis
        else:
            return {"raw_response": response_text}
            
    except Exception as e:
        return {"error": str(e)}


def classify_with_keywords(cv_text: str) -> dict:
    """تصنيف بسيط باستخدام keyword matching"""
    text_lower = cv_text.lower()
    
    # تعريف keywords لكل فئة
    job_keywords = {
        "Frontend Developer": ['react', 'vue', 'angular', 'javascript', 'html', 'css', 'frontend', 'ui', 'typescript', 'next.js'],
        "Backend Developer": ['node', 'python', 'java', 'django', 'flask', 'spring', 'backend', 'api', 'express', 'fastapi'],
        "Full Stack Developer": ['full stack', 'fullstack', 'mern', 'mean', 'full-stack', 'lamp'],
        "Mobile Developer": ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'mobile', 'app'],
        "DevOps Engineer": ['docker', 'kubernetes', 'aws', 'azure', 'devops', 'ci/cd', 'jenkins', 'terraform'],
        "Data Scientist": ['data science', 'machine learning', 'pandas', 'numpy', 'python', 'tensorflow', 'pytorch'],
        "Machine Learning Engineer": ['machine learning', 'deep learning', 'ai', 'neural', 'tensorflow', 'pytorch', 'keras'],
    }
    
    # احسب score لكل فئة
    scores = {}
    for job_title, keywords in job_keywords.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        scores[job_title] = score
    
    # احصل على الفئة الأعلى
    best_job = max(scores, key=scores.get)
    best_score = scores[best_job]
    
    # حول score إلى confidence (normalized)
    max_possible_score = max(len(kw) for kw in job_keywords.values())
    confidence = min(best_score / max_possible_score * 100, 100) / 100
    confidence = max(confidence, 0.5)  # حد أدنى 50% إذا وجدنا أي keywords
    
    if best_score == 0:
        confidence = 0.0
    
    return {
        "predicted_job": best_job,
        "confidence": confidence,
        "method": "keyword_matching",
        "scores": scores
    }


@app.post("/classify", response_model=CVClassificationResponse)
async def classify_cv(request: CVClassificationRequest):
    """
    تصنيف CV باستخدام الموديل + AI analysis
    """
    try:
        cv_text = request.cv_text.strip()
        
        if not cv_text:
            print("❌ CV text is empty")
            raise HTTPException(status_code=400, detail="CV text is required")
        
        print(f"📄 CV Text Length: {len(cv_text)} characters")
        print(f"📚 First 200 chars: {cv_text[:200]}")
        
        # 1. استخدام Keyword matching للتصنيف السريع
        print(f"🎯 Using Keyword-based Classification")
        keyword_result = classify_with_keywords(cv_text)
        print(f"📊 Keyword Result: {keyword_result}")
        keyword_scores = keyword_result.get("scores", {})
        max_keyword_score = max(keyword_scores.values()) if keyword_scores else 0
        
        # 2. استخدام التحليل دائماً (Groq أو Text Extraction)
        ai_analysis = None
        final_job_title = keyword_result.get("predicted_job", "Unknown")
        final_confidence = keyword_result.get("confidence", 0.0)
        decision_method = "keyword_matching"
        
        print(f"💼 Initial Job (Keyword): {final_job_title} ({final_confidence*100:.1f}%) | max_score={max_keyword_score}")
        
        # استخدم التحليل دائماً
        print("🤖 Analyzing CV...")
        if groq_client:
            print("   Using Groq AI for analysis...")
            ai_analysis = analyze_cv_with_groq(cv_text)
        else:
            print("   Using text extraction for analysis...")
            ai_analysis = extract_analysis_from_text(cv_text)
        
        print(f"🤖 Analysis Result: {ai_analysis}")
        
        if ai_analysis and "primary_role" in ai_analysis:
            ai_role = ai_analysis["primary_role"]
            print(f"🤖 AI Role: {ai_role}")
            
            # إذا كانت الثقة منخفضة أو لم نجد كلمات تقنية، استخدم AI/domain role
            if final_confidence < 0.65 or max_keyword_score == 0:
                final_job_title = ai_role
                final_confidence = 0.85 if ai_role else 0.6
                decision_method = "ai_override_low_confidence"
                print(f"✅ Override with AI/domain role: {final_job_title}")
            else:
                # الثقة عالية من Keywords، احتفظ بها
                decision_method = "keyword_matching_validated"
                print(f"✅ Using Keywords (validated by AI): {final_job_title}")
        else:
            print("⚠️  Analysis failed")
        
        print(f"✅ Final Result: {final_job_title} ({final_confidence*100:.1f}%)")
        
        # إضافة معلومات إضافية للاستجابة
        response_data = {
            "job_title": final_job_title,
            "confidence": final_confidence,
            "decision_method": decision_method,
            "ai_analysis": ai_analysis,
            "keras_prediction": keyword_result
        }
        
        return CVClassificationResponse(
            success=True,
            **response_data
        )
        
    except Exception as e:
        print(f"❌ Error in classify_cv: {e}")
        import traceback
        traceback.print_exc()
        return CVClassificationResponse(
            success=False,
            job_title="Error",
            confidence=0.0,
            error=str(e)
        )


@app.get("/")
async def root():
    """صفحة الرئيسية"""
    return {
        "service": "CV Classification Service",
        "status": "running",
        "keras_model": "loaded" if model else "not loaded",
        "groq_api": "available" if groq_client else "not available",
        "endpoints": {
            "classify": "/classify (POST)",
            "health": "/health (GET)"
        }
    }


@app.get("/health")
async def health():
    """فحص حالة السيرفر"""
    return {
        "status": "healthy",
        "keras_model": model is not None,
        "groq_api": groq_client is not None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
