# Job Details with AI Skills Analysis Feature

## Overview / نظرة عامة

تم إضافة ميزة جديدة لعرض تفاصيل الوظيفة مع تحليل ذكي للمهارات باستخدام نموذج الـ Machine Learning الموجود في مجلد `last-one`.

This new feature allows employees to:
- View complete job details including company information
- See AI-powered skills analysis comparing their CV with the job requirements
- Get personalized recommendations for missing skills with YouTube learning links
- Apply to jobs directly from the details page

## Features / المميزات

### 1. Job Details Page / صفحة تفاصيل الوظيفة
- **Company Information**: اسم الشركة ووصفها
- **Job Description**: الوصف الكامل للوظيفة
- **Required Skills**: المهارات المطلوبة
- **Salary & Location**: الراتب والموقع
- **Job Type**: نوع الوظيفة (دوام كامل، عن بعد، إلخ)

### 2. AI Skills Analysis / تحليل المهارات بالذكاء الاصطناعي
- **Match Score**: نسبة التطابق بين الـ CV والوظيفة
- **Matched Skills**: المهارات الموجودة في الـ CV والمطابقة للوظيفة
- **Missing Skills**: المهارات الناقصة مع روابط تعليمية على YouTube

## How It Works / كيف يعمل

### Frontend Flow:
1. المستخدم يضغط على "Apply Now" أو "Details" في صفحة الوظائف
2. ينتقل إلى `/employee/jobs/:jobId`
3. يتم عرض تفاصيل الوظيفة
4. يتم استدعاء API للحصول على تحليل المهارات

### Backend Flow:
1. **Endpoint**: `GET /api/ml/analyze-job/:jobId`
2. يحصل على معلومات الوظيفة من قاعدة البيانات
3. يحصل على الـ CV الخاص بالمستخدم
4. يستدعي Python script (`easy_predict_api.py`) في مجلد `last-one`
5. النموذج يقارن الـ CV مع وصف الوظيفة
6. يرجع المهارات المطابقة والناقصة

### ML Model Integration:
- **Model Location**: `last-one/cv_job_matcher_model.h5`
- **Python Script**: `last-one/easy_predict_api.py`
- **Input**: CV text + Job description
- **Output**: Missing skills with confidence scores and YouTube links

## API Endpoints

### 1. Get Job Details
```
GET /api/jobs/:jobId
Authorization: Bearer {token}
```

### 2. Analyze Job for User
```
GET /api/ml/analyze-job/:jobId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "matchScore": 75.5,
    "matchedSkills": [
      { "skill": "Python", "confidence": "100%" },
      { "skill": "JavaScript", "confidence": "100%" }
    ],
    "missingSkills": [
      {
        "skill": "React",
        "confidence": "85.3%",
        "youtube_search": "https://www.youtube.com/results?search_query=React+tutorial",
        "youtube_direct": "https://www.youtube.com/results?search_query=learn+React"
      }
    ],
    "totalRequired": 8,
    "analysis": "Found 5 skills to improve"
  }
}
```

### 3. Apply to Job
```
POST /api/jobs/:jobId/apply
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "jobId": "...",
    "jobTitle": "Software Engineer",
    "appliedAt": "2025-12-12T..."
  }
}
```

## File Structure / هيكل الملفات

```
my-react-app/
└── src/
    ├── pages/
    │   ├── Jobs.jsx                 # صفحة الوظائف (تم التعديل)
    │   └── JobDetails.jsx           # صفحة تفاصيل الوظيفة (جديد)
    └── App.jsx                      # إضافة الروت الجديد

Backend/
├── controllers/
│   ├── mlController.js             # إضافة analyzeJobForUser
│   └── jobController.js            # إضافة applyToJob
└── routes/
    ├── mlRoutes.js                 # إضافة route التحليل
    └── jobRoutes.js                # إضافة route التطبيق

last-one/
├── cv_job_matcher_model.h5        # نموذج الـ ML
├── tokenizer.pkl                  # Tokenizer
├── skills_list.json               # قائمة المهارات
└── easy_predict_api.py            # Python script للتحليل (جديد)
```

## Usage / الاستخدام

### For Employees:
1. اذهب إلى صفحة الوظائف: `http://localhost:5174/employee/jobs`
2. اضغط على "Apply Now" أو "Details" على أي وظيفة
3. شاهد تفاصيل الوظيفة والتحليل الذكي للمهارات
4. تعلم المهارات الناقصة من خلال روابط YouTube
5. اضغط "Apply Now" للتقديم على الوظيفة

### Prerequisites / المتطلبات:
- ✅ يجب رفع الـ CV أولاً من صفحة Profile
- ✅ النموذج والملفات يجب أن تكون موجودة في مجلد `last-one`
- ✅ Python وجميع المكتبات المطلوبة مثبتة

## Model Files Required / الملفات المطلوبة للنموذج

في مجلد `last-one`:
- ✅ `cv_job_matcher_model.h5`
- ✅ `tokenizer.pkl`
- ✅ `skills_list.json`
- ✅ `easy_predict_api.py`

## Error Handling / معالجة الأخطاء

- إذا لم يكن هناك CV: "No CV found. Please upload your CV first."
- إذا كانت الوظيفة غير موجودة: "Job not found"
- إذا فشل النموذج: "Failed to analyze job"
- إذا تم التطبيق مسبقاً: "You have already applied to this job"

## Testing / الاختبار

### Test the Feature:
```bash
# 1. تأكد من تشغيل الـ backend
cd Backend
npm start

# 2. تأكد من تشغيل الـ frontend
cd my-react-app
npm run dev

# 3. افتح المتصفح
http://localhost:5174/employee/jobs

# 4. اضغط على "Apply Now" على أي وظيفة
```

### Check Python Script:
```bash
cd last-one
python easy_predict_api.py --api-mode
# يجب أن يطبع رسالة توضح أنه يجب استخدامه من Node.js
```

## Technologies Used / التقنيات المستخدمة

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Node.js, Express
- **ML Model**: TensorFlow/Keras, Python
- **Database**: MongoDB (للوظائف والـ CVs)

## Notes / ملاحظات

- النموذج يعمل في الـ background ويأخذ بضع ثوان للتحليل
- التحليل يتم في كل مرة يفتح المستخدم صفحة تفاصيل الوظيفة
- المهارات الناقصة تأتي مع روابط YouTube مباشرة للتعلم
- يمكن تحسين الأداء بإضافة caching للنتائج

## Future Improvements / تحسينات مستقبلية

- [ ] Cache analysis results لتحسين الأداء
- [ ] إضافة رسوم بيانية للمهارات
- [ ] إضافة توصيات دورات تدريبية
- [ ] إضافة مقارنة بين عدة وظائف
- [ ] حفظ التحليلات للمراجعة لاحقاً

---

**Created**: December 12, 2025
**Last Updated**: December 12, 2025
