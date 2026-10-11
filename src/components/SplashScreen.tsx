import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onFinish, 600)
    }, 2600)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] bg-balbaa-black flex items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.4 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute w-96 h-96 rounded-full bg-balbaa-secondary/30 blur-[100px]"
          />

          <div className="relative z-10 text-center flex flex-col items-center">
            {/* اللوجو */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center p-4 shadow-2xl shadow-balbaa-secondary/20">
                <img
                  src="/balbaa-logo.jpg"
                  alt="Balbaa"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            </motion.div>

            {/* النص */}
            <motion.div
              initial={{ opacity: 0, y: 20, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.1em' }}
              transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-black gradient-text text-glow"
            >
              BALBAA
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-gray-500 text-xs md:text-sm tracking-[0.4em] mt-4"
            >
              CONTRACTS · KNOWLEDGE · PORTAL
            </motion.div>

            {/* شريط التحميل */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.3, duration: 1, ease: 'easeInOut' }}
              className="w-48 h-[2px] bg-gradient-to-r from-transparent via-balbaa-secondary to-transparent mx-auto mt-10 origin-center"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}