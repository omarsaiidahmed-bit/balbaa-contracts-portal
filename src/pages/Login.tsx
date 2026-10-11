import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import CompaniesMarquee from '../components/CompaniesMarquee'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(username.trim(), password)
    setLoading(false)
    if (error) {
      setError('خطأ: ' + error)
      return
    }
    nav('/')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-balbaa-black overflow-hidden p-4 noise">
      <AnimatedBackground />

      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-balbaa-secondary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-balbaa-primary/30 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-3xl p-8 md:p-10 shadow-2xl"
        >
          {/* لوجو + الشعار */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8 flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 flex items-center justify-center mb-4 shadow-xl shadow-balbaa-secondary/20"
            >
              <img
                src="/balbaa-logo.jpg"
                alt="Balbaa"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </motion.div>

            <div className="text-4xl md:text-5xl font-black gradient-text tracking-tight text-glow">
              BALBAA
            </div>
            <div className="text-[10px] md:text-xs text-gray-400 mt-2 tracking-[0.3em] font-light">
              CONTRACTS · KNOWLEDGE · PORTAL
            </div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-balbaa-secondary to-transparent mx-auto mt-4" />
          </motion.div>

          {/* Username */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-5"
          >
            <label className="block mb-2 text-xs font-semibold text-gray-400 tracking-wider">
              USERNAME
            </label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pr-12 pl-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-balbaa-secondary focus:bg-white/10 focus:ring-2 focus:ring-balbaa-secondary/20 transition-all"
                placeholder="ادخل اسم المستخدم"
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-6"
          >
            <label className="block mb-2 text-xs font-semibold text-gray-400 tracking-wider">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pr-12 pl-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-balbaa-secondary focus:bg-white/10 focus:ring-2 focus:ring-balbaa-secondary/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl p-3 mb-4 break-all"
            >
              {error}
            </motion.div>
          )}

          {/* Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(30,136,229,0.5)' }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-balbaa-primary to-balbaa-secondary text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-balbaa-secondary/30 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الدخول...
              </>
            ) : (
              <>
                دخول
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center text-[10px] text-gray-500 mt-6 tracking-[0.25em]"
          >
            INTERNAL USE ONLY · CONFIDENTIAL
          </motion.div>
        </form>

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8"
        >
          <div className="text-center text-[10px] text-gray-500 tracking-[0.3em] mb-3">
            TRUSTED BY 57+ COMPANIES
          </div>
          <CompaniesMarquee variant="dark" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center text-xs text-gray-600 mt-6"
        >
          © {new Date().getFullYear()} Balbaa Pharmacies
        </motion.div>
      </motion.div>
    </div>
  )
}