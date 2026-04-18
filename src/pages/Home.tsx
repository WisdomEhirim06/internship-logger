import { useEffect, useState } from 'react'
import { getAllEntries, getEntry, getProfile } from '../db'
import type { Profile, Entry } from '../db'
import { today, getMissingWorkdays, getCurrentStreak, daysUntilEnd, formatDisplay, getWorkdaysInRange } from '../lib/dateUtils'

interface Props {
  onNavigate: (page: string, date?: string) => void
  onSettings: () => void
}

export default function Home({ onNavigate, onSettings }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null)
  const [streak, setStreak] = useState(0)
  const [missing, setMissing] = useState<string[]>([])
  const [daysLeft, setDaysLeft] = useState(0)
  const [totalLogged, setTotalLogged] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getProfile()
      if (!p) return
      setProfile(p)

      const [entries, te] = await Promise.all([getAllEntries(), getEntry(today())])
      setTodayEntry(te ?? null)
      setStreak(getCurrentStreak(entries))
      setMissing(getMissingWorkdays(p.startDate, entries))
      setDaysLeft(daysUntilEnd(p.endDate))
      setTotalLogged(entries.length)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSkeleton />

  const firstName = profile?.name.split(' ')[0] ?? 'there'
  const todayStr  = today()
  const loggedToday = !!todayEntry

  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA] page-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-2xl font-black text-[#0D0D0D] mt-1">
              Hey, {firstName} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{profile?.organization}</p>
          </div>
          <button
            onClick={onSettings}
            className="mt-1 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-pink-50 hover:text-[#FF2D78] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-28 flex flex-col gap-4">
        {/* Today card */}
        <div
          onClick={() => onNavigate('entry', todayStr)}
          className={`rounded-3xl p-5 cursor-pointer transition-transform active:scale-[0.98] ${
            loggedToday
              ? 'bg-[#FF2D78]'
              : 'bg-[#0D0D0D]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${loggedToday ? 'text-pink-200' : 'text-gray-400'}`}>
                Today
              </p>
              <p className="text-white text-xl font-black mt-1">
                {loggedToday ? 'Day logged ✓' : "Log today's work"}
              </p>
              <p className={`text-sm mt-1 ${loggedToday ? 'text-pink-100' : 'text-gray-400'}`}>
                {loggedToday ? todayEntry!.summary : "Tap to fill in today's entry"}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              loggedToday ? 'bg-white/20' : 'bg-[#FF2D78]'
            }`}>
              <span className="text-white text-lg">{loggedToday ? '✓' : '+'}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            value={streak}
            label="Day Streak"
            sub={streak > 0 ? 'Keep it going!' : 'Start today'}
            accent={streak > 0}
            pulse={streak > 2}
          />
          <StatCard
            value={missing.length}
            label="Days Missing"
            sub={missing.length > 0 ? 'Fill them in' : 'All caught up!'}
            danger={missing.length > 0}
            onClick={() => onNavigate('history')}
          />
        </div>

        {/* Progress bar */}
        {profile && (
          <ProgressCard
            totalLogged={totalLogged}
            startDate={profile.startDate}
            endDate={profile.endDate}
            daysLeft={daysLeft}
          />
        )}

        {/* Missing days preview */}
        {missing.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#0D0D0D]">Missing Entries</p>
              <span className="text-xs font-semibold text-[#FF2D78] bg-pink-50 px-2 py-0.5 rounded-full">
                {missing.length} day{missing.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {missing.slice(0, 4).map(d => (
                <button
                  key={d}
                  onClick={() => onNavigate('entry', d)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-pink-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">{formatDisplay(d)}</span>
                  <span className="text-xs text-[#FF2D78] font-semibold">Log →</span>
                </button>
              ))}
              {missing.length > 4 && (
                <button onClick={() => onNavigate('history')}
                  className="text-xs text-center text-[#FF2D78] font-semibold py-2">
                  +{missing.length - 4} more — view all
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  value, label, sub, accent = false, danger = false, pulse = false, onClick
}: {
  value: number; label: string; sub: string
  accent?: boolean; danger?: boolean; pulse?: boolean; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl p-5 ${onClick ? 'cursor-pointer active:scale-[0.97] transition-transform' : ''} ${
        danger ? 'bg-white border border-red-100' : 'bg-white border border-gray-100'
      }`}
    >
      <p className={`text-4xl font-black ${
        danger ? 'text-red-500' : accent ? 'text-[#FF2D78]' : 'text-[#0D0D0D]'
      } ${pulse ? 'streak-pulse' : ''}`}>
        {value}
      </p>
      <p className="text-sm font-bold text-[#0D0D0D] mt-1">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function ProgressCard({
  totalLogged, startDate, endDate, daysLeft
}: {
  totalLogged: number; startDate: string; endDate: string; daysLeft: number
}) {
  const total = getWorkdaysInRange(startDate, endDate).length
  const pct   = total > 0 ? Math.min(100, Math.round((totalLogged / total) * 100)) : 0

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-[#0D0D0D]">Logbook Progress</p>
        <span className="text-xs text-gray-400">{daysLeft} days left</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FF2D78] rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">{totalLogged} logged</span>
        <span className="text-xs font-semibold text-[#FF2D78]">{pct}%</span>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA] px-4 pt-14 gap-4 animate-pulse">
      <div className="h-6 bg-gray-100 rounded-full w-48" />
      <div className="h-32 bg-gray-100 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 bg-gray-100 rounded-3xl" />
        <div className="h-28 bg-gray-100 rounded-3xl" />
      </div>
    </div>
  )
}
