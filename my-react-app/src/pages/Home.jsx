import React, { useState, useEffect, useRef } from 'react'
import homeImage from '../assets/home.png'
import LogoLoop from '../components/LogoLoop'
import { useScrollReveal } from '../hooks/useScrollReveal.jsx'
import TextType from '../components/TextType'
import Footer from '../components/Footer'

// Partner/Company logos data with SVG icons (brand colors, no background)
const partnerLogos = [
  { 
    src: "https://cdn.simpleicons.org/apple/000000",
    alt: "Apple",
    title: "Apple",
    width: 120,
    height: 48
  },
  { 
    src: "https://cdn.simpleicons.org/netflix/E50914",
    alt: "Netflix",
    title: "Netflix",
    width: 120,
    height: 48
  },
  { 
    src: "https://cdn.simpleicons.org/tesla/CC0000",
    alt: "Tesla",
    title: "Tesla",
    width: 120,
    height: 48
  },
  { 
    // Use Clearbit to get Google's full-colour logo on transparent background
    src: "https://logo.clearbit.com/google.com",
    alt: "Google",
    title: "Google",
    width: 120,
    height: 48
  },
  { 
    // Use Clearbit for Microsoft's full-colour logo (transparent background)
    src: "https://logo.clearbit.com/microsoft.com",
    alt: "Microsoft",
    title: "Microsoft",
    width: 120,
    height: 48
  },
  { 
    src: "https://cdn.simpleicons.org/github/181717",
    alt: "GitHub",
    title: "GitHub",
    width: 120,
    height: 48
  },
  { 
    // React with a slightly darker blue
    src: "https://cdn.simpleicons.org/react/1D4ED8",
    alt: "React",
    title: "React",
    width: 120,
    height: 48
  },
  { 
    src: "https://cdn.simpleicons.org/nextdotjs/000000",
    alt: "Next.js",
    title: "Next.js",
    width: 120,
    height: 48
  },
];

