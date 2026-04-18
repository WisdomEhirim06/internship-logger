import { useEffect, useState } from 'react'
import { getEntriesForWeek, getProfile, getWeekMeta, saveWeekMeta } from '../db'
import type { Entry, Profile } from '../db'
import { weekNumberFromStart, getWeekRange, weekdayName, formatDisplay } from '../lib/dateUtils'
import { today } from '../lib/dateUtils'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Props { onNavigate: (page: string, date?: string) => void }

export default function Weekly({ onNavigate }: Props) {
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [weekNum, setWeekNum]   = useState(1)
  const [maxWeek, setMaxWeek]   = useState(1)
  const [entries, setEntries]   = useState<Entry[]>([])
  const [project, setProject]   = useState('')
  const [section, setSection]   = useState('')
  const [editMeta, setEditMeta] = useState(false)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    async function load() {
      const p = await getProfile()
      if (!p) return
      setProfile(p)
      const cur = weekNumberFromStart(p.startDate, today())
      setWeekNum(cur)
      setMaxWeek(cur)
    }
    load()
  }, [])

  useEffect(() => {
    if (!profile) return
    async function loadWeek() {
      const [ents, meta] = await Promise.all([
        getEntriesForWeek(weekNum),
        getWeekMeta(weekNum),
      ])
      setEntries(ents)
      setProject(meta?.projectForWeek ?? '')
      setSection(meta?.sectionBased ?? profile!.sectionBased ?? '')
    }
    loadWeek()
  }, [weekNum, profile])

  async function saveMeta() {
    setSaving(true)
    await saveWeekMeta({ weekNumber: weekNum, projectForWeek: project, sectionBased: section })
    setSaving(false)
    setEditMeta(false)
  }

  const range = profile ? getWeekRange(profile.startDate, weekNum) : null

  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA] page-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-5 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly View</p>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#0D0D0D]">Week {weekNum}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekNum(w => Math.max(1, w - 1))}
              disabled={weekNum <= 1}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={() => setWeekNum(w => Math.min(maxWeek, w + 1))}
              disabled={weekNum >= maxWeek}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
        {range && (
          <p className="text-sm text-gray-400 mt-1">
            {formatDisplay(range.from)} — {formatDisplay(range.to)}
          </p>
        )}
      </div>

      <div className="flex-1 px-4 pt-5 pb-28 flex flex-col gap-4 overflow-y-auto">
        {/* SECTION IV header card */}
        <div className="rounded-3xl bg-white border border-gray-100">
          <div className="bg-pink-50 px-5 py-3 border-b border-pink-100 rounded-t-3xl">
            <p className="text-[10px] font-bold text-[#FF2D78] uppercase tracking-widest">Section IV</p>
            <p className="text-sm font-bold text-[#0D0D0D]">Student's Daily Record of Activities</p>
          </div>

          <div className="divide-y divide-gray-50">
            {DAYS.map(day => {
              const entry = entries.find(e => weekdayName(e.date).toLowerCase() === day.toLowerCase())
              const entryDate = range
                ? (() => {
                    const from = new Date(range.from + 'T00:00:00')
                    const dayIdx = DAYS.indexOf(day)
                    const d = new Date(from)
                    d.setDate(from.getDate() + dayIdx)
                    return d.toISOString().split('T')[0]
                  })()
                : null

              return (
                <div key={day} className="px-5 py-3.5 flex items-start gap-3">
                  <span className="text-xs font-black text-gray-400 w-20 shrink-0 uppercase pt-0.5">{day.slice(0, 3)}</span>
                  {entry ? (
                    <p className="text-sm text-[#0D0D0D] leading-relaxed flex-1">{entry.summary}</p>
                  ) : (
                    <button
                      onClick={() => entryDate && onNavigate('entry', entryDate)}
                      className="text-sm text-gray-300 italic flex-1 text-left hover:text-[#FF2D78] transition-colors"
                    >
                      {entryDate ? 'Tap to log →' : '—'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Week metadata */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-[#0D0D0D]">Week Details</p>
            <button
              onClick={() => setEditMeta(e => !e)}
              className="text-xs text-[#FF2D78] font-semibold"
            >
              {editMeta ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editMeta ? (
            <div className="flex flex-col gap-3">
              <MetaField label="Project for the Week" value={project} onChange={setProject} placeholder="Any ongoing project this week?" />
              <MetaField label="Section in which student is based" value={section} onChange={setSection} placeholder="e.g. IT Unit" />
              <button
                onClick={saveMeta}
                disabled={saving}
                className="mt-1 py-3 rounded-2xl bg-[#FF2D78] text-white text-sm font-bold"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <InfoRow label="Project for the week" value={project || '—'} />
              <InfoRow label="Section based" value={section || '—'} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0D0D0D] bg-gray-50
                   focus:outline-none focus:border-[#FF2D78] focus:ring-2 focus:ring-pink-100"
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-sm text-[#0D0D0D] mt-0.5">{value}</p>
    </div>
  )
}
