# AI Chat Feature - Setup Guide

## 🎯 Overview

The AI Career Assistant chatbot is now integrated into the `/employee/interview` page, powered by Groq AI.

## ✅ What's New

### Backend Changes

1. **New Endpoint**: `POST /api/ml/chat`

   - Location: `Backend/controllers/mlController.js` → `chatModel` function
   - Route: `Backend/routes/mlRoutes.js`
   - Auth: Protected (requires login)

2. **API Request Format**:

```json
{
  "question": "What are my main skills?",
  "context": "Optional CV text or system prompt"
}
```

3. **API Response Format**:

```json
{
  "success": true,
  "answer": "Based on your CV, your main skills are..."
}
```

### Frontend Changes

1. **Updated Page**: `my-react-app/src/pages/Interview.jsx`
   - Added CV upload functionality (.txt files)
   - Integrated with `/api/ml/chat` endpoint
   - Auto-loads user's CV from database
   - Real-time chat with Groq AI model

## 🚀 How to Run

### 1. Configure Backend

Make sure `Backend/.env` contains:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
MONGO_URI=mongodb://localhost:27017/cv_project_db
JWT_SECRET=your-secret-key
```

> **Note**: Get your Groq API key from https://console.groq.com/keys

### 2. Start Backend Server

```powershell
cd Backend
npm install  # if not already done
npm run dev
```

Backend will run on: `http://localhost:5000`

### 3. Start Frontend

```powershell
cd my-react-app
npm install  # if not already done
npm run dev
```

Frontend will run on: `http://localhost:5174`

### 4. Access the Chat

1. Login to your account
2. Navigate to: `http://localhost:5174/employee/interview`
3. Upload your CV (.txt file) or use auto-loaded CV
4. Start chatting with the AI!

## 💡 Features

### Chat Capabilities

- ✅ Upload CV (.txt format)
- ✅ Auto-load CV from database if already uploaded
- ✅ Ask questions about your skills and experience
- ✅ Get career advice and recommendations
- ✅ Prepare for interviews
- ✅ Real-time responses from Groq AI (llama-3.3-70b-versatile)

### Sample Questions

- "What are my main technical skills?"
- "Am I qualified for a Senior Developer position?"
- "What skills should I improve?"
- "Give me interview preparation tips based on my CV"
- "What projects show my leadership experience?"

## 🔧 Technical Details

### Backend Architecture

- **Controller**: `mlController.js` → `chatModel()`
- **Route**: `/api/ml/chat` (POST, protected)
- **Auth**: Uses existing JWT middleware
- **Model**: Groq API (llama-3.3-70b-versatile)
- **Fallback**: Can proxy to `ML_HOST` if Groq key not available

### Frontend Architecture

- **Component**: `Interview.jsx`
- **State Management**: React Hooks (useState, useEffect)
- **API Client**: Axios
- **CV Loading**: Auto-loads from `/api/auth/me`
- **File Upload**: FileReader API for .txt files

## 🐛 Troubleshooting

### "Error calling model"

- Check if backend is running on port 5000
- Verify `GROQ_API_KEY` is set in `Backend/.env`
- Check browser console for detailed error

### "Not authenticated"

- Make sure you're logged in
- Check if token exists in localStorage
- Try logging out and back in

### CV not loading

- Upload CV through the app first
- Check if `resumeText` exists in your user profile
- Try uploading a .txt file manually

## 📝 Environment Variables

### Backend (.env)

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_API_URL=https://api.groq.com/v1/chat/completions  # optional
GROQ_MODEL=llama-3.3-70b-versatile  # optional
ML_HOST=http://127.0.0.1:5001  # fallback if no Groq key
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000  # optional, defaults to this
```

## 🎨 UI Features

- Modern chat interface with message bubbles
- CV upload button with status indicator
- Real-time typing indicator
- Auto-scroll to latest messages
- Responsive design
- Error handling with helpful messages

## 📚 Next Steps

- [ ] Add support for PDF and DOCX files
- [ ] Save chat history to database
- [ ] Add typing animation for AI responses
- [ ] Support voice input
- [ ] Add chat export functionality

---

**Created**: December 13, 2025
**Model**: Groq llama-3.3-70b-versatile
**Integration**: Backend + Frontend