const Home = () => {
  const [activeModal, setActiveModal] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef(null)
  
  // Enable premium scroll-reveal animations
  useScrollReveal()

  const openModal = (modalType) => {
    // If a close timeout is pending, clear it
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsClosing(false)
    setActiveModal(modalType)
  }

  const closeWithAnimation = () => {
    // trigger closing animation, then unmount
    setIsClosing(true)
    closeTimeoutRef.current = setTimeout(() => {
      setActiveModal(null)
      setIsClosing(false)
      closeTimeoutRef.current = null
    }, 360) // match CSS animation durations (slightly longer than zoom)
  }



  return (
    <>
      {/* Modal Overlay */}
      {activeModal && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
          onClick={closeWithAnimation}
        >
          <div 
            className={`relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden card-hover-smooth ${isClosing ? 'animate-zoomOut' : 'animate-zoomIn'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeWithAnimation}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content - Upload & Analyze */}
            {activeModal === 'upload' && (
              <div>
                <div className="relative h-80 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573496130407-57329f01f769?w=1400&h=800&fit=crop&q=80"
                    alt="Man in an interview" 
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Upload & Analyze</h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Our advanced NLP system analyzes your CV in seconds. Upload your resume or manually input your skills, and our AI will extract key information about your experience, education, technical skills, and soft skills. The system understands context and identifies your strengths to create a comprehensive professional profile.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="font-semibold text-blue-900 mb-1">Smart Parsing</div>
                      <div className="text-sm text-blue-700">Extract skills automatically</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="font-semibold text-blue-900 mb-1">Quick Analysis</div>
                      <div className="text-sm text-blue-700">Results in seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Content - Match & Identify Gaps */}
            {activeModal === 'match' && (
              <div>
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop" 
                    alt="Team collaboration and matching" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Match & Identify Gaps</h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Get matched with jobs that fit your current skillset perfectly. Our intelligent matching algorithm compares your profile with thousands of job postings to find the best opportunities. We also clearly show you the skill gap between your current abilities and your dream job requirements, giving you a clear roadmap for growth.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="font-semibold text-purple-900 mb-1">Smart Matching</div>
                      <div className="text-sm text-purple-700">AI-powered job finder</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="font-semibold text-purple-900 mb-1">Gap Analysis</div>
                      <div className="text-sm text-purple-700">Know what to learn next</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Content - Learn & Grow */}
            {activeModal === 'learn' && (
              <div>
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop" 
                    alt="Students learning together" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Learn & Grow</h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Receive a personalized learning path tailored specifically to your needs. We curate the best online courses, tutorials, and resources from top platforms to help you fill your skill gaps. Track your progress, earn certificates, and watch as you become job-ready for your target position.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="font-semibold text-green-900 mb-1">Custom Path</div>
                      <div className="text-sm text-green-700">Tailored to your goals</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="font-semibold text-green-900 mb-1">Top Resources</div>
                      <div className="text-sm text-green-700">Curated courses & guides</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    {/* Main Content Wrapper - Single Container */}
    <div className="relative w-full min-h-screen" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 20%, #60a5fa 40%, #93c5fd 60%, #bfdbfe 80%, #dbeafe 100%)' }}>
      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center px-4 pt-24">
        <div className="grid md:grid-cols-2 items-center gap-8 md:gap-16 max-w-7xl mx-auto">
          {/* Left Side: Text Content */}
          <div className="order-1 md:order-1 reveal" data-delay="1">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tighter">
              <TextType
                text={["The Ultimate CV", "Analysis & Job", "Matching Tool"]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="|"
                className="block text-white"
              />
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl">
              Upload your CV and let our AI analyze your skills, experience, and qualifications to match you with the perfect job opportunities.
            </p>
            <div className="flex items-center gap-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Get Started
              </button>
              <button className="bg-transparent hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-full transition duration-300 border-2 border-white/50">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Side: Illustrated Hero */}
          <div className="order-2 md:order-2 reveal" data-delay="2">
            <div className="relative w-full h-[500px] md:h-[650px] flex items-center justify-center">
              
              {/* Floating Card: Top Companies */}
              <div className="absolute top-8 left-4 md:left-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 animate-float" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">100K+</div>
                    <div className="text-sm text-gray-600">New Jobs</div>
                  </div>
                </div>
              </div>

              {/* Floating Card: Message from Google HR */}
              <div className="absolute top-16 right-4 md:right-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Message from</div>
                    <div className="text-base font-bold text-gray-900">Google HR</div>
                  </div>
                </div>
              </div>

              {/* Floating Card: Easy Apply Process */}
              <div className="absolute bottom-20 right-8 md:right-16 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900">Easy Apply</div>
                    <div className="text-sm text-gray-600">Process</div>
                  </div>
                </div>
              </div>

              {/* Floating Card: Resume/Document */}
              <div className="absolute bottom-12 left-8 md:left-16 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3 animate-float" style={{ animationDelay: '0.7s' }}>
                <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                  <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/>
                </svg>
              </div>

              {/* Central Phone with Checkmark */}
              <div className="relative z-10">
                {/* Phone mockup */}
                <div className="relative w-48 h-96 bg-gray-900 rounded-[2.5rem] shadow-2xl border-8 border-gray-800 overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>
                  
                  {/* Screen */}
                  <div className="absolute inset-2 bg-gradient-to-br from-green-400 to-green-600 rounded-[1.8rem] flex items-center justify-center">
                    {/* Checkmark */}
                    <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-xl animate-pulse">
                      <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="absolute bottom-8 text-white font-bold text-lg">Offer Received!</div>
                  </div>
                </div>

                {/* Person silhouette holding phone - simplified */}
                <div className="absolute -bottom-4 -left-8 w-64 h-32">
                  <svg viewBox="0 0 200 100" className="w-full h-full opacity-40">
                    {/* Arm/hand suggestion */}
                    <path d="M 10 80 Q 50 60, 90 50 L 110 70 Q 70 80, 30 95 Z" fill="#1e40af" opacity="0.3"/>
                  </svg>
                </div>
              </div>

              {/* Small floating project logos (replaced placeholders) */}
              <div className="absolute top-24 right-20 animate-float" style={{ animationDelay: '0.3s' }}>
                <div className="w-14 h-14 bg-white/90 rounded-full shadow-lg flex items-center justify-center">
                  <img
                    src="https://cdn.simpleicons.org/github/181717"
                    alt="GitHub"
                    className="w-9 h-9 object-contain"
                  />
                </div>
              </div>

              <div className="absolute top-32 left-24 animate-float" style={{ animationDelay: '1.2s' }}>
                <div className="w-14 h-14 bg-white/90 rounded-full shadow-lg flex items-center justify-center">
                  <img
                    src="https://logo.clearbit.com/figma.com"
                    alt="Figma"
                    className="w-9 h-9 object-contain"
                  />
                </div>
              </div>

              {/* Added third floating logo to represent AI/project tooling */}
              <div className="absolute top-12 right-8 md:right-28 animate-float" style={{ animationDelay: '0.6s' }}>
                <div className="w-14 h-14 bg-white/90 rounded-full shadow-lg flex items-center justify-center">
                  <img
                    src="https://cdn.simpleicons.org/openai/000000"
                    alt="OpenAI"
                    className="w-9 h-9 object-contain"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Trusted Partners / Tech Stack Section */}
      <div className="relative z-10 py-16 px-4 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 reveal">
              Trusted by Leading Companies
            </h3>
            <p className="text-white/80 reveal" data-delay="1">
              Join thousands of professionals finding their dream jobs
            </p>
          </div>
          
          {/* Logo Loop */}
          <div className="reveal" data-delay="2">
            <LogoLoop
              logos={partnerLogos}
              speed={180}
              direction="left"
              logoHeight={56}
              gap={48}
              pauseOnHover
              scaleOnHover
              fadeOut
              fadeOutColor="transparent"
              ariaLabel="Trusted partners and companies"
              className="py-4"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 reveal">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto reveal" data-delay="1">
              Our AI-powered platform helps you bridge the gap between your skills and your dream job
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1: Upload CV & Analyze Skills */}
            <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg reveal-gentle card-hover-smooth" data-delay="1">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Upload & Analyze
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload your CV or input your skills. Our NLP-powered system analyzes your strengths and experience to understand your professional profile.
                </p>
              </div>
              <button 
                onClick={() => openModal('upload')}
                className="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all duration-300 cursor-pointer hover:text-blue-700"
              >
                <span>Learn more</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Card 2: Job Matching & Skill Gap */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg reveal-gentle card-hover-smooth" data-delay="2">
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Match & Identify Gaps
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get matched with suitable jobs based on your skills. See exactly what skills you're missing and what the market demands right now.
                </p>
              </div>
              <button 
                onClick={() => openModal('match')}
                className="mt-6 flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all duration-300 cursor-pointer hover:text-purple-700"
              >
                <span>Learn more</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Card 3: Learning Path & Courses */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg reveal-gentle card-hover-smooth" data-delay="3">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Learn & Grow
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive a personalized learning path with curated courses tailored to fill your skill gaps and prepare you for your target role.
                </p>
              </div>
              <button 
                onClick={() => openModal('learn')}
                className="mt-6 flex items-center text-green-600 font-semibold group-hover:gap-2 transition-all duration-300 cursor-pointer hover:text-green-700"
              >
                <span>Learn more</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Latest Job Offers Section */}
      <div className="relative z-10 py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 reveal">
              Latest Jobs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto reveal" data-delay="1">
              Explore the latest opportunities from top global companies
            </p>
          </div>

          {/* Job Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Job Card 1: Google */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden reveal-gentle card-hover-smooth" data-delay="1">
              <div className="p-6">
                {/* Company Logo & Header */}
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://logo.clearbit.com/google.com" 
                    alt="Google" 
                    className="w-12 h-12 object-contain"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Senior Software Engineer</h3>
                    <p className="text-sm text-gray-600">Google • Mountain View, CA</p>
                  </div>
                </div>

                {/* Job Description */}
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Join Google's core engineering team to build scalable distributed systems that impact billions of users worldwide.
                </p>

                {/* Requirements */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Python</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Go</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Kubernetes</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">5+ years</span>
                  </div>
                </div>

                {/* Salary & Apply Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">$180K - $250K</span>
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 shadow-md hover:shadow-lg">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Job Card 2: Meta */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden reveal-gentle card-hover-smooth" data-delay="2">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://cdn.simpleicons.org/meta/0081FB" 
                    alt="Meta" 
                    className="w-12 h-12"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Product Designer</h3>
                    <p className="text-sm text-gray-600">Meta • Menlo Park, CA</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Design innovative user experiences for Meta's family of apps reaching billions globally. Shape the future of social connection.
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Figma</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">UI/UX</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Prototyping</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">4+ years</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">$150K - $200K</span>
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 shadow-md hover:shadow-lg">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Job Card 3: Apple */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden reveal-gentle card-hover-smooth" data-delay="3">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://cdn.simpleicons.org/apple/000000" 
                    alt="Apple" 
                    className="w-12 h-12"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">iOS Developer</h3>
                    <p className="text-sm text-gray-600">Apple • Cupertino, CA</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Build innovative iOS applications that delight millions of Apple users. Work with cutting-edge SwiftUI and Apple frameworks.
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Swift</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">SwiftUI</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">UIKit</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">3+ years</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">$160K - $220K</span>
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 shadow-md hover:shadow-lg">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Job Card 4: Microsoft */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden reveal-gentle card-hover-smooth" data-delay="1">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://logo.clearbit.com/microsoft.com" 
                    alt="Microsoft" 
                    className="w-12 h-12"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Cloud Solutions Architect</h3>
                    <p className="text-sm text-gray-600">Microsoft • Redmond, WA</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Design and implement enterprise cloud solutions on Azure. Help organizations transform their infrastructure.
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Azure</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">DevOps</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Docker</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">5+ years</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">$170K - $230K</span>
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 shadow-md hover:shadow-lg">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Job Card 5: Netflix */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden reveal-gentle card-hover-smooth" data-delay="2">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://cdn.simpleicons.org/netflix/E50914" 
                    alt="Netflix" 
                    className="w-12 h-12"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Data Scientist</h3>
                    <p className="text-sm text-gray-600">Netflix • Los Gatos, CA</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Use machine learning to personalize content recommendations and optimize the streaming experience for 200M+ subscribers.
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Python</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">ML</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">TensorFlow</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">PhD/MS</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">$200K - $280K</span>
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 shadow-md hover:shadow-lg">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Job Card 6: Tesla */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden reveal-gentle card-hover-smooth" data-delay="3">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://cdn.simpleicons.org/tesla/CC0000" 
                    alt="Tesla" 
                    className="w-12 h-12"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Autopilot Engineer</h3>
                    <p className="text-sm text-gray-600">Tesla • Palo Alto, CA</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Develop next-generation autonomous driving systems. Work on computer vision and deep learning for Tesla's Full Self-Driving.
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">C++</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">PyTorch</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Computer Vision</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">MS/PhD</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">$190K - $260K</span>
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 shadow-md hover:shadow-lg">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* View All Jobs Button */}
          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              View All Jobs →
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials Section - User Reviews */}
      <div className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 reveal">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto reveal" data-delay="1">
              Real stories from professionals who found their dream jobs with JobCompass
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Testimonial Card 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl reveal-gentle card-hover-smooth" data-delay="1">
              {/* Stars Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "JobCompass changed my career! The AI analysis was spot-on, identifying skills I didn't even realize I had. Within 2 weeks, I landed my dream job at Google. The matching algorithm is incredibly accurate!"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  SM
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sarah Mitchell</div>
                  <div className="text-sm text-gray-600">Software Engineer @ Google</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl reveal-gentle card-hover-smooth" data-delay="2">
              {/* Stars Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "The skill gap analysis feature is a game-changer. It showed me exactly what I needed to learn to reach my goals. I took recommended courses and got hired by Microsoft 3 months later. Best career investment ever!"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  JC
                </div>
                <div>
                  <div className="font-bold text-gray-900">James Chen</div>
                  <div className="text-sm text-gray-600">Cloud Architect @ Microsoft</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl reveal-gentle card-hover-smooth" data-delay="3">
              {/* Stars Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "I was stuck in my career and didn't know what to do next. JobCompass showed me opportunities I never considered. The personalized learning path helped me transition into data science. Now I'm at Netflix!"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  ER
                </div>
                <div>
                  <div className="font-bold text-gray-900">Emily Rodriguez</div>
                  <div className="text-sm text-gray-600">Data Scientist @ Netflix</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl reveal-gentle card-hover-smooth" data-delay="1">
              {/* Stars Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
                <svg className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "As a recent graduate, I had no idea where to start. JobCompass analyzed my CV and matched me with entry-level positions that fit my skills perfectly. Got 5 interviews in my first week! Great platform."
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  MK
                </div>
                <div>
                  <div className="font-bold text-gray-900">Michael Kim</div>
                  <div className="text-sm text-gray-600">Junior Developer @ Startup</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl reveal-gentle card-hover-smooth" data-delay="2">
              {/* Stars Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "After 10 years in the same role, I wanted a change. JobCompass helped me identify transferable skills and find opportunities in product management. The career transition support was invaluable. Now at Apple!"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  LP
                </div>
                <div>
                  <div className="font-bold text-gray-900">Lisa Park</div>
                  <div className="text-sm text-gray-600">Product Manager @ Apple</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl reveal-gentle card-hover-smooth" data-delay="3">
              {/* Stars Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "The personalized course recommendations saved me so much time! Instead of random tutorials, I followed a structured path that directly addressed my skill gaps. Landed my dream Tesla job in 4 months!"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  DW
                </div>
                <div>
                  <div className="font-bold text-gray-900">David Wang</div>
                  <div className="text-sm text-gray-600">ML Engineer @ Tesla</div>
                </div>
              </div>
            </div>

          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-8 mt-16 reveal" data-delay="1">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Success Stories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">2 Weeks</div>
              <div className="text-gray-600">Avg. Time to Hire</div>
            </div>
          </div>

        </div>
      </div>

      {/* Get in Touch Section */}
      <div className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 reveal">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto reveal" data-delay="1">
              You can reach us anytime
            </p>
          </div>

          {/* Contact Form & Illustration Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Side: Contact Form */}
            <div className="reveal-gentle" data-delay="2">
              {/* Smaller, more compact form container with white background */}
              <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 max-w-md mx-auto">
                <form className="space-y-3">
                  
                  {/* First Name & Last Name Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-white mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white text-black placeholder-gray-500"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-white mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white text-black placeholder-gray-500"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-white mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="email"
                        id="email"
                        className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white text-black placeholder-gray-500"
                        placeholder="Your email"
                      />
                    </div>
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-white mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white text-black placeholder-gray-500"
                      placeholder="Phone number"
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-white mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows="5"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none bg-white text-black placeholder-gray-500"
                      placeholder="How can we help?"
                    ></textarea>
                    <div className="text-right text-sm text-gray-400 mt-2">0/120</div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 text-sm rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Submit
                  </button>

                  {/* Terms */}
                  <p className="text-center text-sm text-gray-600">
                    By contacting us, you agree to our{' '}
                    <a href="#" className="font-semibold text-gray-900 hover:text-blue-600">Terms of service</a>
                    {' '}and{' '}
                    <a href="#" className="font-semibold text-gray-900 hover:text-blue-600">Privacy Policy</a>
                  </p>

                </form>
              </div>
            </div>

            {/* Right Side: Animated Illustration */}
            <div className="reveal-gentle" data-delay="3">
              <div className="relative h-[500px] flex items-center justify-center">
                
                {/* Central Envelope Animation */}
                <div className="relative z-10">
                  <div className="w-64 h-48 bg-white rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500 animate-float">
                    {/* Envelope body */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl overflow-hidden">
                      {/* Envelope flap */}
                      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-blue-400 to-purple-500 origin-top" 
                           style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}>
                      </div>
                      
                      {/* Letter inside */}
                      <div className="absolute inset-x-8 top-12 bottom-8 bg-white rounded-lg shadow-inner flex flex-col items-center justify-center p-4">
                        <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
                        <div className="w-4/5 h-2 bg-gray-200 rounded mb-2"></div>
                        <div className="w-full h-2 bg-gray-200 rounded mb-4"></div>
                        <div className="w-3/5 h-2 bg-blue-400 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Message Bubbles */}
                <div className="absolute top-12 left-8 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="bg-white rounded-2xl shadow-xl p-4 max-w-[140px]">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                        <div className="h-2 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-32 right-8 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="bg-white rounded-2xl shadow-xl p-4 max-w-[140px]">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded w-14"></div>
                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-16 left-12 animate-float" style={{ animationDelay: '0.7s' }}>
                  <div className="bg-white rounded-2xl shadow-xl p-4 max-w-[140px]">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex-shrink-0"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded w-12"></div>
                        <div className="h-2 bg-gray-200 rounded w-14"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flying Email Icons */}
                <div className="absolute top-8 right-16 animate-float" style={{ animationDelay: '0.3s' }}>
                  <svg className="w-12 h-12 text-blue-400 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>

                <div className="absolute bottom-8 right-8 animate-float" style={{ animationDelay: '1.2s' }}>
                  <svg className="w-10 h-10 text-purple-400 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 500">
                  <path d="M 80 100 Q 200 80, 280 150" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
                  </path>
                  <path d="M 100 400 Q 200 420, 320 320" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2.5s" repeatCount="indefinite" />
                  </path>
                </svg>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer (extracted to component) */}
      <Footer />

    </div>
    </>
  )
}

export default Home