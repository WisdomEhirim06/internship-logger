import { useEffect, useState } from 'react'
import { getAllEntries, getProfile } from '../db'
import type { Entry, Profile } from '../db'
import { getMissingWorkdays, formatDisplay, weekdayName } from '../lib/dateUtils'

interface Props { onNavigate: (page: string, date?: string) => void }

export default function History({ onNavigate }: Props) {
  const [entries, setEntries]   = useState<Entry[]>([])
  const [missing, setMissing]   = useState<string[]>([])
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [tab, setTab]           = useState<'logged' | 'missing'>('logged')

  useEffect(() => {
    async function load() {
      const p = await getProfile()
      if (!p) return
      setProfile(p)
      const all = await getAllEntries()
      setEntries(all.reverse())
      setMissing(getMissingWorkdays(p.startDate, all))
    }
    load()
  }, [])

  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA] page-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-5 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Logbook</p>
        <h2 className="text-2xl font-black text-[#0D0D0D]">History</h2>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <TabBtn active={tab === 'logged'} onClick={() => setTab('logged')}>
            Logged ({entries.length})
          </TabBtn>
          <TabBtn active={tab === 'missing'} onClick={() => setTab('missing')} danger={missing.length > 0}>
            Missing ({missing.length})
          </TabBtn>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-28 overflow-y-auto">
        {tab === 'logged' && (
          entries.length === 0 ? (
            <EmptyState
              title="No entries yet"
              sub="Start logging your daily activities to see them here."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => onNavigate('entry', entry.date)}
                  className="bg-white rounded-2xl p-4 border border-gray-100 text-left active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      {weekdayName(entry.date)}, Wk {entry.weekNumber}
                    </span>
                    <span className="text-xs text-gray-300">{formatDisplay(entry.date)}</span>
                  </div>
                  <p className="text-sm text-[#0D0D0D] leading-relaxed">{entry.summary}</p>
                  <p className="text-xs text-[#FF2D78] font-semibold mt-2">Edit →</p>
                </button>
              ))}
            </div>
          )
        )}

        {tab === 'missing' && (
          missing.length === 0 ? (
            <EmptyState
              title="All caught up!"
              sub="You have no missing entries. Keep up the good work."
              positive
            />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 mb-1">
                <p className="text-sm font-bold text-[#FF2D78]">
                  {missing.length} day{missing.length !== 1 ? 's' : ''} without an entry
                </p>
                <p className="text-xs text-pink-400 mt-0.5">
                  You can backfill up to 7 days back. Tap any day to log it.
                </p>
              </div>
              {missing.map(date => {
                const canBackfill = isWithin7Days(date)
                return (
                  <button
                    key={date}
                    onClick={() => canBackfill ? onNavigate('entry', date) : undefined}
                    disabled={!canBackfill}
                    className={`bg-white rounded-2xl p-4 border text-left transition-all ${
                      canBackfill
                        ? 'border-gray-100 active:scale-[0.98] hover:border-pink-200'
                        : 'border-gray-100 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#0D0D0D]">{weekdayName(date)}</p>
                        <p className="text-xs text-gray-400">{formatDisplay(date)}</p>
                      </div>
                      {canBackfill ? (
                        <span className="text-xs font-bold text-[#FF2D78] bg-pink-50 px-3 py-1.5 rounded-full">
                          Log →
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">Too old</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function isWithin7Days(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  return diff <= 7
}

function TabBtn({ active, onClick, children, danger = false }: {
  active: boolean; onClick: () => void; children: React.ReactNode; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
        active
          ? danger
            ? 'bg-red-500 text-white'
            : 'bg-[#FF2D78] text-white'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyState({ title, sub, positive = false }: { title: string; sub: string; positive?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center px-8">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
        positive ? 'bg-green-50' : 'bg-gray-50'
      }`}>
        {positive ? '✓' : '📋'}
      </div>
      <p className="text-base font-bold text-[#0D0D0D]">{title}</p>
      <p className="text-sm text-gray-400 leading-relaxed">{sub}</p>
    </div>
  )
}
