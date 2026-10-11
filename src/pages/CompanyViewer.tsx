import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Building2, Wifi, WifiOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProtectedViewer from '../components/ProtectedViewer'
import CompanyLogo from '../components/CompanyLogo'
import FloatingOrbs from '../components/FloatingOrbs'

interface Company {
  id: string
  name: string
  name_ar: string
  type: string
  logo_path: string | null
}

interface Document {
  id: string
  title: string
  category: string
  page_count: number
}

interface Page {
  id: string
  page_number: number
  storage_path: string
}

export default function CompanyViewer() {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      const { data: comp } = await supabase
        .from('companies')
        .select('id, name, name_ar, type, logo_path')
        .eq('id', id)
        .single()

      setCompany(comp)

      const { data: docs } = await supabase
        .from('documents')
        .select('id, title, category, page_count')
        .eq('company_id', id)
        .order('display_order')

      setDocuments(docs ?? [])
      if (docs && docs.length > 0) setSelectedDoc(docs[0])
      setLoading(false)
    }

    load()
  }, [id])

  useEffect(() => {
    if (!selectedDoc) return

    supabase
      .from('document_pages')
      .select('id, page_number, storage_path')
      .eq('document_id', selectedDoc.id)
      .order('page_number')
      .then(({ data }) => setPages(data ?? []))
  }, [selectedDoc])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-balbaa-secondary/30 border-t-balbaa-secondary rounded-full animate-spin" />
          <span className="text-slate-500 font-semibold">جاري التحميل...</span>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md shadow-xl">
          <div className="text-red-500 text-lg font-bold mb-2">الشركة غير موجودة</div>
          <p className="text-slate-500 text-sm mb-6">
            الشركة غير موجودة أو غير مسموح لك بالوصول
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-balbaa-primary to-balbaa-secondary text-white font-semibold shadow-lg shadow-balbaa-secondary/30"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع للشركات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FloatingOrbs />
      <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition group shadow-sm"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              رجوع
            </Link>

            <div className="flex items-center gap-3">
              <img
                src="/balbaa-logo.jpg"
                alt="Balbaa"
                className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg"
                draggable={false}
              />
              <div className="text-lg md:text-xl font-black bg-gradient-to-r from-balbaa-primary to-balbaa-secondary bg-clip-text text-transparent tracking-tight">
                BALBAA
              </div>
            </div>

            <div className="text-[10px] text-red-500 tracking-[0.2em] font-bold hidden md:block">
              ● CONFIDENTIAL
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-white rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-200/60"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-balbaa-secondary to-balbaa-primary" />

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <CompanyLogo
                  logoPath={company.logo_path}
                  companyName={company.name}
                  size="lg"
                />
                <div>
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-1">
                    {company.name}
                  </h1>
                  {company.name_ar && (
                    <p className="text-slate-500 text-sm md:text-base">{company.name_ar}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${
                    company.type === 'online'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-purple-50 text-purple-600 border border-purple-200'
                  }`}
                >
                  {company.type === 'online' ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  {company.type.toUpperCase()}
                </span>
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 font-semibold">
                  <FileText className="w-3 h-3" />
                  {documents.length} مستند
                </span>
              </div>
            </div>
          </motion.div>

          {documents.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {documents.map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDoc(d)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedDoc?.id === d.id
                      ? 'bg-gradient-to-r from-balbaa-primary to-balbaa-secondary text-white shadow-lg shadow-balbaa-secondary/30'
                      : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200/60 shadow-sm'
                  }`}
                >
                  {d.title}
                </motion.button>
              ))}
            </motion.div>
          )}

          {selectedDoc && pages.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <ProtectedViewer
                pages={pages}
                companyName={company.name}
                documentId={selectedDoc.id}
                companyId={company.id}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-16 text-center shadow-xl"
            >
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <div className="text-slate-400">لا يوجد مستندات لهذه الشركة بعد</div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}