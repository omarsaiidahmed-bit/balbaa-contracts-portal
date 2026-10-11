import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Users,
  Building2,
  Shield,
  Trash2,
  X,
  Check,
  AlertCircle,
  Activity,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import FloatingOrbs from '../components/FloatingOrbs'

interface UserProfile {
  id: string
  username: string
  full_name: string
  role: 'admin' | 'user'
  status: string
  created_at: string
}

interface Company {
  id: string
  name: string
  name_ar: string
}

interface Access {
  user_id: string
  company_id: string
}

interface AuditLog {
  id: string
  user_id: string
  action: string
  company_id: string
  created_at: string
}

type Tab = 'users' | 'activity'

export default function Admin() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [access, setAccess] = useState<Access[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      window.location.href = '/'
    }
  }, [profile])

  const loadData = async () => {
    setLoading(true)

    const [usersRes, companiesRes, accessRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('companies').select('id, name, name_ar').order('display_order'),
      supabase.from('company_access').select('user_id, company_id'),
    ])

    setUsers(usersRes.data ?? [])
    setCompanies(companiesRes.data ?? [])
    setAccess(accessRes.data ?? [])

    const { data: logsData } = await supabase
      .from('audit_logs')
      .select('id, user_id, action, company_id, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    setLogs(logsData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const hasAccess = (userId: string, companyId: string) =>
    access.some((a) => a.user_id === userId && a.company_id === companyId)

  const toggleAccess = async (userId: string, companyId: string) => {
    if (hasAccess(userId, companyId)) {
      await supabase
        .from('company_access')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId)
      setAccess((prev) =>
        prev.filter((a) => !(a.user_id === userId && a.company_id === companyId))
      )
    } else {
      await supabase.from('company_access').insert({ user_id: userId, company_id: companyId })
      setAccess((prev) => [...prev, { user_id: userId, company_id: companyId }])
    }
  }

  const grantAll = async (userId: string) => {
    const newAccess = companies
      .filter((c) => !hasAccess(userId, c.id))
      .map((c) => ({ user_id: userId, company_id: c.id }))

    if (newAccess.length === 0) return

    await supabase.from('company_access').insert(newAccess)
    setAccess((prev) => [...prev, ...newAccess])
  }

  const revokeAll = async (userId: string) => {
    await supabase.from('company_access').delete().eq('user_id', userId)
    setAccess((prev) => prev.filter((a) => a.user_id !== userId))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FloatingOrbs />

      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
              />
              <div>
                <div className="text-lg md:text-xl font-black bg-gradient-to-r from-balbaa-primary to-balbaa-secondary bg-clip-text text-transparent">
                  ADMIN PANEL
                </div>
                <div className="text-[10px] text-red-500 font-bold tracking-widest hidden md:block">
                  ● RESTRICTED ACCESS
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-bold hidden md:block">
              {profile?.username?.toUpperCase()}
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center md:text-right"
          >
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2">
              لوحة <span className="gradient-text-blue">الإدارة</span>
            </h1>
            <p className="text-slate-500 text-sm">إدارة المستخدمين، الصلاحيات، وسجل النشاط</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <AdminStat icon={<Users />} label="المستخدمين" value={users.length} color="blue" />
            <AdminStat
              icon={<Shield />}
              label="أدمن"
              value={users.filter((u) => u.role === 'admin').length}
              color="purple"
            />
            <AdminStat icon={<Building2 />} label="الشركات" value={companies.length} color="green" />
            <AdminStat icon={<Activity />} label="أحداث مسجلة" value={logs.length} color="orange" />
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('users')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === 'users'
                  ? 'bg-gradient-to-r from-balbaa-primary to-balbaa-secondary text-white shadow-lg'
                  : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
              }`}
            >
              المستخدمين
            </button>
            <button
              onClick={() => setTab('activity')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === 'activity'
                  ? 'bg-gradient-to-r from-balbaa-primary to-balbaa-secondary text-white shadow-lg'
                  : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
              }`}
            >
              سجل النشاط
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">جاري التحميل...</div>
          ) : tab === 'users' ? (
            <UsersTable
              users={users}
              companies={companies}
              access={access}
              onManage={(u: UserProfile) => setSelectedUser(u)}
            />
          ) : (
            <ActivityTable logs={logs} users={users} companies={companies} />
          )}
        </main>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <ManageUserModal
            user={selectedUser}
            companies={companies}
            hasAccess={hasAccess}
            onToggle={(cid: string) => toggleAccess(selectedUser.id, cid)}
            onGrantAll={() => grantAll(selectedUser.id)}
            onRevokeAll={() => revokeAll(selectedUser.id)}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AdminStat({ icon, label, value, color }: any) {
  const colors: any = {
    blue: 'from-blue-50 to-blue-100/50 border-blue-200/60 text-blue-600',
    purple: 'from-purple-50 to-purple-100/50 border-purple-200/60 text-purple-600',
    green: 'from-emerald-50 to-emerald-100/50 border-emerald-200/60 text-emerald-600',
    orange: 'from-orange-50 to-orange-100/50 border-orange-200/60 text-orange-600',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4 md:p-5 shadow-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center">
          <div className="w-4 h-4">{icon}</div>
        </div>
        <div className={`text-2xl md:text-3xl font-black ${colors[color].split(' ').pop()}`}>
          {value}
        </div>
      </div>
      <div className="text-xs text-slate-600 font-semibold">{label}</div>
    </motion.div>
  )
}

