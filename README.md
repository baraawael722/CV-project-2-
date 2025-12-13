# CV Project - Job Matching & CV Classification Platform

مشروع متكامل لمطابقة السير الذاتية مع الوظائف + تصنيف ذكي للسيرة الذاتية باستخدام AI

This repository combines Backend (Express + MongoDB), Frontend (React + Vite), and ML Services (Python) in a single workspace.

## ⭐ New Feature: CV Classification System

**تم إضافة نظام تصنيف ذكي للسير الذاتية!**

- 🤖 يستخدم موديل Keras + Groq AI (مجاني)
- 🎯 يصنف CV إلى 15 فئة وظيفية
- ⚡ دقة عالية بفضل دمج الموديلين
- 📊 تحليل شامل للمهارات والخبرات

**للبدء السريع**: راجع [CV_CLASSIFIER_QUICK_START.md](./CV_CLASSIFIER_QUICK_START.md)  
**للتفاصيل الكاملة**: راجع [CV_CLASSIFIER_README.md](./CV_CLASSIFIER_README.md)  
**دليل الاستخدام**: راجع [CV_CLASSIFIER_USAGE.md](./CV_CLASSIFIER_USAGE.md)

## Structure
- `Backend/` Express API server
- `my-react-app/` React SPA (Vite)
- Root `package.json` manages workspaces and shared scripts

## Development
First install all dependencies:

```powershell
npm install
```

Run both backend (port 5000) and frontend (default Vite port 5173) concurrently:

```powershell
npm run dev
```

Frontend API calls to paths starting with `/api` are proxied automatically to `http://localhost:5000`.

Run only one side:
```powershell
npm run backend:dev
npm run frontend:dev
```

## Production Build & Serve
1. Build the React app:
```powershell
npm run build
```
This creates `my-react-app/dist`.

2. Set environment to production and start the backend (which will also serve the built React files and provide a SPA fallback):
```powershell
$env:NODE_ENV = 'production'
npm start
```
Visit your backend root (`/`) or any client route; non-API paths will serve `index.html`.

## Environment Variables
Create `Backend/.env` for database and JWT secrets.
Required typical variables:
```
MONGO_URI=...
JWT_SECRET=...
PORT=5000
SKIP_AUTH=false
SKIP_AUTH_ROLE=admin
DISABLE_LOGIN=false
```

## Notes
- During development the React dev server handles the front-end; Express only provides APIs.
- In production, only the Express server needs to run after building the frontend.
- Ensure MongoDB instance is accessible via `MONGO_URI`.
- To temporarily disable authentication middleware set `SKIP_AUTH=true` (DO NOT use in production). Optionally set `SKIP_AUTH_ROLE` to emulate a role (default `admin`).
- To block new logins (while keeping existing tokens working) set `DISABLE_LOGIN=true`. Returns 503 for `/api/auth/login`. Use only briefly during maintenance.

## Common Scripts
- `npm run dev` Concurrent dev (backend + frontend)
- `npm run build` Build frontend
- `npm start` Start backend (serves API + static build in production)

## Troubleshooting
If `npm run dev` fails immediately:
1. Confirm you executed `npm install` in repo root.
2. Delete root `node_modules` and run again if workspace links broke.
3. Check `Backend/.env` exists.

If static files not served in production, verify `NODE_ENV` is `production` and `my-react-app/dist` exists.
