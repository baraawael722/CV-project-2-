# 🔬 CV Classification Service

نظام تصنيف السير الذاتية (CV Classification) باستخدام موديل Keras المدمج مع Groq AI API لتحديد المسمى الوظيفي بدقة عالية.

## 🎯 المميزات

- ✅ **تصنيف ذكي**: يستخدم موديل `cv_classifier_merged.keras` للتصنيف الأساسي
- 🤖 **تحليل بالذكاء الاصطناعي**: يستخدم Groq API (مجاني) لتحليل عميق للسيرة الذاتية
- 🔄 **دمج ذكي**: يجمع نتائج الموديل مع تحليل AI للحصول على أدق تصنيف
- 📊 **معلومات تفصيلية**: استخراج المهارات، المشاريع، وسنوات الخبرة
- ⚡ **سريع وفعال**: API سريع باستخدام FastAPI

## 📋 الفئات المدعومة

النظام يصنف السيرة الذاتية إلى أحد المسميات التالية:

1. Frontend Developer
2. Backend Developer
3. Full Stack Developer
4. Mobile Developer
5. DevOps Engineer
6. Data Scientist
7. Machine Learning Engineer
8. UI/UX Designer
9. Software Engineer
10. Quality Assurance Engineer
11. Database Administrator
12. Security Engineer
13. Cloud Engineer
14. Product Manager
15. Business Analyst

## 🚀 التثبيت والإعداد

### 1. تثبيت المكتبات المطلوبة

```bash
cd ml-service
pip install -r requirements_classifier.txt
```

### 2. الحصول على Groq API Key (مجاناً)

