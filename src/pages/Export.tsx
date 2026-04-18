import { useEffect, useState } from 'react'
import { getAllEntries, getProfile } from '../db'
import type { Entry, Profile } from '../db'
import { exportPlainText, exportPDF } from '../lib/export'
import { monthName } from '../lib/dateUtils'

export default function ExportPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [allEntries, setAllEntries] = useState<Entry[]>([])
  const [mode, setMode]   = useState<'week' | 'month'>('month')
  const [weekNum, setWeekNum] = useState(1)
  const [month, setMonth]   = useState(new Date().getMonth() + 1)
  const [year, setYear]     = useState(new Date().getFullYear())
  const [exporting, setExporting] = useState(false)
  const [plainText, setPlainText] = useState('')
  const [showText, setShowText]   = useState(false)

  useEffect(() => {
    async function load() {
      const [p, e] = await Promise.all([getProfile(), getAllEntries()])
      setProfile(p ?? null)
      setAllEntries(e)
      if (p) {
        const { weekNumberFromStart } = await import('../lib/dateUtils')
        const today = new Date().toISOString().split('T')[0]
        setWeekNum(weekNumberFromStart(p.startDate, today))
      }
    }
    load()
  }, [])

  function filteredEntries(): Entry[] {
    if (mode === 'week') return allEntries.filter(e => e.weekNumber === weekNum)
    return allEntries.filter(e => {
      const [y, m] = e.date.split('-').map(Number)
      return y === year && m === month
    })
  }

  function label(): string {
    return mode === 'week' ? `Week ${weekNum}` : `${monthName(month)} ${year}`
  }

  async function handlePDF() {
    if (!profile) return
    const entries = filteredEntries()
    if (!entries.length) return alert('No entries for this period.')
    setExporting(true)
    await exportPDF(entries, profile, label())
    setExporting(false)
  }

  function handleText() {
    if (!profile) return
    const entries = filteredEntries()
    if (!entries.length) return alert('No entries for this period.')
    const text = exportPlainText(entries, profile, label())
    setPlainText(text)
    setShowText(true)
  }

  const count = filteredEntries().length

  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA] page-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-5 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Print Ready</p>
        <h2 className="text-2xl font-black text-[#0D0D0D]">Export</h2>
        <p className="text-sm text-gray-400 mt-1">Generate your logbook for the physical book</p>
      </div>

      <div className="flex-1 px-4 pt-5 pb-28 flex flex-col gap-4">
        {/* Mode selector */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5">
          <p className="text-sm font-bold text-[#0D0D0D] mb-3">Export by</p>
          <div className="flex gap-2">
            {(['week', 'month'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  mode === m ? 'bg-[#FF2D78] text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {m === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Period picker */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5">
          <p className="text-sm font-bold text-[#0D0D0D] mb-3">Select Period</p>

          {mode === 'week' ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setWeekNum(w => Math.max(1, w - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <p className="flex-1 text-center text-xl font-black text-[#0D0D0D]">Week {weekNum}</p>
              <button
                onClick={() => setWeekNum(w => w + 1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <p className="flex-1 text-center text-base font-black text-[#0D0D0D]">{monthName(month)} {year}</p>
              <button
                onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          )}

          <p className="text-xs text-center text-gray-400 mt-3">
            {count} entr{count !== 1 ? 'ies' : 'y'} for {label()}
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePDF}
            disabled={exporting || count === 0}
            className="flex items-center gap-4 bg-[#0D0D0D] rounded-3xl p-5 text-left disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FF2D78] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Export as PDF</p>
              <p className="text-gray-400 text-xs mt-0.5">Formatted logbook — print and copy to your book</p>
            </div>
          </button>

          <button
            onClick={handleText}
            disabled={count === 0}
            className="flex items-center gap-4 bg-white rounded-3xl p-5 text-left border border-gray-100 disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="17" y1="18" x2="3" y2="18"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#0D0D0D] text-sm">Plain Text List</p>
              <p className="text-gray-400 text-xs mt-0.5">Quick copy-paste of all entries</p>
            </div>
          </button>
        </div>
      </div>

      {/* Plain text modal */}
      {showText && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowText(false)}>
          <div
            className="bg-white w-full max-w-[480px] mx-auto rounded-t-3xl p-6 max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-[#0D0D0D]">Plain Text — {label()}</p>
              <button onClick={() => setShowText(false)} className="text-gray-400">✕</button>
            </div>
            <pre className="text-xs text-gray-600 overflow-y-auto flex-1 bg-gray-50 rounded-2xl p-4 whitespace-pre-wrap leading-relaxed font-mono">
              {plainText}
            </pre>
            <button
              onClick={() => { navigator.clipboard?.writeText(plainText); setShowText(false) }}
              className="mt-4 w-full py-3.5 rounded-2xl bg-[#FF2D78] text-white font-bold text-sm"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
