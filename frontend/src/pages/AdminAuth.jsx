import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, User, KeyRound, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../supabaseClient'

const springConfig = { type: 'spring', bounce: 0, duration: 0.4 }

export default function AdminAuth() {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  // Redirect if already logged in
  React.useEffect(() => {
    if (localStorage.getItem('isAdminAuthenticated') === 'true') {
      navigate('/admin')
    }
  }, [navigate])

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username.trim(),
      password: password
    })

    if (error) {
      setErrorMsg('Invalid admin credentials.')
      setLoading(false)
    } else {
      localStorage.setItem('isAdminAuthenticated', 'true')
      navigate('/admin')
    }
  }

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background Video (Same as Participant Auth) */}
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
            Admin Console
          </h1>
          <p className="text-slate-600 text-sm text-center drop-shadow-sm">
            Enter your credentials to access the master dashboard.
          </p>
        </div>

        <div className="relative bg-white/80 border border-white/50 backdrop-blur-3xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <form 
            onSubmit={handleLogin} 
            className="flex flex-col gap-4"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                type="email"
                placeholder="Admin Email"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/95 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 shadow-sm"
              />
            </div>

            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <KeyRound size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/95 border border-slate-200 rounded-xl py-3.5 pl-11 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 shadow-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <motion.button 
              whileTap={!loading ? { scale: 0.97 } : {}}
              transition={{ duration: 0.15 }}
              type="submit" 
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold rounded-xl py-3 mt-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {loading ? 'Authenticating...' : 'Login'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </form>

          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }} 
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-start gap-2">
                  <div className="mt-0.5">⚠️</div>
                  <div>{errorMsg}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
