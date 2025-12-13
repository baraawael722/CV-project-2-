import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Interview() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm your AI Career Assistant powered by Groq AI. Upload your CV or ask me anything about your career, skills, or job preparation!",
      feedback: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cvText, setCvText] = useState("");
  const [cvUploaded, setCvUploaded] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user's CV from backend
  useEffect(() => {
    const loadUserCV = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && response.data.data.resumeText) {
          setCvText(response.data.data.resumeText);
          setCvUploaded(true);

          // Add welcome message with CV loaded
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "✅ Your CV has been loaded! I can now provide personalized career advice based on your experience and skills. What would you like to know?",
              feedback: null,
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading CV:", error);
      }
    };

    loadUserCV();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsTyping(true);

      // Read file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        setCvText(text);
        setCvUploaded(true);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `📄 CV uploaded successfully! (${file.name})\n\nI've analyzed your CV. You can now ask me questions about:\n- Your skills and experience\n- Career recommendations\n- Missing skills for specific jobs\n- Interview preparation\n\nWhat would you like to know?`,
            feedback: null,
          },
        ]);

        setIsTyping(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading CV:", error);
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      feedback: null,
    };

    setMessages([...messages, userMessage]);
    const userQuestion = input;
    setInput("");
    setIsTyping(true);

    try {
      // Prepare context with CV if available
      const context = cvText
        ? `You are a professional career assistant chatbot. The user has uploaded their CV below. Use only the CV content to answer the user's question concisely and accurately.\n\nCV Content:\n${cvText}\n\nAnswer their questions about skills, experience, career advice, or job preparation based on this CV.`
        : "You are a professional career assistant chatbot. Provide helpful career advice, interview tips, and skill development guidance.";

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/ml/chat`,
        {
          question: userQuestion,
          context: context,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const aiResponse = {
          role: "assistant",
          content: response.data.answer,
          feedback: null,
        };

        setMessages((prev) => [...prev, aiResponse]);
      } else {
        throw new Error(response.data.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        role: "assistant",
        content: `❌ Sorry, I encountered an error: ${
          error.response?.data?.message || error.message
        }\n\nPlease make sure:\n1. You are logged in\n2. The backend server is running\n3. GROQ_API_KEY is configured in .env`,
        feedback: null,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 text-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Career Assistant 🤖
          </h1>
          <p className="text-lg text-gray-600">
            Powered by Groq AI - Get personalized career advice based on your CV
          </p>
        </div>

        {/* CV Upload Section */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{cvUploaded ? "✅" : "📄"}</span>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {cvUploaded ? "CV Loaded" : "Upload Your CV"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {cvUploaded
                      ? "Your CV is loaded. Ask me anything about your career!"
                      : "Upload a .txt CV file for personalized career advice"}
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md"
              >
                {cvUploaded ? "Change CV" : "Upload CV"}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {messages.filter((m) => m.role === "user").length}
            </div>
            <div className="text-sm text-gray-600">Questions Asked</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {cvUploaded ? "✓" : "✗"}
            </div>
            <div className="text-sm text-gray-600">CV Status</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">Groq</div>
            <div className="text-sm text-gray-600">AI Model</div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {/* Messages Area */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div key={index}>
                {message.role === "assistant" ? (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      AI
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 rounded-2xl rounded-tl-none p-4 inline-block max-w-2xl">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>

                      {message.feedback && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-l-4 border-green-500">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">📊</span>
                            <h4 className="font-bold text-gray-900">
                              Your Score: {message.feedback.score}/100
                            </h4>
                          </div>

                          <div className="mb-3">
                            <h5 className="font-semibold text-green-700 mb-2">
                              ✅ Strengths:
                            </h5>
                            <ul className="list-disc list-inside space-y-1">
                              {message.feedback.strengths.map((strength, i) => (
                                <li key={i} className="text-gray-700">
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-semibold text-orange-700 mb-2">
                              💡 Areas for Improvement:
                            </h5>
                            <ul className="list-disc list-inside space-y-1">
                              {message.feedback.improvements.map(
                                (improvement, i) => (
                                  <li key={i} className="text-gray-700">
                                    {improvement}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 justify-end">
                    <div className="flex-1 flex justify-end">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 inline-block max-w-2xl">
                        <p>{message.content}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold">
                      You
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div className="bg-blue-50 rounded-2xl rounded-tl-none p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isTyping && handleSend()
                }
                placeholder={
                  cvUploaded
                    ? "Ask about your CV, skills, career advice..."
                    : "Ask me anything about career development..."
                }
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 placeholder-gray-500 bg-white"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isTyping ? "⏳" : "📤"} Send
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              💡 Tip:{" "}
              {cvUploaded
                ? "Ask specific questions about your skills, experience, or get job recommendations"
                : "Upload your CV for personalized advice"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
