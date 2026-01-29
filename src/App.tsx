import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PinEntry } from './components/PinEntry'
import { InspectionCalendar } from './components/InspectionCalendar'
import type { CompanyCode } from './types'
import { cn } from './lib/utils'
import {
  ClipboardCheck,
  LogOut,
  Building2,
  Factory,
  LayoutGrid,
} from 'lucide-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [company, setCompany] = useState<CompanyCode | 'all'>('all')

  // Check for existing PIN on mount
  useEffect(() => {
    const savedPin = localStorage.getItem('qc_dashboard_pin')
    if (savedPin) {
      // Verify the saved PIN is still valid
      fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: savedPin }),
      })
        .then(res => {
          if (res.ok) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('qc_dashboard_pin')
          }
        })
        .catch(() => {
          localStorage.removeItem('qc_dashboard_pin')
        })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('qc_dashboard_pin')
    setIsAuthenticated(false)
    queryClient.clear()
  }

  if (!isAuthenticated) {
    return <PinEntry onSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">QC Dashboard</h1>
              <p className="text-xs text-slate-500">Inspection Calendar & Documentation</p>
            </div>
          </div>

          {/* Company Tabs */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setCompany('all')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                company === 'all'
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => setCompany('EMPL')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                company === 'EMPL'
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Building2 className="w-4 h-4" />
              EMPL
            </button>
            <button
              onClick={() => setCompany('EHI')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                company === 'EHI'
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Factory className="w-4 h-4" />
              EHI
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <InspectionCalendar company={company} />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
