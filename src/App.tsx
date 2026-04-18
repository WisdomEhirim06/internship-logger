import { useEffect, useState } from 'react'
import { getProfile, getEntry } from './db'
import { today } from './lib/dateUtils'
import { scheduleNotificationsViaSW } from './lib/notifications'
import BottomNav from './components/BottomNav'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import DailyEntry from './pages/DailyEntry'
import Weekly from './pages/Weekly'
import History from './pages/History'
import ExportPage from './pages/Export'
import Settings from './pages/Settings'

type Page = 'home' | 'entry' | 'weekly' | 'history' | 'export' | 'settings'

export default function App() {
  const [ready, setReady]           = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [page, setPage]             = useState<Page>('home')
  const [entryDate, setEntryDate]   = useState<string>(today())

  useEffect(() => {
    async function init() {
      const profile = await getProfile()
      setHasProfile(!!profile)
      setReady(true)
      if (profile) {
        const te = await getEntry(today())
        scheduleNotificationsViaSW(!!te)
      }
    }
    init()
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF2D78] flex items-center justify-center">
            <span className="text-white font-black text-xl">L</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasProfile) {
    return <Onboarding onDone={() => setHasProfile(true)} />
  }

  function navigate(p: string, date?: string) {
    if (p === 'entry') setEntryDate(date ?? today())
    setPage(p as Page)
  }

  const showNav = page !== 'entry' && page !== 'settings'

  return (
    <>
      {page === 'home'     && <Home onNavigate={navigate} onSettings={() => setPage('settings')} />}
      {page === 'entry'    && (
        <DailyEntry
          date={entryDate}
          onSaved={() => setPage('home')}
          onBack={() => setPage('home')}
        />
      )}
      {page === 'weekly'   && <Weekly onNavigate={navigate} />}
      {page === 'history'  && <History onNavigate={navigate} />}
      {page === 'export'   && <ExportPage />}
      {page === 'settings' && <Settings onBack={() => setPage('home')} />}

      {showNav && (
        <BottomNav
          current={page as 'home' | 'entry' | 'weekly' | 'history' | 'export'}
          onChange={(p) => {
            if (p === 'entry') setEntryDate(today())
            setPage(p)
          }}
        />
      )}
    </>
  )
}