function UsersTable({ users, access, onManage }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-4 font-bold text-slate-700">المستخدم</th>
              <th className="text-right p-4 font-bold text-slate-700 hidden md:table-cell">الدور</th>
              <th className="text-right p-4 font-bold text-slate-700 hidden md:table-cell">الشركات</th>
              <th className="text-right p-4 font-bold text-slate-700">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => {
              const userAccessCount = access.filter((a: any) => a.user_id === u.id).length
              return (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-balbaa-primary to-balbaa-secondary flex items-center justify-center text-white font-bold text-sm">
                        {u.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{u.username}</div>
                        <div className="text-xs text-slate-400">{u.full_name || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.role === 'admin' ? '👑 ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-bold">
                      {userAccessCount} شركة
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onManage(u)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-balbaa-primary text-white font-bold hover:bg-balbaa-dark transition"
                    >
                      إدارة الصلاحيات
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function ManageUserModal({
  user,
  companies,
  hasAccess,
  onToggle,
  onGrantAll,
  onRevokeAll,
  onClose,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-balbaa-primary to-balbaa-secondary flex items-center justify-center text-white font-black text-xl">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-black text-slate-800">{user.username}</div>
              <div className="text-xs text-slate-500">{user.full_name || 'بدون اسم'}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2">
          <button
            onClick={onGrantAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
          >
            <Check className="w-3.5 h-3.5" />
            منح كل الشركات
          </button>
          <button
            onClick={onRevokeAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            إزالة كل الصلاحيات
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-500 self-center">
            {companies.filter((c: any) => hasAccess(user.id, c.id)).length} / {companies.length} شركة
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {companies.map((c: any) => {
              const has = hasAccess(user.id, c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => onToggle(c.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition text-right ${
                    has
                      ? 'bg-blue-50 border-balbaa-secondary'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-slate-800">{c.name}</div>
                    {c.name_ar && (
                      <div className="text-xs text-slate-500">{c.name_ar}</div>
                    )}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                      has ? 'bg-balbaa-secondary text-white' : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    {has && <Check className="w-4 h-4" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ActivityTable({ logs, users, companies }: any) {
  const getUserName = (id: string) => users.find((u: any) => u.id === id)?.username || '—'
  const getCompanyName = (id: string) => companies.find((c: any) => c.id === id)?.name || '—'

  const actionLabels: any = {
    view_page: '👁️ فتح صفحة',
    print_attempt: '🖨️ محاولة طباعة',
    view_company: '📂 فتح شركة',
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <div className="text-slate-400">لا يوجد نشاط مسجل بعد</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-4 font-bold text-slate-700">المستخدم</th>
              <th className="text-right p-4 font-bold text-slate-700">الإجراء</th>
              <th className="text-right p-4 font-bold text-slate-700 hidden md:table-cell">الشركة</th>
              <th className="text-right p-4 font-bold text-slate-700 hidden md:table-cell">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 50).map((log: any) => (
              <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">{getUserName(log.user_id)}</td>
                <td className="p-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-bold">
                    {actionLabels[log.action] || log.action}
                  </span>
                </td>
                <td className="p-4 hidden md:table-cell text-slate-600">
                  {getCompanyName(log.company_id)}
                </td>
                <td className="p-4 hidden md:table-cell text-xs text-slate-400">
                  {new Date(log.created_at).toLocaleString('ar-EG')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}