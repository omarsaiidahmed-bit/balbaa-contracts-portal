import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface CompanyLogoProps {
  logoPath: string | null
  companyName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
}

// كاش للصور الموقعة (Signed URLs)
const logoCache = new Map<string, string>()

export default function CompanyLogo({
  logoPath,
  companyName,
  size = 'md',
  className = '',
}: CompanyLogoProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!logoPath)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!logoPath) {
      setLoading(false)
      setError(true)
      return
    }

    // لو في كاش، استخدمه فورًا
    if (logoCache.has(logoPath)) {
      setUrl(logoCache.get(logoPath)!)
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      const { data, error: err } = await supabase.storage
        .from('contracts-logos')
        .createSignedUrl(logoPath, 3600) // صالح ساعة

      if (cancelled) return

      if (err || !data) {
        setError(true)
        setLoading(false)
        return
      }

      logoCache.set(logoPath, data.signedUrl)
      setUrl(data.signedUrl)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [logoPath])

  const baseClasses = `${sizeMap[size]} rounded-xl flex items-center justify-center font-black overflow-hidden shrink-0 transition-all ${className}`

  // Fallback - الحرف الأول
  if (error || !logoPath) {
    return (
      <div
        className={`${baseClasses} bg-gradient-to-br from-balbaa-primary to-balbaa-secondary text-white shadow-lg shadow-balbaa-secondary/30`}
      >
        {companyName.charAt(0).toUpperCase()}
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className={`${baseClasses} bg-slate-100 animate-pulse`}>
        <div className="w-1/2 h-1/2 rounded-full bg-slate-200" />
      </div>
    )
  }

  // اللوجو
  return (
    <div className={`${baseClasses} bg-white border border-slate-200/60 shadow-sm p-1`}>
      <img
        src={url!}
        alt={companyName}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  )
}