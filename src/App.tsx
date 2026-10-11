import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CompanyViewer from './pages/CompanyViewer'
import Admin from './pages/Admin'
import SplashScreen from './components/SplashScreen'

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="min-h-screen bg-balbaa-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-balbaa-secondary/30 border-t-balbaa-secondary rounded-full animate-spin" />
      </div>
    )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const seen = sessionStorage.getItem('balbaa-splash-seen')
    if (seen === '1') setShowSplash(false)
  }, [])

  const handleSplashFinish = () => {
    sessionStorage.setItem('balbaa-splash-seen', '1')
    setShowSplash(false)
  }

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/company/:id"
          element={
            <Protected>
              <CompanyViewer />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected>
              <Admin />
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  )
}