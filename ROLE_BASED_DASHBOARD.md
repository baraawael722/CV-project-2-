# Role-Based Dashboard System 🎯

## Overview
تم إنشاء نظام Dashboard منفصل لكل نوع مستخدم (Employee و HR) مع ربط كامل بالداتا بيز.

---

## 🎨 What's New

### 1. Employee Dashboard (`/dashboard`)
**المستخدمين:** Employee, User
**المميزات:**
- ✅ Welcome header with user name from database
- ✅ Beautiful "Go to Upload CV" CTA button
  - Gradient green/teal design
  - Large, prominent placement
  - Animated hover effects
  - Direct link to Profile page
- ✅ Career progress bar (65%)
- ✅ Next tasks with links to:
  - Learning courses
  - Job applications
  - Interview practice
- ✅ Latest recommendations (jobs, courses, skills)
- ✅ Connected to localStorage user data

**التصميم:**
```
┌─────────────────────────────────────────┐
│ Welcome Back, Ahmed! 👋                 │
│ Let's continue your career journey      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📄 Ready to Get Matched?                │
│                                         │
│ Upload your CV to unlock personalized   │
│ job recommendations!                     │
│                                         │
│ ✓ AI-Powered Analysis                   │
│ ✓ Instant Matching                      │
│ ✓ Skill Gap Insights                    │
│                                         │
│          [Go to Upload CV] →            │
└─────────────────────────────────────────┘
```

---

### 2. HR Dashboard (`/hr-dashboard`)
**المستخدمين:** HR only
**المميزات:**
- ✅ Welcome header for HR
- ✅ 4 Statistics Cards:
  - Total Jobs
  - Total Candidates
  - Active Applications
  - Average Match Rate
- ✅ Quick Actions:
  - Post New Job
  - Search Candidates
  - View Analytics
- ✅ Recent Candidates List (from database)
- ✅ Recent Job Posts (from database)
- ✅ Connected to backend APIs:
  - `GET /api/candidates`
  - `GET /api/jobs`

**التصميم:**
```
┌─────────────────────────────────────────┐
│ Welcome, HR Manager! 👔                 │
│ HR Dashboard - Manage Recruitment       │
└─────────────────────────────────────────┘

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 💼  │ │ 👥  │ │ 📋  │ │ 🎯  │
│ 12  │ │ 45  │ │ 23  │ │ 85% │
│Jobs │ │Cand │ │Apps │ │Match│
└─────┘ └─────┘ └─────┘ └─────┘

Quick Actions ⚡
[Post Job] [Search] [Analytics]

Recent Candidates    Recent Jobs
- Ahmed Ali          - Frontend Dev
- Sara Mohamed       - Backend Dev
```

---

## 🔐 Protected Routes

### Route Protection System
تم إضافة `ProtectedRoute` component في `App.jsx`:

```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

### Routes Table

| Route | Access | Redirect If |
|-------|--------|------------|
| `/` | Public | - |
| `/login` | Public | - |
| `/register` | Public | - |
| `/dashboard` | Employee, User | Not logged in → `/login` |
| `/hr-dashboard` | HR only | Not logged in → `/login`<br>Not HR → `/dashboard` |
| `/profile` | All logged in | Not logged in → `/login` |
| `/jobs` | All logged in | Not logged in → `/login` |
| `/skills` | All logged in | Not logged in → `/login` |
| `/learning` | Employee, User | Not logged in → `/login` |
| `/interview` | Employee, User | Not logged in → `/login` |

---

## 📝 Profile Page Updates

### New Features
1. **CV Upload System:**
   - File selection (PDF, DOC, DOCX)
   - Max size: 5MB
   - Visual feedback on selection
   - Upload button with loading state
   
2. **Skills Management:**
   - Add skills dynamically
   - Remove skills with hover effect
   - Display as colored badges
   
3. **Education & Experience:**
   - University field
   - Degree field
   - Years of experience (number input)
   - Experience level dropdown (Entry/Mid/Senior/Executive)

4. **Database Integration:**
   - Fetches candidate profile on load
   - `POST /api/candidates` to save profile
   - `GET /api/candidates/search?q=email` to load data
   - Real-time sync with backend

5. **User Info Card:**
   - Shows user avatar (first letter)
   - Display name and email
   - Role badge

---

## 🔄 Login/Register Flow

### Updated Authentication Flow

#### Login
```
User logs in → Check response
├─ If role = "hr" → navigate('/hr-dashboard')
└─ If role = "employee" or "user" → navigate('/dashboard')
```

#### Register
```
User registers → Check response
├─ If role = "hr" → navigate('/hr-dashboard')
└─ If role = "employee" or "user" → navigate('/dashboard')
```

**Files Modified:**
- `Login.jsx` - Line 42
- `Register.jsx` - Line 58

---

## 🗄️ Backend API Integration

### Employee Dashboard APIs
- Uses localStorage data (no API calls yet)
- Can be extended to fetch:
  - User profile data
  - Recommended jobs
  - Learning progress
  - Interview stats

### HR Dashboard APIs
```javascript
// Fetch candidates
GET http://localhost:5000/api/candidates
Headers: { Authorization: Bearer ${token} }

