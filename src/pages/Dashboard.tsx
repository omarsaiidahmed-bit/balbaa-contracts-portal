import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from 'framer-motion'
import { Search, LogOut, Building2, Wifi, WifiOff, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CompaniesMarquee from '../components/CompaniesMarquee'
import CompanyLogo from '../components/CompanyLogo'
import FloatingOrbs from '../components/FloatingOrbs'

interface Company {
  id: string
  name: string
  name_ar: string
  type: string
  logo_path: string | null
}

type Tab = 'all' | 'online' | 'offline'

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, name_ar, type, logo_path')
      .order('display_order')
      .then(({ data }) => {
        setCompanies(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = companies.filter((c) => {
    const matchTab = tab === 'all' || c.type === tab
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.name_ar?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  const counts = {
    all: companies.length,
    online: companies.filter((c) => c.type === 'online').length,
    offline: companies.filter((c) => c.type === 'offline').length,
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 overflow-hidden">
      <FloatingOrbs />
      <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/balbaa-logo.jpg"
                alt="Balbaa"
                className="w-12 h-12 md:w-14 md:h-14 object-contain rounded-xl"
                draggable={false}
              />
              <div>
                <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-balbaa-primary to-balbaa-secondary bg-clip-text text-transparent tracking-tight">
                  BALBAA
                </div>
                <div className="text-[10px] text-slate-500 tracking-[0.2em] hidden md:block">
                  CONTRACTS KNOWLEDGE PORTAL
                </div>
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-[10px] text-purple-600 font-bold tracking-widest hover:text-purple-800 transition"
                  >
                    ● ADMIN PANEL
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-500">مرحباً</div>
                <div className="text-sm font-bold text-slate-800">
                  {profile?.full_name || profile?.username}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-balbaa-primary to-balbaa-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-balbaa-secondary/30">
                {(profile?.full_name || profile?.username || '?').charAt(0).toUpperCase()}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 transition"
                title="خروج"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 md:mb-10 text-center md:text-right"
          >
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-3 tracking-tight">
              شركات{' '}
              <span className="bg-gradient-to-r from-balbaa-primary to-balbaa-secondary bg-clip-text text-transparent">
                التعاقد
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl">
              قاعدة معرفية موحدة لكل عقود وبروتوكولات الصرف الطبي
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="-mx-4 md:-mx-8 mb-10 bg-white/60 backdrop-blur-sm border-y border-slate-200/40"
          >
            <CompaniesMarquee variant="light" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-3 gap-3 md:gap-4 mb-8"
          >
            <StatCard icon={<Building2 />} label="إجمالي الشركات" value={counts.all} color="blue" />
            <StatCard icon={<Wifi />} label="أونلاين" value={counts.online} color="green" />
            <StatCard icon={<WifiOff />} label="أوفلاين" value={counts.offline} color="purple" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8 space-y-4"
          >
            <div className="relative max-w-xl">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن شركة..."
                className="w-full bg-white rounded-2xl pr-12 pl-4 py-4 text-slate-800 placeholder-slate-400 shadow-lg shadow-slate-200/50 border border-slate-200/60 focus:outline-none focus:border-balbaa-secondary focus:ring-4 focus:ring-balbaa-secondary/10 transition-all"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
                الكل ({counts.all})
              </TabButton>
              <TabButton active={tab === 'online'} onClick={() => setTab('online')}>
                أونلاين ({counts.online})
              </TabButton>
              <TabButton active={tab === 'offline'} onClick={() => setTab('offline')}>
                أوفلاين ({counts.offline})
              </TabButton>
            </div>
          </motion.div>

          {loading ? (
            <div className="text-center text-slate-400 py-20">
              <div className="w-10 h-10 border-2 border-balbaa-secondary/30 border-t-balbaa-secondary rounded-full animate-spin mx-auto mb-4" />
              جاري التحميل...
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-400 py-20 bg-white rounded-2xl shadow-sm"
            >
              لا توجد نتائج مطابقة
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence>
                {filtered.map((c, i) => (
                  <CompanyCard key={c.id} company={c} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    })
    return () => controls.stop()
  }, [value])

  return <>{display}</>
}

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      border: 'border-blue-200/60',
      icon: 'bg-blue-500/10 text-blue-600',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
      border: 'border-emerald-200/60',
      icon: 'bg-emerald-500/10 text-emerald-600',
      text: 'text-emerald-600',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
      border: 'border-purple-200/60',
      icon: 'bg-purple-500/10 text-purple-600',
      text: 'text-purple-600',
    },
  }
  const c = colors[color]
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`${c.bg} ${c.border} border rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center`}>
          <div className="w-4 h-4 md:w-5 md:h-5">{icon}</div>
        </div>
        <div className={`text-2xl md:text-3xl font-black ${c.text}`}>
          <AnimatedCounter value={value} />
        </div>
      </div>
      <div className="text-xs text-slate-600 font-semibold">{label}</div>
    </motion.div>
  )
}

function TabButton({ active, onClick, children }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`px-4 md:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-balbaa-primary to-balbaa-secondary text-white shadow-lg shadow-balbaa-secondary/30'
          : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200/60 shadow-sm'
      }`}
    >
      {children}
    </motion.button>
  )
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg'])

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.5 }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.04, z: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
      >
        <Link
          to={`/company/${company.id}`}
          className="group block bg-white rounded-3xl p-5 md:p-6 h-full relative overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-balbaa-secondary/20 transition-all duration-300"
          style={{ transform: 'translateZ(30px)' }}
        >
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-balbaa-secondary to-balbaa-primary opacity-0 group-hover:opacity-100 transition-opacity" />

          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
            style={{
              background: useTransform(
                [glareX, glareY],
                ([gx, gy]: string[]) =>
                  `radial-gradient(circle at ${gx} ${gy}, rgba(30,136,229,0.12), transparent 60%)`
              ),
            }}
          />

          <div className="relative z-10" style={{ transform: 'translateZ(50px)' }}>
            <div className="flex items-start justify-between mb-4">
              <CompanyLogo
                logoPath={company.logo_path}
                companyName={company.name}
                size="md"
                className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
              />
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                  company.type === 'online'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-purple-50 text-purple-600 border border-purple-200'
                }`}
              >
                {company.type === 'online' ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="font-bold text-slate-900 text-sm md:text-base leading-tight mb-1 group-hover:text-balbaa-primary transition-colors">
              {company.name}
            </div>
            {company.name_ar && (
              <div className="text-xs text-slate-500 leading-tight">
                {company.name_ar}
              </div>
            )}

            <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-balbaa-secondary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>عرض التفاصيل</span>
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}