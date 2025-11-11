# 🔐 API Authentication Testing Guide

## ✅ Setup Complete!

Both Login and Register pages are now connected to the backend API.

## 📝 How to Test

### 1. Start Both Servers

**Frontend:**
```powershell
cd "d:\Dulms\Level3 term(1)\Project\CV project\CV-project-\my-react-app"
npm run dev
```
Access at: `http://localhost:5173`

**Backend:**
```powershell
cd "d:\Dulms\Level3 term(1)\Project\CV project\CV-project-\Backend"
npm run dev
```
Access at: `http://localhost:5000`

### 2. Test Registration

1. Go to `http://localhost:5173/register`
2. Fill in the form:
   - Full Name: Your Name
   - Email: test@example.com
   - Password: password123 (min 8 characters)
   - Confirm Password: password123
   - Role: Employee or HR
   - Check the Terms checkbox
3. Click "Create Account"
4. ✅ Success: You'll be redirected to `/dashboard` and token saved in localStorage
5. ❌ Error: Error message will appear above the form

### 3. Test Login

1. Go to `http://localhost:5173/login`
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
   - Role: Select Employee or HR
3. Click "Sign In"
4. ✅ Success: Redirected to `/dashboard` with token
5. ❌ Error: Error message displayed

## 🔑 What Happens on Success

1. **Token Saved:** JWT token stored in `localStorage.setItem('token', ...)`
2. **User Data Saved:** User info stored in `localStorage.setItem('user', ...)`
3. **Auto Redirect:** Navigate to `/dashboard` automatically

## 🛠️ Features Implemented

### Login Page (`/login`)
- ✅ Email & Password validation
- ✅ Role selection (Employee/HR)
- ✅ Show/Hide password toggle
- ✅ API call to `POST /api/auth/login`
- ✅ Error handling with user-friendly messages
- ✅ Loading state with spinner
- ✅ Token storage in localStorage
- ✅ Auto redirect on success

### Register Page (`/register`)
- ✅ Full name, email, password fields
- ✅ Password confirmation validation
- ✅ Minimum 8 characters password
- ✅ Role selection (Employee/HR)
- ✅ Terms & Conditions checkbox
- ✅ API call to `POST /api/auth/register`
- ✅ Error handling
- ✅ Loading state
- ✅ Token storage
- ✅ Auto redirect

## 🔍 View Saved Data in Browser

Open DevTools Console and run:
```javascript
// Check if user is logged in
console.log('Token:', localStorage.getItem('token'))
console.log('User:', JSON.parse(localStorage.getItem('user')))
```

## 🗄️ MongoDB Data

After registration/login, check MongoDB Compass:
1. Connect to `mongodb://localhost:27017`
2. Select database `cv_project_db`
3. View `users` collection
4. You'll see your registered user with hashed password

## 📊 API Endpoints Used

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{ name, email, password, role }` | `{ user, token }` |
| POST | `/api/auth/login` | `{ email, password, role }` | `{ user, token }` |

## 🐛 Troubleshooting

### Error: "Network error"
- ✅ Check Backend is running on port 5000
- ✅ Check MongoDB is running
- ✅ Check `.env` file exists in Backend folder

### Error: "Email already exists"
- Use a different email for registration
- Or login with existing credentials

### Password doesn't match
- Make sure Confirm Password matches Password

### Backend not connecting to MongoDB
```powershell
# Check MongoDB service
Get-Service -Name MongoDB*

# If not running, start it (requires Admin)
net start MongoDB
```

## 🎯 Next Steps

Now that authentication works, you can:
1. ✅ Protect routes (require login to access dashboard)
2. ✅ Add logout functionality
3. ✅ Fetch user-specific data
4. ✅ Connect other pages (Jobs, Candidates, etc.)

---

**🎉 Authentication is fully functional!**
