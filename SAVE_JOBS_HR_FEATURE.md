# ✅ Save Jobs for HR and Employees Feature

## الميزة الجديدة

تم إضافة ميزة حفظ الوظائف لكل من **HR والموظفين** مع:

- زر Save في صفحة Jobs للموظفين و HR معاً
- زر Save في HR Dashboard عند عرض الوظائف الأخيرة
- حفظ الوظائف في قاعدة البيانات

## 📝 التعديلات اللي اتعملت

### 1. Backend - Models

#### User.js

أضيفنا `savedJobs` array في User model للـ HR users:

```javascript
savedJobs: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
];
```

### 2. Backend - Controllers

#### jobController.js

أضفنا دالتين جديدتين للـ HR:

**`getSavedJobsHR()`** - جلب الوظائف المحفوظة للـ HR

```javascript
export const getSavedJobsHR = async (req, res) => {
  const user = await User.findById(userId).populate("savedJobs", "...");
  return res.json({ success: true, data: user.savedJobs });
};
```

**`toggleSaveJobHR()`** - إضافة/حذف وظيفة من المحفوظات للـ HR

```javascript
export const toggleSaveJobHR = async (req, res) => {
  // نفس الفكرة مع toggleSaveJob للموظفين
  // لكن تستخدم User model بدل Candidate model
};
```

### 3. Backend - Routes

#### jobRoutes.js

أضفنا الـ routes الجديدة للـ HR:

```javascript
// Saved jobs endpoints for HR
router.get("/hr/saved-jobs", authorizeRoles("hr"), getSavedJobsHR);
router.post("/hr/saved-jobs/:jobId", authorizeRoles("hr"), toggleSaveJobHR);
```

### 4. Frontend - Pages

#### Jobs.jsx

**تم تحديث الدوال:**

1. **`fetchSavedJobs()`** - تدعم الآن كلا الدورين (HR و Employees)

   ```javascript
   if (user.role === "hr") {
     // Fetch from /api/jobs/hr/saved-jobs
   } else if (user.role === "employee") {
     // Fetch from /api/candidates/saved-jobs
   }
   ```

2. **`toggleSave()`** - تم جعلها موحدة لكلا الدورين
   ```javascript
   const endpoint =
     user?.role === "hr"
       ? `http://localhost:5000/api/jobs/hr/saved-jobs/${jobId}`
       : `http://localhost:5000/api/candidates/saved-jobs/${jobId}`;
   ```

#### HRDashboard.jsx

**أضيفنا الدوال الجديدة:**

1. **`toggleSaveJobHR()`** - لحفظ الوظائف للـ HR

   - نفس الفكرة مع toggleSave لكن تستخدم /api/jobs/hr/saved-jobs
   - تعرض toast messages للتأكيد

2. **`fetchSavedJobsHR()`** - لجلب الوظائف المحفوظة للـ HR

   - تحميل الوظائف عند تحميل الـ dashboard

3. **Added `savedJobs` state** للـ HR Dashboard

**أضيفنا زر Save في القسم الأخير:**

```jsx
<button
  onClick={() => toggleSaveJobHR(job._id || job.id)}
  className={`px-4 py-2.5 font-semibold rounded-lg transition-all shadow-sm ${
    savedJobs.includes(job._id || job.id)
      ? "bg-amber-500 text-white hover:bg-amber-600"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
  }`}
>
  {savedJobs.includes(job._id || job.id) ? "Saved" : "Save"}
</button>
```

## 🎯 كيفية الاستخدام

### للموظف (Employee):

1. اذهب لصفحة Jobs: `/employee/jobs`
2. شوف الوظائف المتاحة
3. اضغط على زرار **"Save"** للوظيفة
4. الزرار هيتحول لـ **"Saved"** بلون أصفر
5. روح على Profile لتشوف الوظائف المحفوظة

### للـ HR:

1. اذهب لصفحة Jobs: `/hr/jobs` أو الـ Dashboard
2. شوف الوظائف اللي أنت أضفتها
3. اضغط على زرار **"Save"** للوظيفة المهمة
4. الزرار هيتحول لـ **"Saved"** بلون أصفر
5. يمكنك عرض الوظائف المحفوظة بجلب data من `/api/jobs/hr/saved-jobs`

## 🔌 API Endpoints

### للموظفين (Employee):

```
POST   /api/candidates/saved-jobs/:jobId    - حفظ/إلغاء حفظ وظيفة
GET    /api/candidates/saved-jobs            - جلب الوظائف المحفوظة
```

### للـ HR:

```
POST   /api/jobs/hr/saved-jobs/:jobId       - حفظ/إلغاء حفظ وظيفة
GET    /api/jobs/hr/saved-jobs               - جلب الوظائف المحفوظة
```

## 🔐 Security

- ✅ يتطلب authentication (JWT token)
- ✅ كل user بيشوف وظائفه المحفوظة بس
- ✅ محمي بالـ `protect` و `authorizeRoles` middleware

## 🎨 UI/UX Changes

### جميع الصفحات:

- **Save Button** - يتحول من رمادي لأصفر عند الحفظ
  - رمادي: "Save" (غير محفوظة)
  - أصفر: "Saved" (محفوظة)
- Smooth transition و hover effects

### صفحات متأثرة:

1. `/employee/jobs` - صفحة Jobs للموظفين
2. `/hr/jobs` - صفحة Jobs للـ HR
3. `/hr/dashboard` - الـ HR Dashboard

## ✅ ما تم اختباره

- ✅ حفظ وظيفة للموظف
- ✅ حفظ وظيفة للـ HR
- ✅ إلغاء حفظ الوظيفة
- ✅ جلب الوظائف المحفوظة
- ✅ بقاء حالة الزر بعد التحديث (Refresh)
- ✅ Error handling

## 🚀 الخطوات التالية (Optional)

- [ ] عرض قائمة كاملة للوظائف المحفوظة للـ HR (صفحة جديدة: `/hr/saved-jobs`)
- [ ] إضافة search/filter للوظائف المحفوظة
- [ ] إضافة notifications عند الحفظ

---

**تم بنجاح! ✨**
