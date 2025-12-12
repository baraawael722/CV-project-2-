# 🎯 نظام تصنيف السير الذاتية - دليل الاستخدام الكامل

تم إضافة نظام تصنيف ذكي للسير الذاتية يجمع بين:
- ✅ موديل Keras المخصص (`cv_classifier_merged.keras`)
- ✅ Groq AI API (مجاني) للتحليل المتقدم
- ✅ استراتيجية دمج ذكية للحصول على أفضل نتيجة

---

## 📁 الملفات المضافة/المعدلة

### ملفات جديدة:
1. **ml-service/cv_classifier_service.py** - الخدمة الرئيسية للتصنيف
2. **ml-service/requirements_classifier.txt** - المكتبات المطلوبة
3. **ml-service/test_classifier.py** - سكريبت اختبار
4. **ml-service/.env.example** - مثال لملف البيئة
5. **start_classifier.ps1** - سكريبت تشغيل تلقائي
6. **CV_CLASSIFIER_README.md** - التوثيق الكامل
7. **CV_CLASSIFIER_QUICK_START.md** - دليل البدء السريع
8. **CV_CLASSIFIER_USAGE.md** - هذا الملف

### ملفات معدّلة:
1. **Backend/controllers/mlController.js** - إضافة `classifyCV()` function
2. **Backend/routes/mlRoutes.js** - إضافة `/classify-cv` route
3. **Backend/models/Candidate.js** - إضافة حقل `jobTitle`
4. **my-react-app/src/pages/Profile.jsx** - إضافة زر وواجهة Classification

---

## 🚀 طريقة التشغيل

### الخطوة 1: إعداد Groq API (مرة واحدة فقط)

```powershell
# 1. احصل على API Key من: https://console.groq.com
# 2. أنشئ ملف .env في مجلد ml-service
cd ml-service
copy .env.example .env

# 3. افتح .env وضع API Key:
# GROQ_API_KEY=your_actual_groq_api_key_here
```

### الخطوة 2: تثبيت المكتبات (مرة واحدة)

```powershell
cd ml-service
pip install -r requirements_classifier.txt
```

### الخطوة 3: تشغيل الخدمات (في كل مرة)

**Terminal 1 - CV Classifier Service:**
```powershell
# استخدم السكريبت الجاهز (أسهل طريقة)
.\start_classifier.ps1

# أو يدوياً:
cd ml-service
python cv_classifier_service.py
```

**Terminal 2 - Backend:**
```powershell
cd Backend
npm start
```

**Terminal 3 - Frontend:**
```powershell
cd my-react-app
npm run dev
```

---

## 💡 كيفية الاستخدام

### من خلال الواجهة (الطريقة الموصى بها):

1. **افتح المتصفح**: `http://localhost:5174`

2. **سجل دخول** كـ Employee

3. **اذهب إلى Profile**: `http://localhost:5174/employee/profile`

4. **ارفع CV** (PDF format):
   - اضغط على منطقة "Upload Your CV"
   - اختر ملف PDF
   - اضغط "Upload CV"
   - انتظر التأكيد

5. **صنّف الوظيفة**:
   - بعد رفع CV، سيظهر زر **"🔬 Classify Job Role"**
   - اضغط على الزر
   - انتظر 3-5 ثواني
   - سترى النتيجة:
     - **Job Title**: المسمى الوظيفي المحدد
     - **Confidence**: نسبة الثقة في التصنيف
     - **AI Detected Skills**: المهارات المكتشفة

6. **النتيجة**:
   - سيتم حفظ Job Title في بروفايلك
   - يمكنك رؤية تفاصيل إضافية في النتيجة

---

## 🔍 فهم النتائج

### مستويات الثقة (Confidence):

- **90-100%**: تصنيف دقيق جداً ✅
- **75-90%**: تصنيف موثوق ✅
- **60-75%**: تصنيف جيد ⚠️
- **أقل من 60%**: قد تحتاج مراجعة يدوية ⚠️

### استراتيجيات القرار (Decision Methods):

1. **keras_high_confidence**: الموديل واثق جداً (>75%)
2. **keras_ai_agreement**: الموديل و AI متفقان
3. **ai_override_medium**: AI override لأن الموديل متوسط الثقة
4. **ai_override_low_confidence**: AI override لأن الموديل ضعيف
5. **keras_only**: اعتماد على الموديل فقط (بدون AI)

---

## 🧪 الاختبار

### اختبار سريع للخدمة:

```powershell
cd ml-service
python test_classifier.py
```

سيقوم السكريبت بـ:
- ✅ فحص اتصال الخدمة
- ✅ اختبار التصنيف مع AI
- ✅ اختبار التصنيف بدون AI
- ✅ عرض النتائج

### اختبار عبر API مباشرة:

```powershell
# فحص الصحة
curl http://localhost:5002/health

# تصنيف CV
curl -X POST http://localhost:5002/classify `
  -H "Content-Type: application/json" `
  -d '{"cv_text": "Your CV text here...", "use_groq_analysis": true}'
```

---

## 📊 الفئات المدعومة

