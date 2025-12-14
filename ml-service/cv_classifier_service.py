"""
CV Classification Service - CORRECT VERSION
يستخدم موديل mlp_cv_model_improved.keras مع TF-IDF vectorizer
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import joblib
import os
import re
import sys
from typing import Optional
import json

# Ensure UTF-8 stdout to avoid Windows encoding errors with logs
sys.stdout.reconfigure(encoding="utf-8")

app = FastAPI(title="CV Classification Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# المسارات
MODEL_PATH = "../cv_classifier_merged.keras"
VECTORIZER_PATH = "../vectorizer_merged.pkl"
LABEL_ENCODER_PATH = "../label_encoder_merged.pkl"

# المتغيرات العامة
model = None
vectorizer = None
label_encoder = None


class CVClassificationRequest(BaseModel):
    cv_text: str
    use_groq_analysis: bool = False  # لن نستخدمه حالياً


class CVClassificationResponse(BaseModel):
    success: bool
    job_title: str
    confidence: float
    confidence_status: str
    top_3_predictions: Optional[list] = None
    error: Optional[str] = None


def clean_text(text: str) -> str:
    """تنظيف النص بنفس طريقة التدريب"""
    if not text or text.strip() == "":
        return ""
    
    text = str(text).lower()
    # إزالة الرموز الخاصة، بقاء المسافات والأحرف والأرقام
    text = re.sub(r'[^a-z\s]', ' ', text)
    # إزالة المسافات الزائدة
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def load_model():
    """تحميل الموديل والـ vectorizer والـ label encoder"""
    global model, vectorizer, label_encoder
    
    try:
        print("=" * 80)
        print("🚀 Loading CV Classification Model...")
        print("=" * 80)
        
        # تحميل الـ vectorizer
        if os.path.exists(VECTORIZER_PATH):
            vectorizer = joblib.load(VECTORIZER_PATH)
            print(f"✅ Vectorizer loaded: {len(vectorizer.vocabulary_)} features")
        else:
            print(f"❌ Vectorizer not found at {VECTORIZER_PATH}")
            return False
        
        # تحميل الـ label encoder
        if os.path.exists(LABEL_ENCODER_PATH):
            label_encoder = joblib.load(LABEL_ENCODER_PATH)
            print(f"✅ Label Encoder loaded: {len(label_encoder.classes_)} classes")
            print(f"   Classes: {list(label_encoder.classes_)}")
        else:
            print(f"❌ Label Encoder not found at {LABEL_ENCODER_PATH}")
            return False
        
        # تحميل الموديل
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"✅ Model loaded successfully")
            print(f"   Input shape: {model.input_shape}")
            print(f"   Output shape: {model.output_shape}")
        else:
            print(f"❌ Model not found at {MODEL_PATH}")
            return False
        
        print("=" * 80)
        print("✅ All components loaded successfully!")
        print("=" * 80)
        return True
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return False


@app.on_event("startup")
async def startup_event():
    """تشغيل عند بدء السيرفر"""
    success = load_model()
    if not success:
        print("⚠️ Warning: Model loading failed. Service may not work properly.")


@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "running",
        "service": "CV Classification",
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None,
        "label_encoder_loaded": label_encoder is not None
    }


def keyword_based_classification(cv_text: str) -> tuple:
    """
    تصنيف دقيق جداً - الأولوية للـ Design والتخصصات الواضحة
    """
    text_lower = cv_text.lower()
    
    # قواعد التصنيف - الأولوية للوظائف المحددة
    rules = {
        # === DESIGN JOBS - أولوية عالية جداً ===
        "Graphic Designer Job": {
            "primary": ["graphic design", "graphic designer", "visual design", "visual designer", "design portfolio"],
            "secondary": ["photoshop", "illustrator", "indesign", "adobe creative", "logo design", "branding", "corel", "visual identity", "typography", "color theory"],
            "negative": ["backend developer", "software engineer", "programmer", "java developer", "architect", "architectural", "building design", "construction", "civil engineer", "structural"],
            "weight": 12
        },
        "Web Designer Job": {
            "primary": ["web design", "web designer", "ui design", "ux design", "ui ux", "product design", "interface design"],
            "secondary": ["figma", "adobe xd", "sketch", "wireframe", "mockup", "prototype", "user experience"],
            "negative": ["backend", "server", "database", "api developer", "java"],
            "weight": 12
        },
        
        # === DEVELOPER JOBS ===
        "Python Developer Job": {
            "primary": ["python developer", "python programmer", "python engineer"],
            "secondary": ["python", "django", "flask", "fastapi", "pandas", "numpy"],
            "negative": ["graphic design", "web design"],
            "weight": 5
        },
        "Java Developer Job": {
            "primary": ["java developer", "java programmer", "java engineer"],
            "secondary": ["java", "spring boot", "spring", "hibernate", "maven"],
            "negative": ["graphic design", "web design"],
            "weight": 5
        },
        "Frontend Developer Job": {
            "primary": ["frontend developer", "front end developer", "react developer", "web frontend"],
            "secondary": ["react", "vue", "angular", "html", "css", "dom", "javascript", "typescript"],
            "negative": ["graphic design", "visual design", "mobile application", "mobile app", "android", "ios", "react native", "flutter", "teacher", "educator"],
            "weight": 7
        },
        "Backend Developer Job": {
            "primary": ["backend developer", "backend engineer", "server developer"],
            "secondary": ["rest api", "node.js", "express", "mongodb", "postgresql"],
            "negative": ["graphic design", "web design", "ui ux"],
            "weight": 5
        },
        "Web Developer Job": {
            "primary": ["web developer", "full stack developer", "fullstack"],
            "secondary": ["html", "css", "javascript", "php", "web application"],
            "negative": ["graphic design only"],
            "weight": 4
        },
        "Mobile Developer Job": {
            "primary": ["mobile developer", "mobile application developer", "android developer", "ios developer", "mobile app developer"],
            "secondary": ["android", "ios", "flutter", "react native", "kotlin", "swift", "mobile app", "mobile application", "cross-platform", "testflight", "play console"],
            "negative": ["graphic design", "web developer only"],
            "weight": 8
        },
        "Software Developer Job": {
            "primary": ["software developer", "software engineer"],
            "secondary": ["programming", "coding", "software development"],
            "negative": [],
            "weight": 2
        },
        
        # === IT ADMIN ===
        "Database Administrator Job": {
            "primary": ["database administrator", "dba", "database manager"],
            "secondary": ["sql server", "oracle", "mysql", "database"],
            "negative": ["web designer", "graphic designer", "teacher", "educator"],
            "weight": 6
        },
        "Systems Administrator Job": {
            "primary": ["system administrator", "sysadmin", "systems engineer"],
            "secondary": ["linux", "unix", "windows server", "vmware"],
            "negative": ["designer"],
            "weight": 6
        },
        "Network Administrator Job": {
            "primary": ["network administrator", "network engineer"],
            "secondary": ["cisco", "routing", "switching", "ccna"],
            "negative": ["designer"],
            "weight": 6
        },
        "Security Analyst Job": {
            "primary": ["security analyst", "cybersecurity", "security engineer", "information security"],
            "secondary": ["penetration testing", "vulnerability", "firewall", "security audit"],
            "negative": ["designer"],
            "weight": 6
        },
        "INFORMATION-TECHNOLOGY": {
            "primary": ["machine learning", "artificial intelligence", "data scientist", "ml engineer"],
            "secondary": ["tensorflow", "pytorch", "keras", "deep learning", "neural network"],
            "negative": ["graphic design"],
            "weight": 5
        },
        
        # === DATA & BUSINESS ===
        "Data Analysis Job": {
            "primary": ["data analyst", "business intelligence", "data analytics"],
            "secondary": ["excel", "power bi", "tableau", "sql", "data visualization"],
            "negative": ["software developer"],
            "weight": 6
        },
        "Project manager Job": {
            "primary": ["project manager", "program manager", "project management"],
            "secondary": ["pmp", "scrum", "agile", "jira", "project planning"],
            "negative": ["graphic design", "graphic designer", "web design", "web designer", "visual design", "photoshop", "illustrator", "logo design"],
            "weight": 6
        },
        "Business Development Job": {
            "primary": ["business development", "bd manager", "sales manager"],
            "secondary": ["b2b", "client acquisition", "sales strategy", "crm"],
            "negative": ["technical"],
            "weight": 5
        },
        "Sales Job": {
            "primary": ["sales representative", "sales executive", "account manager"],
            "secondary": ["sales", "customer service", "sales target", "negotiation"],
            "negative": ["technical"],
            "weight": 5
        },
        
        # === EDUCATION & HR ===
        "Teacher Job": {
            "primary": ["teacher", "educator", "instructor", "professor", "lecturer"],
            "secondary": ["teaching", "education", "classroom", "curriculum", "lesson planning", "student", "school", "university", "college"],
            "negative": ["software developer", "database", "programmer", "engineer", "frontend", "backend", "react", "vue", "angular", "javascript", "python", "java", "html", "css", "web developer"],
            "weight": 8
        },
        "HR Job": {
            "primary": ["human resources", "hr manager", "hr specialist", "recruiter"],
            "secondary": ["recruitment", "hiring", "talent acquisition", "employee relations"],
            "negative": ["technical"],
            "weight": 6
        },
        "Accountant Job": {
            "primary": ["accountant", "accounting specialist", "accounts executive"],
            "secondary": ["accounting", "bookkeeping", "financial statements", "tally", "quickbooks"],
            "negative": ["software"],
            "weight": 6
        },
        "ACCOUNTANT": {
            "primary": ["chartered accountant", "cpa", "senior accountant"],
            "secondary": ["audit", "taxation", "financial reporting", "gaap"],
            "negative": ["software"],
            "weight": 5
        },
        "FINANCE": {
            "primary": ["financial analyst", "finance manager", "investment analyst"],
            "secondary": ["financial modeling", "investment", "portfolio", "valuation"],
            "negative": ["software"],
            "weight": 5
        },
        
        # === CREATIVE & SPECIALIZED ===
        "Floral Designer": {
            "primary": ["floral designer", "florist", "flower designer"],
            "secondary": ["floral", "arrangements", "flowers", "bouquet", "wedding flowers", "floristry", "flower shop"],
            "negative": ["software", "developer", "engineer"],
            "weight": 10  # وزن عالي جداً للتصميم
        },
        "Arts Job": {
            "primary": ["artist", "fine artist", "art director", "creative director"],
            "secondary": ["art", "creative", "drawing", "painting", "illustration", "sculpture"],
            "negative": ["software", "developer", "engineer"],
            "weight": 8
        },
        "Chef Job": {
            "primary": ["chef", "head chef", "executive chef", "cook", "culinary"],
            "secondary": ["kitchen", "cooking", "food preparation", "restaurant", "catering"],
            "negative": ["software", "developer"],
            "weight": 7
        },
        "CHEF": {
            "primary": ["sous chef", "pastry chef", "chef de cuisine"],
            "secondary": ["baking", "pastry", "culinary arts", "hospitality"],
            "negative": ["software"],
            "weight": 6
        },
        "Advocate Job": {
            "primary": ["lawyer", "attorney", "advocate", "legal counsel"],
            "secondary": ["legal", "litigation", "law", "court", "legal advice"],
            "negative": ["software", "developer"],
            "weight": 7
        },
        "Architect Job": {
            "primary": ["architect", "architectural engineer", "architecture", "architectural designer"],
            "secondary": ["architectural design", "building design", "revit", "autocad", "3ds max", "sketchup", "architectural plans", "blueprints", "construction drawings"],
            "negative": ["graphic designer", "web designer", "software"],
            "weight": 9
        },
        "ENGINEERING": {
            "primary": ["mechanical engineer", "civil engineer", "electrical engineer", "structural engineer"],
            "secondary": ["autocad", "cad", "construction", "engineering design", "site engineer"],
            "negative": ["software engineer", "web developer", "graphic design"],
            "weight": 6
        },
        "BUSINESS-DEVELOPMENT": {
            "primary": ["business analyst", "strategy consultant", "management consultant"],
            "secondary": ["business analysis", "strategy", "consulting", "market research"],
            "negative": ["software"],
            "weight": 5
        },
    }
    
    # حساب المطابقة - نظام دقيق
    job_scores = {}
    
    for job, config in rules.items():
        # Primary keywords - وزن كبير جداً
        primary_matches = [kw for kw in config["primary"] if kw in text_lower]
        primary_score = len(primary_matches) * 30
        
        # Secondary keywords - وزن أعلى للـ Design jobs
        secondary_matches = [kw for kw in config["secondary"] if kw in text_lower]
        # إذا كانت Design job، كل secondary keyword = 10 نقاط
        if "Designer" in job or "Design" in job:
            secondary_score = len(secondary_matches) * 10
        else:
            secondary_score = len(secondary_matches) * 5
        
        # Negative keywords - عقوبة قوية
        negative_matches = [kw for kw in config.get("negative", []) if kw in text_lower]
        negative_penalty = len(negative_matches) * 50  # عقوبة كبيرة جداً
        
        # الحساب النهائي
        base_score = primary_score + secondary_score - negative_penalty
        total_score = base_score * config["weight"] if base_score > 0 else 0
        
        if total_score > 0:
            job_scores[job] = {
                "score": total_score,
                "primary": len(primary_matches),
                "secondary": len(secondary_matches),
                "negative": len(negative_matches),
                "keywords": primary_matches + secondary_matches
            }
    
    # اختر أعلى نتيجة
    if job_scores:
        best_match = max(job_scores, key=lambda x: job_scores[x]["score"])
        best_data = job_scores[best_match]
        best_score = best_data["score"]
        
        # عرض Top 3
        top_jobs = sorted(job_scores.items(), key=lambda x: x[1]["score"], reverse=True)[:3]
        print(f"   🏆 Top 3 Jobs:")
        for i, (job, data) in enumerate(top_jobs, 1):
            print(f"      {i}. {job}: {data['score']:.0f} pts (P:{data['primary']}, S:{data['secondary']}, N:{data['negative']})")
            if data['keywords']:
                print(f"         Found: {', '.join(data['keywords'][:5])}")
    else:
        best_match = "Software Developer Job"
        best_score = 10
        print(f"   ⚠️  No keyword matches found")
    
    # حساب الثقة
    if best_score >= 200:
        confidence = 0.95
    elif best_score >= 100:
        confidence = 0.88
    elif best_score >= 50:
        confidence = 0.78
    else:
        confidence = 0.65
    
    print(f"   ✅ FINAL: {best_match} ({confidence:.0%} confidence, {best_score:.0f} points)")
    
    return best_match, confidence


@app.post("/classify", response_model=CVClassificationResponse)
async def classify_cv(request: CVClassificationRequest):
    """
    تصنيف السيرة الذاتية باستخدام الموديل + keyword fallback
    """
    try:
        # التحقق من تحميل الموديل
        if model is None or vectorizer is None or label_encoder is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # تنظيف النص
        cv_text = request.cv_text
        if not cv_text or cv_text.strip() == "":
            raise HTTPException(status_code=400, detail="CV text is empty")
        
        cleaned_text = clean_text(cv_text)
        
        print("=" * 80)
        print(f"📄 CV Length: {len(cv_text)} chars")
        print("=" * 80)
        
        # تحويل النص إلى features باستخدام الـ vectorizer
        X_new = vectorizer.transform([cleaned_text]).toarray()
        print(f"📝 Cleaned text: {len(cleaned_text)} chars")
        print(f"📊 Vector shape: {X_new.shape}")
        
        # التنبؤ
        predictions = model.predict(X_new, verbose=0)
        predicted_probs = predictions[0]
        
        # الحصول على أعلى 3 تنبؤات
        top_3_indices = np.argsort(predicted_probs)[-3:][::-1]
        top_3_predictions = []
        
        for idx in top_3_indices:
            job_class = label_encoder.inverse_transform([idx])[0]
            confidence = float(predicted_probs[idx])
            top_3_predictions.append({
                "job_title": job_class,
                "confidence": confidence
            })
        
        # أفضل تنبؤ من الموديل
        model_prediction = top_3_predictions[0]
        model_job_title = model_prediction["job_title"]
        model_confidence = model_prediction["confidence"]
        
        # ✅ جرب keyword matching أولاً
        keyword_job, keyword_conf = keyword_based_classification(cv_text)
        
        print(f"🤖 Model: {model_job_title} ({model_confidence:.2%})")
        print(f"🔑 Keyword: {keyword_job} ({keyword_conf:.2%})")
        
        # ✅ اختر الأفضل بناءً على الثقة
        # استخدم keyword matching إذا:
        # 1. الموديل يعطي "Other" أو ثقة منخفضة جداً (< 50%)
        # 2. keyword matching يعطي ثقة أعلى من الموديل
        
        if model_job_title == "Other" or model_confidence < 0.5:
            # الموديل ضعيف، استخدم keywords
            job_title = keyword_job
            confidence = keyword_conf
            print(f"✅ Using KEYWORD classification (model weak)")
        elif keyword_conf > model_confidence + 0.1:
            # keyword أفضل بكثير
            job_title = keyword_job
            confidence = keyword_conf
            print(f"✅ Using KEYWORD classification (higher confidence)")
        else:
            # الموديل معقول، استخدمه
            job_title = model_job_title
            confidence = model_confidence
            print(f"✅ Using MODEL classification")
        
        # تحديد حالة الثقة
        if confidence >= 0.7:
            confidence_status = "High Confidence"
        elif confidence >= 0.5:
            confidence_status = "Medium Confidence"
        else:
            confidence_status = "Low Confidence"
        
        print(f"✅ Final Prediction: {job_title}")
        print(f"📊 Confidence: {confidence:.2%}")
        print(f"📈 Top 3: {[p['job_title'] for p in top_3_predictions]}")
        print("=" * 80)
        
        return CVClassificationResponse(
            success=True,
            job_title=job_title,
            confidence=confidence,
            confidence_status=confidence_status,
            top_3_predictions=top_3_predictions,
            error=None
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
            confidence_status="",
            error=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting CV Classification Service on port 5002...")
    print("✅ Using MYYYYY model with TF-IDF vectorizer")
    print("📊 26 job categories supported")
    uvicorn.run(app, host="0.0.0.0", port=5002)
