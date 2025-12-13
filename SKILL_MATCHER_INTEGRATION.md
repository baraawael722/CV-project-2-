# Skill Matcher Integration Guide

## Overview

تم ربط نموذج TensorFlow الموجود في مجلد `last-one` مع صفحة تحليل الوظائف.

## ما تم إنجازه

### 1. إنشاء Skill Matcher API

- **الملف**: `last-one/skill_matcher_api.py`
- **المنفذ**: `http://127.0.0.1:5004`
- **الوظيفة**: تحليل المهارات الناقصة بين CV والوظيفة باستخدام نموذج TensorFlow المدرب

### 2. تعديل Backend Controller

- **الملف**: `Backend/controllers/mlController.js`
- **الوظيفة**: `analyzeJobForUser`
- **التغيير**: استخدام `SKILL_MATCHER_URL` بدلاً من `SKILL_ANALYZER_URL`

### 3. إضافة متغير البيئة

- **الملف**: `Backend/.env`
- **المتغير**: `SKILL_MATCHER_URL=http://127.0.0.1:5004`

## كيفية التشغيل

### 1. تشغيل Skill Matcher API

```powershell
.\start_skill_matcher.ps1
```

أو يدوياً:

```powershell
cd last-one
python skill_matcher_api.py
```

### 2. تشغيل Backend

```powershell
cd Backend
npm run dev
```

### 3. تشغيل Frontend

```powershell
cd my-react-app
npm run dev
```

## كيفية الاستخدام

1. افتح الرابط: `http://localhost:5174/employee/jobs/{jobId}`
2. اضغط على زر **"Analyze Match & Skills"** (الزر الأخضر)
3. سيتم تحليل:
   - المهارات الموجودة في Job Description
   - المهارات الموجودة في CV الخاص بك
   - المهارات الناقصة
   - نسبة التطابق
   - روابط YouTube لتعلم كل مهارة ناقصة

## ما يقوم به النموذج

### الخطوات:

1. يستخرج المهارات من Job Description
2. يستخرج المهارات من CV الخاص بك
3. يستخدم نموذج TensorFlow للتنبؤ بالمهارات الناقصة
4. يحسب نسبة التطابق
5. يضيف روابط YouTube لكل مهارة ناقصة

### مثال على النتيجة:

```json
{
  "success": true,
  "data": {
    "matchPercentage": 75.5,
    "matchedSkills": ["Python", "Django", "PostgreSQL"],
    "missingSkills": [
      {
        "skill": "React",
        "confidence": 0.85,
        "priority": "HIGH",
        "youtube": "https://www.youtube.com/results?search_query=React%20tutorial"
      },
      {
        "skill": "Node.js",
        "confidence": 0.75,
        "priority": "HIGH",
        "youtube": "https://www.youtube.com/results?search_query=Node.js%20tutorial"
      }
    ],
    "totalJobSkills": 10,
    "totalCvSkills": 15
  }
}
```

## الأولويات (Priority)

- **HIGH** 🔴: مهارة مهمة جداً (confidence >= 70%)
- **MEDIUM** 🟡: مهارة متوسطة الأهمية (confidence >= 40%)
- **LOW** 🟢: مهارة أقل أهمية (confidence < 40%)

## النموذج المستخدم

- **المجلد**: `last-one/`
- **الموديل**: `cv_job_matcher_model.h5`
- **Tokenizer**: `tokenizer.pkl`
- **Skills**: `skills_list.json` (100 مهارة)

## ملاحظات مهمة

- تأكد من تشغيل Skill Matcher API قبل استخدام ميزة التحليل
- النموذج يحتاج إلى TensorFlow و Keras
- يتم تحميل النموذج عند بداية التشغيل (قد يستغرق 10-15 ثانية)

## استكشاف الأخطاء

### خطأ: "Failed to connect to Skill Matcher"

**الحل**: تأكد من تشغيل API على المنفذ 5004

```powershell
cd last-one
python skill_matcher_api.py
```

### خطأ: "Model not loaded"

**الحل**: تأكد من وجود الملفات:

- `cv_job_matcher_model.h5`
- `tokenizer.pkl`
- `skills_list.json`

### خطأ: "No CV found"

**الحل**: ارفع CV من صفحة Profile أولاً

## API Endpoints

### Health Check

```
GET http://127.0.0.1:5004/health
```

### Analyze Skills

```
POST http://127.0.0.1:5004/analyze
Content-Type: application/json

{
  "cv_text": "Your CV content...",
  "job_desc": "Job description..."
}
```

## التطوير المستقبلي

- [ ] إضافة المزيد من المهارات إلى `skills_list.json`
- [ ] تحسين دقة النموذج بتدريبه على بيانات أكثر
- [ ] إضافة ميزة البحث في منصات التعلم الأخرى (Udemy, Coursera)
- [ ] عرض مسار التعلم الموصى به للمهارات الناقصة