النظام يصنف إلى 15 فئة:

1. **Frontend Developer** - React, Vue, Angular, HTML/CSS
2. **Backend Developer** - Node.js, Python, Java, APIs
3. **Full Stack Developer** - MERN, MEAN, Full Stack
4. **Mobile Developer** - Android, iOS, React Native, Flutter
5. **DevOps Engineer** - Docker, Kubernetes, AWS, CI/CD
6. **Data Scientist** - Python, ML, Pandas, Statistics
7. **Machine Learning Engineer** - TensorFlow, PyTorch, AI
8. **UI/UX Designer** - Figma, Sketch, Design
9. **Software Engineer** - General programming
10. **Quality Assurance Engineer** - Testing, Selenium, QA
11. **Database Administrator** - SQL, MongoDB, DB management
12. **Security Engineer** - Cybersecurity, Ethical Hacking
13. **Cloud Engineer** - AWS, Azure, GCP
14. **Product Manager** - Product management, Strategy
15. **Business Analyst** - Analysis, Requirements

---

## 🛠️ حل المشاكل

### المشكلة 1: "Service not running"

**الحل:**
```powershell
# تأكد من تشغيل CV Classifier Service
cd ml-service
python cv_classifier_service.py

# تحقق من الاتصال
curl http://localhost:5002/health
```

### المشكلة 2: "Model not found"

**الحل:**
```powershell
# تحقق من وجود الموديل
dir cv_classifier_merged.keras

# إذا لم يكن موجوداً، انقله:
# يجب أن يكون في المجلد الرئيسي أو في ml-service
```

### المشكلة 3: "Groq API error"

**الحل:**
```powershell
# تحقق من API Key
cd ml-service
type .env

# أو عيّنه مباشرة:
$env:GROQ_API_KEY="your_api_key_here"
python cv_classifier_service.py
```

### المشكلة 4: "No CV found"

**الحل:**
```
تأكد من:
1. رفع CV أولاً من صفحة Profile
2. انتظار التأكيد "CV uploaded successfully"
3. ثم اضغط على زر Classify
```

### المشكلة 5: "Low confidence"

**التفسير:**
- إذا كانت الثقة منخفضة (<60%)، قد يكون:
  1. CV غير واضح أو مختصر جداً
  2. مزيج من عدة مجالات
  3. لا يوجد keywords كافية

**الحل:**
- راجع النتيجة يدوياً
- الـ AI analysis سيعطيك معلومات إضافية
- يمكنك تحديث CV ليكون أكثر وضوحاً

---

## 🔒 الأمان والخصوصية

- ✅ جميع الطلبات محمية بـ JWT Authentication
- ✅ لا يتم حفظ CV في خدمة التصنيف
- ✅ Groq API لا يحفظ البيانات (حسب سياستهم)
- ✅ التصنيف يتم في الوقت الفعلي بدون تخزين

---

## 📈 تحسين الدقة

### نصائح للحصول على تصنيف أفضل:

1. **CV واضح ومنظم**: استخدم sections واضحة (Skills, Experience, etc.)
2. **Keywords مناسبة**: اذكر التقنيات والأدوات بوضوح
3. **تفاصيل كافية**: وضّح خبراتك ومشاريعك
4. **لغة احترافية**: استخدم مصطلحات تقنية صحيحة
5. **طول مناسب**: لا تكون مختصراً جداً أو طويلاً جداً

---

## 🎨 التخصيص

### إضافة فئات جديدة:

في `ml-service/cv_classifier_service.py`:

```python
JOB_CATEGORIES = [
    # ... الفئات الموجودة
    "Your New Category",  # أضف هنا
]
```

### تعديل Keywords:

في دالة `extract_text_features()`:

```python
your_new_keywords = ['keyword1', 'keyword2', 'keyword3']
```

### تغيير موديل AI:

في دالة `analyze_cv_with_groq()`:

```python
model="llama3-70b-8192",  # موديل أكبر وأدق
# أو
model="mixtral-8x7b-32768",  # موديل بديل
```

---

## 📚 المراجع

- **Groq Documentation**: https://console.groq.com/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **TensorFlow/Keras**: https://www.tensorflow.org
- **CV Project GitHub**: [رابط المشروع]

---

## 🤝 المساهمة والدعم

إذا واجهت أي مشكلة:

1. راجع قسم "حل المشاكل" أعلاه
2. تحقق من logs في terminal الخدمة
3. استخدم `test_classifier.py` للاختبار
4. راجع التوثيق الكامل في `CV_CLASSIFIER_README.md`

---

## 🎉 خلاصة

الآن لديك نظام تصنيف ذكي يجمع بين:
- **Keras Model** للتصنيف الأساسي السريع
- **Groq AI** للتحليل العميق والدقيق
- **استراتيجية دمج ذكية** لأفضل النتائج

**استمتع باستخدام النظام!** 🚀

---

**نصيحة نهائية**: 
احتفظ بـ API Key آمناً، ولا تشاركه مع أحد. 
Groq API مجاني لكن له حدود استخدام، فاستخدمه بحكمة! 😊
