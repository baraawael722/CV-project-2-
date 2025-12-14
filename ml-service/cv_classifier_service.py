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
    تصنيف بناءً على الكلمات المفتاحية - محسّن جداً
    """
    text_lower = cv_text.lower()
    
    # قواعد التصنيف مع أوزان - Backend له أولوية
    rules = {
        # Backend Developer - الأولوية الأعلى
        "Backend Developer Job": {
            "primary": ["backend developer", "backend engineer", "server developer", "api developer"],
            "secondary": ["rest api", "api", "database", "server", "node.js", "express", "mongodb", "postgresql", "mysql"],
            "weight": 3
        },
        # Software Developer - عام
        "Software Developer Job": {
            "primary": ["software developer", "software engineer", "full stack developer"],
            "secondary": ["programming", "coding", "development", "software development", "web development"],
            "weight": 2.5
        },
        # Python Developer
        "Python Developer Job": {
            "primary": ["python developer", "python engineer", "django developer", "flask developer"],
            "secondary": ["python", "django", "flask", "fastapi", "pandas"],
            "weight": 2
        },
        # Java Developer
        "Java Developer Job": {
            "primary": ["java developer", "java engineer", "java programmer"],
            "secondary": ["java", "spring boot", "spring", "hibernate", "maven"],
            "weight": 2
        },
        # AI/ML - فقط لو واضح جداً
        "INFORMATION-TECHNOLOGY": {
            "primary": ["ai engineer", "ml engineer", "machine learning engineer", "data scientist"],
            "secondary": ["tensorflow", "pytorch", "keras", "model training", "deep learning project"],
            "weight": 1.5
        },
        "Web Developer Job": {
            "primary": ["web developer", "frontend developer", "front end developer"],
            "secondary": ["html", "css", "javascript", "react", "vue", "angular", "typescript"],
            "weight": 2
        },
        "Software Developer Job": {
            "primary": ["software developer", "software engineer", "full stack"],
            "secondary": ["programming", "coding", "software development"],
            "weight": 1.5
        },
        "Database Administrator Job": {
            "primary": ["database administrator", "dba", "database admin"],
            "secondary": ["database management", "sql server", "oracle dba"],
            "weight": 3  # يحتاج مطابقة قوية
        },
        "Systems Administrator Job": {
            "primary": ["system administrator", "sysadmin", "systems admin"],
            "secondary": ["linux", "unix", "server management", "infrastructure"],
            "weight": 2
        },
        "Network Administrator Job": {
            "primary": ["network administrator", "network engineer"],
            "secondary": ["cisco", "routing", "switching", "network"],
            "weight": 2
        },
        "Security Analyst Job": {
            "primary": ["security analyst", "cybersecurity", "security engineer"],
            "secondary": ["penetration testing", "vulnerability", "firewall"],
            "weight": 2
        },
        "ACCOUNTANT": {
            "primary": ["accountant", "accounting"],
            "secondary": ["cpa", "financial reporting", "audit", "tax preparation"],
            "weight": 2
        },
        "HR Job": {
            "primary": ["human resources", "hr manager", "hr specialist"],
            "secondary": ["recruitment", "hiring", "talent acquisition"],
            "weight": 2
        },
        "CHEF": {
            "primary": ["chef", "executive chef", "head chef"],
            "secondary": ["culinary", "kitchen", "cooking"],
            "weight": 2
        },
        "ENGINEERING": {
            "primary": ["mechanical engineer", "civil engineer", "electrical engineer"],
            "secondary": ["engineering", "cad", "design"],
            "weight": 1.5
        },
        "Sales Job": {
            "primary": ["sales manager", "sales representative"],
            "secondary": ["sales", "business development", "account manager"],
            "weight": 1.5
        },
        "Project manager Job": {
            "primary": ["project manager", "program manager"],
            "secondary": ["scrum", "agile", "pmp", "project management"],
            "weight": 2
        },
    }
    
    # حساب المطابقة
    best_match = "Software Developer Job"  # Default عام
    best_score = 0
    
    for job, config in rules.items():
        # Primary keywords تعطي 10 نقاط لكل واحدة
        primary_score = sum(10 for kw in config["primary"] if kw in text_lower)
        # Secondary keywords تعطي 2 نقطة
        secondary_score = sum(2 for kw in config["secondary"] if kw in text_lower)
        # Negative keywords تطرح 5 نقاط
        negative_score = sum(5 for kw in config.get("negative", []) if kw in text_lower)
        
        total_score = (primary_score + secondary_score - negative_score) * config["weight"]
        
        if total_score > best_score:
            best_score = total_score
            best_match = job
    
    # حساب الثقة بناءً على النقاط
    if best_score >= 50:
        confidence = 0.90
    elif best_score >= 30:
        confidence = 0.80
    elif best_score >= 15:
        confidence = 0.70
    elif best_score >= 8:
        confidence = 0.60
    else:
        confidence = 0.50
    
    print(f"   📊 Keyword scores: {best_match} = {best_score} points")
    
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
