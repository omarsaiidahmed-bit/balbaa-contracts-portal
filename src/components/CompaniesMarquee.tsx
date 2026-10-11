import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CompanyLogo from './CompanyLogo'

interface Company {
  id: string
  name: string
  name_ar: string
  logo_path: string | null
  type: string
}

interface CompaniesMarqueeProps {
  variant?: 'dark' | 'light'
}

export default function CompaniesMarquee({ variant = 'light' }: CompaniesMarqueeProps) {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, name_ar, logo_path, type')
      .order('display_order')
      .then(({ data }) => setCompanies((data as Company[]) ?? []))
  }, [])

  if (companies.length === 0) return null

  const onlineCompanies = companies.filter((c) => c.type === 'online')
  const offlineCompanies = companies.filter((c) => c.type === 'offline')

  const isDark = variant === 'dark'

  return (
    <div className="relative w-full overflow-hidden py-4 space-y-3">
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-32 z-20 ${
          isDark
            ? 'bg-gradient-to-l from-balbaa-black to-transparent'
            : 'bg-gradient-to-l from-white to-transparent'
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-32 z-20 ${
          isDark
            ? 'bg-gradient-to-r from-balbaa-black to-transparent'
            : 'bg-gradient-to-r from-white to-transparent'
        }`}
      />

      {/* أونلاين - فوق - يمين */}
      <MarqueeRow
        companies={onlineCompanies}
        direction="right"
        variant={variant}
        speed={25}
      />

      {/* أوفلاين - تحت - شمال */}
      <MarqueeRow
        companies={offlineCompanies}
        direction="left"
        variant={variant}
        speed={35}
      />
    </div>
  )
}

function MarqueeRow({
  companies,
  direction,
  variant,
  speed,
}: {
  companies: Company[]
  direction: 'left' | 'right'
  variant: 'dark' | 'light'
  speed: number
}) {
  const isDark = variant === 'dark'

  if (companies.length === 0) return null

  const animationName = direction === 'right' ? 'marqueeRight' : 'marqueeLeft'

  return (
    <div className="flex overflow-hidden w-full">
      <div
        className="flex shrink-0"
        style={{
          width: 'max-content',
          animation: `${animationName} ${speed}s linear infinite`,
        }}
      >
        {/* النسخة الأولى */}
        <div className="flex gap-3 pr-3 shrink-0">
          {companies.map((c) => (
            <CompanyCard key={c.id} company={c} isDark={isDark} />
          ))}
        </div>

        {/* النسخة التانية (مطابقة تمامًا) */}
        <div className="flex gap-3 pr-3 shrink-0" aria-hidden="true">
          {companies.map((c) => (
            <CompanyCard key={`dup-${c.id}`} company={c} isDark={isDark} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CompanyCard({ company, isDark }: { company: Company; isDark: boolean }) {
  return (
    <div
      className={`rounded-xl px-4 py-2 flex items-center gap-2.5 shrink-0 transition-all group cursor-pointer ${
        isDark
          ? 'bg-white/5 backdrop-blur-xl border border-white/10 hover:border-balbaa-secondary/50'
          : 'bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-balbaa-secondary/50'
      }`}
    >
      <CompanyLogo
        logoPath={company.logo_path}
        companyName={company.name}
        size="sm"
        className="shrink-0"
      />
      <div className="flex flex-col leading-tight">
        <span
          className={`text-xs font-bold transition-colors ${
            isDark
              ? 'text-white group-hover:text-balbaa-secondary'
              : 'text-slate-800 group-hover:text-balbaa-primary'
          }`}
        >
          {company.name}
        </span>
        {company.name_ar && (
          <span
            className={`text-[9px] ${
              isDark ? 'text-gray-500' : 'text-slate-400'
            }`}
          >
            {company.name_ar}
          </span>
        )}
      </div>
    </div>
  )
}