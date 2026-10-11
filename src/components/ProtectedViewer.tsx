import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Watermark from './Watermark'

interface Page {
  id: string
  page_number: number
  storage_path: string
}

interface ProtectedViewerProps {
  pages: Page[]
  companyName: string
  documentId: string
  companyId: string
}

export default function ProtectedViewer({
  pages,
  companyName,
  documentId,
  companyId,
}: ProtectedViewerProps) {
  const { profile } = useAuth()
  const [current, setCurrent] = useState(0)
  const [imgUrl, setImgUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // تحميل الصورة
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const load = async () => {
      const page = pages[current]
      if (!page) return

      const { data, error } = await supabase.storage
        .from('contracts-pages')
        .createSignedUrl(page.storage_path, 120)

      if (!cancelled && data) {
        setImgUrl(data.signedUrl)
        setLoading(false)

        await supabase.from('audit_logs').insert({
          user_id: profile?.id,
          action: 'view_page',
          company_id: companyId,
          document_id: documentId,
          page_number: page.page_number,
        })
      }
      if (error) console.error('Error loading page:', error)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [current, pages, profile, companyId, documentId])

  // منع الأدوات
  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault()
    const blockKeys = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ['s', 'p', 'u', 'c'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault()
        if (e.key.toLowerCase() === 'p') {
          supabase.from('audit_logs').insert({
            user_id: profile?.id,
            action: 'print_attempt',
            company_id: companyId,
            document_id: documentId,
          })
        }
      }
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault()
      }
    }
    const blockSelect = (e: Event) => e.preventDefault()

    document.addEventListener('contextmenu', blockContext)
    document.addEventListener('keydown', blockKeys)
    document.addEventListener('selectstart', blockSelect)

    return () => {
      document.removeEventListener('contextmenu', blockContext)
      document.removeEventListener('keydown', blockKeys)
      document.removeEventListener('selectstart', blockSelect)
    }
  }, [profile, companyId, documentId])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') next()
      if (e.key === 'ArrowRight') prev()
      if (e.key === 'Escape' && fullscreen) setFullscreen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const next = () => {
    if (current < pages.length - 1) {
      setDirection(1)
      setCurrent((c) => c + 1)
      setZoom(1)
    }
  }

  const prev = () => {
    if (current > 0) {
      setDirection(-1)
      setCurrent((c) => c - 1)
      setZoom(1)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${fullscreen ? 'fixed inset-0 z-50' : ''} bg-balbaa-black rounded-2xl overflow-hidden border border-white/10`}
    >
      {/* Toolbar */}
      <div className="glass border-b border-white/10 px-4 py-3 flex items-center justify-between relative z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 font-mono px-2">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="text-xs text-gray-400 font-mono tracking-wider hidden md:block">
          {companyName.toUpperCase()}
        </div>

        <button
          onClick={() => setFullscreen((f) => !f)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
          title={fullscreen ? 'خروج' : 'ملء الشاشة'}
        >
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Viewer */}
      <div
        className={`relative ${fullscreen ? 'h-[calc(100vh-120px)]' : 'h-[65vh] md:h-[75vh]'} bg-gradient-to-br from-balbaa-night to-black flex items-center justify-center overflow-hidden`}
      >
        {/* Watermark */}
        <Watermark username={profile?.username || 'guest'} companyName={companyName} />

        <AnimatePresence mode="wait" custom={direction}>
          {loading || !imgUrl ? (
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <div className="w-10 h-10 border-2 border-balbaa-secondary/30 border-t-balbaa-secondary rounded-full animate-spin" />
              <span className="text-sm">جاري التحميل...</span>
            </div>
          ) : (
            <motion.img
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              src={imgUrl}
              alt={`Page ${current + 1}`}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="max-w-full max-h-full object-contain pointer-events-none select-none transition-transform"
              style={{
                transform: `scale(${zoom})`,
                userSelect: 'none',
              } as any}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="glass border-t border-white/10 px-4 py-3 relative z-30">
        <div className="flex items-center justify-between gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prev}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-balbaa-primary to-balbaa-secondary text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg shadow-balbaa-secondary/20"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="hidden md:inline">السابق</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-black text-white">
                {current + 1}
                <span className="text-gray-500 text-sm font-normal"> / {pages.length}</span>
              </div>
              <div className="text-[10px] text-gray-500 tracking-wider">PAGE</div>
            </div>

            <select
              value={current}
              onChange={(e) => {
                const val = Number(e.target.value)
                setDirection(val > current ? 1 : -1)
                setCurrent(val)
                setZoom(1)
              }}
              className="hidden md:block bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-balbaa-secondary"
            >
              {pages.map((p, i) => (
                <option key={p.id} value={i} className="bg-balbaa-night">
                  صفحة {p.page_number}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={next}
            disabled={current === pages.length - 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-balbaa-primary to-balbaa-secondary text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg shadow-balbaa-secondary/20"
          >
            <span className="hidden md:inline">التالي</span>
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-balbaa-primary to-balbaa-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${((current + 1) / pages.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}