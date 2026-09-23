import React, { useState } from 'react'
import { supabase } from './supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, KeyRound, User, BookOpen } from 'lucide-react'

// Apple design principles:
// - custom easings
const easeOut = [0.23, 1, 0.32, 1]
const springConfig = { type: 'spring', bounce: 0, duration: 0.4 }

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1: Email, 2: OTP
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [mode, setMode] = useState('signup') // 'login' or 'signup'
  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [globalSettings, setGlobalSettings] = useState(null)
  const navigate = useNavigate()

  React.useEffect(() => {
    supabase.from('global_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setGlobalSettings(data)
    })
  }, [])

  const isRegistrationOpen = () => {
    if (!globalSettings) return true; // Default to true while loading
    if (globalSettings.registration_status === 'closed') return false;
    if (globalSettings.registration_status === 'open') return true;
    
    // Auto mode
    const deadline = new Date("October 4, 2026 23:59:59").getTime();
    return new Date().getTime() <= deadline;
  };

  React.useEffect(() => {
    let interval = null
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, resendTimer])

  // Redirect if already logged in
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard')
      }
    })
  }, [navigate])

  const handleSendOtp = async (event) => {
    if (event) event.preventDefault()
    
    if (mode === 'signup' && !isRegistrationOpen()) {
      setErrorMsg('We are no longer accepting new registrations.')
      return;
    }

    setLoading(true)
    setMessage('')
    setErrorMsg('')
    
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: { shouldCreateUser: mode === 'signup' }
    })

    if (error) {
      if (error.message.toLowerCase().includes('signups not allowed')) {
        setErrorMsg('Account not found. Please sign up first.')
      } else {
        setErrorMsg(error.error_description || error.message)
      }
      setLoading(false)
    } else {
      setMessage('A secure code has been sent to your email.')
      setStep(2)
      setResendTimer(30)
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMsg('')

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    })

    if (error) {
      setErrorMsg(error.error_description || error.message)
      setLoading(false)
    } else {
      if (mode === 'signup' && data?.session?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.session.user.id,
            email: data.session.user.email,
            name: name,
            college: college
          })
      }
      navigate('/dashboard')
    }
  }

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="/gradient-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Subtle overlay for contrast */}
      <div className="absolute inset-0 z-0 bg-black/20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={springConfig}
        className="relative z-10 w-full max-w-[420px] px-6"
      >
        <div className="flex flex-col items-center mb-8">
          <img src="/logos/zephyr-logo-new.png" alt="Zephyr" className="w-[320px] md:w-[380px] mb-2 object-contain drop-shadow-lg" />
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900 drop-shadow-sm relative z-10">
            {step === 1 ? (mode === 'login' ? 'Welcome Back' : 'Create Account') : 'Verification'}
          </h1>
          <p className="text-slate-600 text-sm text-center drop-shadow-sm">
            {step === 1 
              ? (mode === 'login' ? 'Enter your email to securely log in.' : 'Join Zephyr Hackathon and start building.')
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        <div className="relative bg-white/80 border border-white/50 backdrop-blur-3xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={springConfig}
                onSubmit={handleSendOtp} 
                className="flex flex-col gap-4"
              >
                <AnimatePresence initial={false} mode="sync">
                  {mode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ ...springConfig, opacity: { duration: 0.2 } }}
                      className="flex flex-col gap-4 overflow-hidden"
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={name}
                          required={mode === 'signup'}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/95 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-sm"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <BookOpen size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="University / College"
                          value={college}
                          required={mode === 'signup'}
                          onChange={(e) => setCollege(e.target.value)}
                          className="w-full bg-white/95 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-sm"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/95 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-sm"
                  />
                </div>

                <motion.button 
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  transition={{ duration: 0.15 }}
                  type="submit" 
                  disabled={loading}
                  className="w-full group flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold rounded-xl py-3 mt-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {loading ? 'Sending Code...' : 'Continue'}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </motion.button>
                
                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      if (mode === 'login') {
                        if (!isRegistrationOpen()) {
                          setErrorMsg('We are no longer accepting new registrations.')
                          return;
                        }
                        setMode('signup')
                      } else {
                        setMode('login')
                      }
                      setErrorMsg('')
                      setMessage('')
                    }} 
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={springConfig}
                onSubmit={handleVerifyOtp} 
                className="flex flex-col gap-4"
              >
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    required
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/95 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-2xl tracking-[0.5em] font-medium text-center text-slate-900 placeholder-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 shadow-sm"
                  />
                </div>

                <motion.button 
                  whileTap={!(loading || otp.length < 6) ? { scale: 0.97 } : {}}
                  transition={{ duration: 0.15 }}
                  type="submit" 
                  disabled={loading || otp.length < 6}
                  className="w-full group flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold rounded-xl py-3.5 mt-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {loading ? 'Verifying...' : 'Verify & Enter'}
                </motion.button>

                <div className="text-center mt-4 space-y-3">
                  <p className="text-[11px] text-amber-600 font-medium px-4 leading-relaxed">
                    Please check your <strong>SPAM</strong> folder for the OTP. If you find it there, kindly report it as <strong>"Not Spam"</strong> to help other participants receive theirs!
                  </p>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-slate-500 font-medium">Resend OTP in {resendTimer}s</p>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleSendOtp} 
                        disabled={loading}
                        className="text-xs text-blue-600 font-bold hover:text-blue-800 transition-colors disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => {
                        setStep(1)
                        setOtp('')
                      }} 
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors mt-2"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                  {errorMsg}
                </div>
              </motion.div>
            )}
            
            {message && !errorMsg && step === 1 && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs text-center font-medium">
                  {message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
