import { motion } from 'framer-motion'

interface WatermarkProps {
  username: string
  companyName?: string
}

export default function Watermark({ username, companyName }: WatermarkProps) {
  const timestamp = new Date().toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden select-none">
      {/* نمط متكرر من اللوجو + النص */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url('/balbaa-logo.jpg')`,
          backgroundSize: '160px 160px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-25deg) scale(1.5)',
          transformOrigin: 'center',
          filter: 'grayscale(30%)',
        }}
      />

      {/* طبقة تانية بحجم أكبر - أخف */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url('/balbaa-logo.jpg')`,
          backgroundSize: '320px 320px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(15deg) scale(1.4)',
          transformOrigin: 'center',
        }}
      />

      {/* اللوجو الضخم في المنتصف */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.07, 0.11, 0.07],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex flex-col items-center"
        >
          <img
            src="/balbaa-logo.jpg"
            alt=""
            className="w-[300px] md:w-[500px] h-auto object-contain grayscale"
            draggable={false}
          />
          <div
            className="text-4xl md:text-6xl font-black mt-4 whitespace-nowrap"
            style={{
              color: 'rgba(15, 76, 129, 0.4)',
              letterSpacing: '8px',
              textShadow: '0 0 40px rgba(30,136,229,0.2)',
            }}
          >
            صيدليات بلبع
          </div>
        </motion.div>
      </div>

      {/* نص قطري عربي كبير */}
      <div className="absolute inset-0 flex items-center justify-center rotate-[-30deg]">
        <div
          className="text-5xl md:text-8xl font-black whitespace-nowrap"
          style={{
            color: 'rgba(30, 136, 229, 0.07)',
            letterSpacing: '12px',
            textShadow: '0 0 60px rgba(30,136,229,0.15)',
          }}
        >
          BALBAA · CONFIDENTIAL
        </div>
      </div>

      {/* معلومات المستخدم - أعلى يسار */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-3 left-3 text-[10px] md:text-xs font-bold text-balbaa-primary/60 tracking-wider bg-white/40 backdrop-blur-sm px-2 py-1 rounded-md"
      >
        USER: {username.toUpperCase()}
      </motion.div>

      {/* الشركة - أعلى يمين */}
      <div className="absolute top-3 right-3 text-[10px] md:text-xs font-bold text-balbaa-primary/60 tracking-wider bg-white/40 backdrop-blur-sm px-2 py-1 rounded-md">
        {companyName ? companyName.toUpperCase() : 'INTERNAL'}
      </div>

      {/* التاريخ - أسفل يمين */}
      <div className="absolute bottom-3 right-3 text-[10px] md:text-xs font-bold text-balbaa-primary/60 tracking-wider bg-white/40 backdrop-blur-sm px-2 py-1 rounded-md">
        {timestamp}
      </div>

      {/* حقوق - أسفل يسار */}
      <div className="absolute bottom-3 left-3 text-[10px] md:text-xs font-bold text-balbaa-primary/60 tracking-wider bg-white/40 backdrop-blur-sm px-2 py-1 rounded-md">
        © BALBAA PHARMACIES
      </div>

      {/* خطوط قطرية في الزوايا */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-balbaa-primary/20 rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-balbaa-primary/20 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-balbaa-primary/20 rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-balbaa-primary/20 rounded-br-3xl" />
    </div>
  )
}