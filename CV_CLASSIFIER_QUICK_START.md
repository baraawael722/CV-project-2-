# 🚀 Quick Start Guide - CV Classification

## الإعداد السريع (5 دقائق)

### 1. احصل على Groq API Key (مجاناً)

```
🌐 اذهب إلى: https://console.groq.com
📝 سجل حساب جديد (مجاني)
🔑 انسخ API Key من لوحة التحكم
```

### 2. أعد ملف البيئة

```powershell
# في مجلد CV-project-
cd ml-service
copy .env.example .env

# افتح .env وضع API Key:
# GROQ_API_KEY=your_actual_api_key_here
```

### 3. ثبت المكتبات

```powershell
# في مجلد CV-project-
cd ml-service
pip install -r requirements_classifier.txt
```

### 4. شغّل الخدمة

```powershell
# الطريقة الأسهل - استخدم السكريبت الجاهز
.\start_classifier.ps1

# أو يدوياً:
cd ml-service
python cv_classifier_service.py
```

### 5. شغّل Backend

```powershell
# في terminal جديد
cd Backend
npm install
npm start
```

### 6. شغّل Frontend

```powershell
# في terminal ثالث
cd my-react-app
npm install
npm run dev
```

## ✅ اختبر النظام

1. افتح المتصفح: `http://localhost:5174`
2. سجل دخول كـ Employee
3. اذهب إلى Profile: `http://localhost:5174/employee/profile`
4. ارفع CV (PDF)
5. اضغط **"🔬 Classify Job Role"**
6. شاهد النتيجة! 🎉

## 🔍 التحقق من التشغيل

```powershell
# تحقق من CV Classifier Service
curl http://localhost:5002/health

# تحقق من Backend
curl http://localhost:5000/api/health

# تحقق من Frontend
# افتح المتصفح على: http://localhost:5174
```

## 🐛 حل المشاكل السريع

### المشكلة: Service not running
```powershell
# تأكد من تشغيل Python service
cd ml-service
python cv_classifier_service.py
```

### المشكلة: Groq API error
```powershell
# تحقق من API Key
$env:GROQ_API_KEY="your_api_key"
```

### المشكلة: Model not found
```powershell
# تأكد من وجود الموديل
dir cv_classifier_merged.keras
# أو في مجلد ml-service
dir ml-service\cv_classifier_merged.keras
```

## 📝 الأوامر المفيدة

```powershell
# تشغيل كل الخدمات في terminals منفصلة:

# Terminal 1 - CV Classifier
cd ml-service; python cv_classifier_service.py

# Terminal 2 - Backend
cd Backend; npm start

# Terminal 3 - Frontend
cd my-react-app; npm run dev
```

## 🎯 المنافذ (Ports)

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:5000`
- CV Classifier: `http://localhost:5002`
- ML Matcher: `http://localhost:5001` (إذا كان مفعّل)

---

**للتفاصيل الكاملة**: راجع [CV_CLASSIFIER_README.md](./CV_CLASSIFIER_README.md)
