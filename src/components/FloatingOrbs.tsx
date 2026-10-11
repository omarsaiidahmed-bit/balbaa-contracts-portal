import { motion } from 'framer-motion'

export default function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* أورب 1 - يمين فوق */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[10%] right-[5%] w-72 h-72 rounded-full bg-gradient-to-br from-balbaa-secondary/20 to-balbaa-primary/10 blur-3xl"
      />

      {/* أورب 2 - يسار فوق */}
      <motion.div
        animate={{
          x: [0, -30, 30, 0],
          y: [0, 40, -20, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[20%] left-[8%] w-96 h-96 rounded-full bg-gradient-to-br from-balbaa-primary/15 to-balbaa-accent/10 blur-3xl"
      />

      {/* أورب 3 - أسفل يمين */}
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -20, 30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[10%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-br from-balbaa-secondary/15 to-purple-400/10 blur-3xl"
      />

      {/* أورب 4 - أسفل يسار */}
      <motion.div
        animate={{
          x: [0, -25, 25, 0],
          y: [0, 25, -30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[15%] left-[15%] w-72 h-72 rounded-full bg-gradient-to-br from-balbaa-accent/15 to-balbaa-secondary/10 blur-3xl"
      />

      {/* جزيئات صغيرة */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'easeInOut',
          }}
          className="absolute w-1.5 h-1.5 rounded-full bg-balbaa-secondary/40"
          style={{
            boxShadow: '0 0 12px rgba(30,136,229,0.6)',
          }}
        />
      ))}
    </div>
  )
}