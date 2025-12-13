# 🤖 TensorFlow Skill Analyzer - Integration Guide

## ✨ Overview

تم ربط نموذج TensorFlow للتحليل الذكي للمهارات الناقصة في CV مقارنة بمتطلبات الوظيفة.

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 5174)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js Backend│ (Port 5000)
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ TensorFlow Skill Analyzer│ (Port 5003)
│  - LSTM Neural Network   │
│  - Tokenizer             │
│  - Skills Database       │
└──────────────────────────┘
```

## 📁 Files Created

1. **`ml-service/skill_analyzer_service.py`**
   - Flask API server للتحليل
   - يستخدم TensorFlow LSTM model
   - يستخدم نفس المودل من `test_model.py`

2. **`start_skill_analyzer.ps1`**
   - سكريبت لتشغيل الخدمة
   - يفحص الملفات المطلوبة
   - ينصب المكتبات اللازمة

3. **Updated `Backend/controllers/mlController.js`**
   - تم تعديل `analyzeJobForUser` function
   - يتصل بـ TensorFlow service
   - يعطي fallback للطريقة القديمة

4. **Updated `start_all_services.ps1`**
   - يشمل الآن Skill Analyzer Service

## 🚀 How to Start

### Method 1: Start All Services (Recommended)

```powershell
.\start_all_services.ps1
```

هيبدأ كل الخدمات:
- ✅ Frontend (React)
- ✅ Backend (Node.js)
- ✅ CV Classifier
- ✅ **Skill Analyzer (NEW!)**

### Method 2: Start Skill Analyzer Only

```powershell
.\start_skill_analyzer.ps1
```

## 📋 Required Files

يجب وجود الملفات التالية في مجلد `last-one/`:

- ✅ `tokenizer.pkl` - Tokenizer المدرب
- ✅ `skills_list.json` - قائمة المهارات
- ✅ `cv_job_matcher_model.h5` - أوزان المودل

## 🔗 API Endpoints

### 1. Health Check
```bash
GET http://localhost:5003/health
```

Response:
```json
{
  "success": true,
  "message": "Skill Analyzer Service is running",
  "model_loaded": true,
  "skills_count": 150
}
```

### 2. Analyze CV vs Job
```bash
POST http://localhost:5003/analyze
Content-Type: application/json

{
  "cv_text": "Your CV text here...",
  "job_desc": "Job description here..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "cv_skills": ["Python", "Django", "PostgreSQL"],
    "job_skills": ["Python", "Django", "React", "AWS"],
    "matched_skills": ["Python", "Django"],
    "missing_skills": [
      {
        "skill": "React",
        "confidence": 0.85,
        "priority": "HIGH",
        "youtube": "https://www.youtube.com/results?search_query=React+tutorial"
      },
      {
        "skill": "AWS",
        "confidence": 0.72,
        "priority": "HIGH",
        "youtube": "https://www.youtube.com/results?search_query=AWS+tutorial"
      }
    ],
    "match_percentage": 50.0
  }
}
```

## 🌐 Frontend Integration

في صفحة Job Details (`/employee/jobs/:id`):

```javascript
// موجود بالفعل في JobDetails.jsx
const handleAnalyzeSkills = async () => {
  const analysisRes = await fetch(
    `http://localhost:5000/api/ml/analyze-job/${jobId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  const data = await analysisRes.json();
  setSkillAnalysis(data.data);
};
```

## 📊 How It Works

1. **User clicks "Analyze Skills"** في صفحة الوظيفة
2. **Frontend** يرسل طلب لـ Backend
3. **Backend** يجيب:
   - CV text من database
   - Job description من database
4. **Backend** يرسل للـ **TensorFlow Service**
5. **TensorFlow Service**:
   - يستخرج المهارات من النصوص
   - يستخدم LSTM neural network للتنبؤ
   - يحسب الـ confidence لكل مهارة
   - يرجع المهارات الناقصة مع priorities
6. **Frontend** يعرض النتائج مع:
   - Match percentage
   - Matched skills
   - Missing skills مع YouTube links

## 🎯 Priority Levels

- **🔴 HIGH**: Confidence >= 70%
- **🟡 MEDIUM**: Confidence >= 40%
- **🟢 LOW**: Confidence < 40%

## 🔧 Configuration

في `.env` file (Backend):

```bash
SKILL_ANALYZER_URL=http://127.0.0.1:5003
```

## 🐛 Troubleshooting

### Service not starting?

```powershell
# Check if port 5003 is available
netstat -ano | findstr :5003

# Check if TensorFlow is installed
python -c "import tensorflow; print(tensorflow.__version__)"
```

### Model files missing?

```powershell
# Verify files exist
ls last-one/tokenizer.pkl
ls last-one/skills_list.json
ls last-one/cv_job_matcher_model.h5
```

### Frontend not showing analysis?

1. افتح DevTools (F12)
2. شوف Console للـ errors
3. تأكد إن كل الخدمات شغالة
4. جرب الـ API endpoint مباشرة

## 📝 Example Usage

1. **Upload CV** في Profile page
2. **Browse Jobs** في Jobs page
3. **Click on any job** للتفاصيل
4. **Click "Analyze Skills"** button
5. **View Results**:
   - Match percentage
   - Matched skills (green badges)
   - Missing skills (red badges)
   - Learn links لكل مهارة

## 🎓 Learn More

- Model Architecture: Check `test_model.py`
- Training: Check `last-one/quick_train.py`
- Dataset: Check `last-one/dataa.csv`

## ⚡ Performance

- **Model Load Time**: ~3-5 seconds
- **Analysis Time**: ~1-2 seconds
- **Accuracy**: Based on trained model performance

---

Made with ❤️ using TensorFlow & Flask