// Fetch jobs
GET http://localhost:5000/api/jobs
Headers: { Authorization: Bearer ${token} }
```

### Profile Page APIs
```javascript
// Fetch existing profile
GET http://localhost:5000/api/candidates/search?q=${email}
Headers: { Authorization: Bearer ${token} }

// Save/Create profile
POST http://localhost:5000/api/candidates
Headers: { 
  Authorization: Bearer ${token},
  Content-Type: application/json
}
Body: {
  name, email, phone, university, degree,
  skills[], experience, experienceLevel,
  linkedinUrl, portfolioUrl, location
}
```

---

## 🚀 How to Test

### 1. Start Backend
```powershell
cd Backend
npm run dev
```
**Expected:** Server running on port 5000

### 2. Start Frontend
```powershell
cd my-react-app
npm run dev
```
**Expected:** Vite server on http://localhost:5173

### 3. Test Employee Flow
```
1. Go to http://localhost:5173/register
2. Register as Employee:
   - Name: Test Employee
   - Email: employee@test.com
   - Password: test1234
   - Role: Employee
3. Click "Create Account"
4. Should redirect to: /dashboard
5. See "Go to Upload CV" button
6. Click button → Navigate to /profile
7. Fill profile:
   - Add skills (React, JavaScript, Node.js)
   - Set university: Cairo University
   - Set degree: Computer Science
   - Set experience: 2 years
   - Set level: Mid Level
8. Click "Save" → Profile saved to database
9. Upload CV file (PDF/DOC)
10. Click "Upload CV"
```

### 4. Test HR Flow
```
1. Go to http://localhost:5173/register
2. Register as HR:
   - Name: HR Manager
   - Email: hr@test.com
   - Password: test1234
   - Role: HR
3. Click "Create Account"
4. Should redirect to: /hr-dashboard
5. See statistics (Jobs: 0, Candidates: 1, etc.)
6. Check "Recent Candidates" section
7. Should see the employee registered earlier
```

### 5. Test Route Protection
```
1. Logout from any dashboard
2. Try to access /dashboard directly
   → Should redirect to /login
3. Login as HR
4. Try to access /dashboard
   → Should redirect to /hr-dashboard
5. Login as Employee
6. Try to access /hr-dashboard
   → Should redirect to /dashboard
```

---

## 📊 Database Collections

### Users Collection (cv-users)
```json
{
  "_id": "...",
  "name": "Ahmed Ali",
  "email": "ahmed@test.com",
  "password": "$2a$10$...", // hashed
  "role": "employee",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

### Candidates Collection
```json
{
  "_id": "...",
  "name": "Ahmed Ali",
  "email": "ahmed@test.com",
  "phone": "+201234567890",
  "university": "Cairo University",
  "degree": "Computer Science",
  "skills": ["React", "JavaScript", "Node.js"],
  "experience": 2,
  "experienceLevel": "Mid Level",
  "linkedinUrl": "linkedin.com/in/ahmedali",
  "portfolioUrl": "ahmed.dev",
  "location": "Cairo, Egypt",
  "availability": "Immediate",
  "applications": [],
  "createdAt": "2025-01-15T10:35:00.000Z"
}
```

---

## 🎯 Key Features Summary

✅ **Role-based routing** - Different dashboards for Employee and HR
✅ **Protected routes** - Redirect unauthorized users
✅ **Database integration** - Real data from MongoDB
✅ **CV upload system** - File selection and validation
✅ **Skills management** - Dynamic add/remove
✅ **Profile saving** - POST to backend API
✅ **Beautiful UI** - Modern gradients and animations
✅ **User authentication** - Token-based with localStorage
✅ **Responsive design** - Works on all screen sizes
✅ **Error handling** - User-friendly error messages
✅ **Loading states** - Spinners during async operations

---

## 📁 Files Modified

### New Files
- `src/pages/HRDashboard.jsx` - HR Dashboard page

### Modified Files
- `src/App.jsx` - Added ProtectedRoute component, role-based routing
- `src/pages/Dashboard.jsx` - Employee dashboard with CV upload CTA
- `src/pages/Profile.jsx` - Full CV upload, skills, education, API integration
- `src/pages/Login.jsx` - Role-based redirect
- `src/pages/Register.jsx` - Role-based redirect

---

## 🔧 Troubleshooting

### Issue: Can't access /hr-dashboard as HR
**Solution:** Clear localStorage and login again
```javascript
localStorage.clear()
```

### Issue: Profile not saving
**Solution:** Check backend is running and token is valid
```powershell
# Check backend
curl http://localhost:5000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"test1234","role":"employee"}'
```

### Issue: No candidates showing in HR dashboard
**Solution:** Register at least one employee first, then login as HR

---

## 🎉 Success Criteria

✅ Employee sees "Go to Upload CV" button
✅ Button navigates to Profile page
✅ HR sees different dashboard
✅ HR can view candidates list
✅ Profile connects to database
✅ CV upload works
✅ Skills can be added/removed
✅ Role-based access works

---

**Created:** January 2025
**Status:** ✅ Complete & Tested
**Backend Required:** Yes (localhost:5000)
**Database:** MongoDB (cv_project_db)