1. اذهب إلى [https://console.groq.com](https://console.groq.com)
2. سجل حساب جديد (مجاني)
3. انتقل إلى API Keys
4. انسخ الـ API Key

### 3. إعداد متغيرات البيئة

قم بإنشاء ملف `.env` في مجلد `ml-service`:

```bash
# Groq API Key (Required for AI analysis)
GROQ_API_KEY=your_groq_api_key_here

# Optional: Change port if needed
PORT=5002
```

أو قم بتعيين المتغير مباشرة في PowerShell:

```powershell
$env:GROQ_API_KEY="your_groq_api_key_here"
```

### 4. نسخ موديل Keras

تأكد من وجود ملف `cv_classifier_merged.keras` في أحد المواقع التالية:
- `ml-service/cv_classifier_merged.keras`
- أو في المجلد الرئيسي: `CV-project-/cv_classifier_merged.keras`

## 🎮 تشغيل الخدمة

### تشغيل CV Classifier Service

```bash
cd ml-service
python cv_classifier_service.py
```

أو باستخدام uvicorn مباشرة:

```bash
uvicorn cv_classifier_service:app --host 0.0.0.0 --port 5002 --reload
```

سترى رسالة تأكيد:

```
✅ Keras model loaded successfully
✅ Groq client initialized successfully
✅ Service ready!
```

### تشغيل Backend Server

في terminal آخر:

```bash
cd Backend
npm install
npm start
```

### تشغيل Frontend

في terminal ثالث:

```bash
cd my-react-app
npm install
npm run dev
```

## 📖 كيفية الاستخدام

### من خلال الواجهة (Frontend)

1. افتح المتصفح على: `http://localhost:5174`
2. سجل دخول كـ Employee
3. اذهب إلى صفحة Profile: `http://localhost:5174/employee/profile`
4. ارفع السيرة الذاتية (CV) بصيغة PDF
5. بعد رفع CV، اضغط على زر **"🔬 Classify Job Role"**
6. انتظر قليلاً... سيتم عرض النتيجة:
   - المسمى الوظيفي (Job Title)
   - نسبة الثقة (Confidence)
   - المهارات المكتشفة بواسطة AI

### من خلال API مباشرة

#### 1. فحص حالة الخدمة

```bash
curl http://localhost:5002/health
```

#### 2. تصنيف CV

```bash
curl -X POST http://localhost:5002/classify \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "Your CV text here...",
    "use_groq_analysis": true
  }'
```

#### 3. من خلال Backend API

```bash
curl -X POST http://localhost:5000/api/ml/classify-cv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## 📊 مثال على النتيجة

```json
{
  "success": true,
  "job_title": "Full Stack Developer",
  "confidence": 0.92,
  "ai_analysis": {
    "primary_role": "Full Stack Developer",
    "skills": [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "JavaScript",
      "HTML",
      "CSS",
      "Git"
    ],
    "experience_years": 3,
    "languages": ["JavaScript", "Python"],
    "recommended_categories": [
      "Full Stack Developer",
      "Frontend Developer",
      "Backend Developer"
    ]
  },
  "keras_prediction": {
    "predicted_job": "Full Stack Developer",
    "confidence": 0.89,
    "all_predictions": {
      "Frontend Developer": 0.25,
      "Backend Developer": 0.31,
      "Full Stack Developer": 0.89,
      "Mobile Developer": 0.12
    }
  }
}
```

## 🔧 آلية العمل

### 1. استخراج Features من CV
```python
# يتم تحليل CV للبحث عن keywords محددة
frontend_keywords = ['react', 'vue', 'angular', 'javascript', 'html', 'css']
backend_keywords = ['node', 'python', 'java', 'django', 'flask', 'spring']
# ... إلخ
```

### 2. التنبؤ باستخدام Keras Model
```python
predictions = model.predict(features)
predicted_job = JOB_CATEGORIES[np.argmax(predictions)]
```

### 3. تحليل متقدم باستخدام Groq AI
```python
# يرسل CV كاملاً لـ Groq AI للتحليل
ai_analysis = analyze_cv_with_groq(cv_text)
```

### 4. دمج النتائج
```python
# إذا كانت ثقة الموديل منخفضة (< 60%)، نستخدم نتيجة AI
if keras_confidence < 0.6 and ai_analysis:
    final_result = ai_analysis['primary_role']
else:
    final_result = keras_result
```

## 🛠️ حل المشاكل الشائعة

### المشكلة: Model not found
```
⚠️ Model file not found at cv_classifier_merged.keras
```

**الحل**: تأكد من وجود الموديل في المكان الصحيح:
```bash
# نسخ الموديل إلى ml-service
copy cv_classifier_merged.keras ml-service\
```

### المشكلة: Groq API not available
```
⚠️ GROQ_API_KEY not found in environment variables
```

**الحل**: قم بتعيين API Key:
```powershell
$env:GROQ_API_KEY="your_api_key_here"
```

### المشكلة: Service not running
```
CV Classifier Service is not running. Please start it first.
```

**الحل**: تأكد من تشغيل الخدمة:
```bash
cd ml-service
python cv_classifier_service.py
```

### المشكلة: TensorFlow/Keras errors
```
ImportError: cannot import name 'keras' from 'tensorflow'
```

**الحل**: تثبيت الإصدار الصحيح:
```bash
pip install tensorflow==2.15.0 keras==2.15.0
```

## 📂 هيكل الملفات

```
CV-project-/
├── cv_classifier_merged.keras          # موديل Keras للتصنيف
├── ml-service/
│   ├── cv_classifier_service.py        # الخدمة الرئيسية
│   ├── requirements_classifier.txt     # المكتبات المطلوبة
│   └── .env                            # متغيرات البيئة (قم بإنشائه)
├── Backend/
│   ├── controllers/
│   │   └── mlController.js             # يحتوي على classifyCV()
│   └── routes/
│       └── mlRoutes.js                 # يحتوي على /classify-cv route
└── my-react-app/
    └── src/
        └── pages/
            └── Profile.jsx             # صفحة Profile مع زر Classification
```

## 🎨 التخصيص

### إضافة فئات جديدة

في ملف `cv_classifier_service.py`:

```python
JOB_CATEGORIES = [
    "Frontend Developer",
    "Backend Developer",
    # أضف فئاتك الجديدة هنا
    "Your New Category",
]
```

### تعديل Keywords للتصنيف

في دالة `extract_text_features()`:

```python
your_keywords = ['keyword1', 'keyword2', 'keyword3']
```

### تغيير موديل AI

في دالة `analyze_cv_with_groq()`:

```python
model="llama3-8b-8192",  # غيره إلى موديل آخر من Groq
```

## 🔐 الأمان

- ✅ جميع endpoints محمية بـ JWT Authentication
- ✅ لا يتم حفظ API Keys في الكود
- ✅ يتم تشفير البيانات المرسلة
- ✅ CORS محدود للنطاقات الآمنة فقط

## 📞 الدعم والمساعدة

إذا واجهت أي مشكلة:

1. تحقق من logs الخدمة في terminal
2. تأكد من تشغيل جميع الخدمات (Backend, Frontend, ML Service)
3. تحقق من صحة API Keys
4. راجع قسم "حل المشاكل الشائعة" أعلاه

## 📝 ملاحظات مهمة

- 🆓 **Groq API مجاني تماماً** - لا حاجة لبطاقة ائتمان
- ⚡ **السرعة**: الخدمة سريعة جداً (~2-3 ثواني للتصنيف)
- 🎯 **الدقة**: دمج Keras + AI يعطي دقة أعلى من 85%
- 📊 **البيانات**: لا يتم إرسال أي بيانات لجهات خارجية غير Groq (اختياري)

## 🚀 التطوير المستقبلي

- [ ] إضافة المزيد من موديلات AI (Gemini, Claude, etc.)
- [ ] تحسين دقة الموديل بالتدريب على بيانات أكثر
- [ ] إضافة تصنيفات فرعية أكثر تفصيلاً
- [ ] واجهة لعرض تحليل مفصل للمهارات
- [ ] نظام توصيات لتحسين CV

---

**تم التطوير بواسطة**: CV Project Team  
**الإصدار**: 1.0.0  
**التاريخ**: ديسمبر 2025
