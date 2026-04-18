import { useEffect, useState } from 'react'
import { getEntry, saveEntry, getProfile } from '../db'
import { generateSummary } from '../lib/templates'
import { today, weekNumberFromStart, weekdayName, formatDisplay } from '../lib/dateUtils'

interface Props {
  date?: string
  onSaved: () => void
  onBack: () => void
}

export default function DailyEntry({ date = today(), onSaved, onBack }: Props) {
  const [task, setTask]       = useState('')
  const [outcome, setOutcome] = useState('')
  const [learning, setLearning] = useState('')
  const [preview, setPreview]   = useState('')
  const [templateIdx, setTemplateIdx] = useState(0)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [existing, setExisting] = useState(false)

  useEffect(() => {
    async function load() {
      const e = await getEntry(date)
      if (e) {
        setTask(e.task); setOutcome(e.outcome); setLearning(e.learning)
        setPreview(e.summary); setTemplateIdx(e.templateUsed)
        setExisting(true)
      } else {
        setTemplateIdx(Math.floor(Math.random() * 3))
      }
    }
    load()
  }, [date])

  useEffect(() => {
    if (task.trim() && outcome.trim() && learning.trim()) {
      const { summary } = generateSummary(task, outcome, learning, templateIdx)
      setPreview(summary)
    } else {
      setPreview('')
    }
  }, [task, outcome, learning, templateIdx])

  const canSave = task.trim().length >= 5 && outcome.trim().length >= 5 && learning.trim().length >= 5

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    const profile = await getProfile()
    const weekNumber = profile ? weekNumberFromStart(profile.startDate, date) : 1
    const { summary, templateUsed } = generateSummary(task, outcome, learning, templateIdx)
    await saveEntry({
      date, weekNumber, task, outcome, learning,
      summary, templateUsed, createdAt: Date.now()
    })
    setSaving(false)
    setSaved(true)
    setTimeout(onSaved, 800)
  }

  const dayName = weekdayName(date)
  const isToday = date === today()

  return (
    <div className="flex flex-col min-h-dvh bg-white page-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-5 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-1 text-[#FF2D78] text-sm font-semibold mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {isToday ? 'Today' : 'Backfill'}
            </p>
            <h2 className="text-xl font-black text-[#0D0D0D] mt-0.5">{dayName}</h2>
            <p className="text-sm text-gray-400">{formatDisplay(date)}</p>
          </div>
          {existing && (
            <span className="text-xs bg-pink-50 text-[#FF2D78] font-semibold px-3 py-1 rounded-full border border-pink-100">
              Editing
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-32 flex flex-col gap-5 overflow-y-auto">
        <EntryField
          label="What task did you work on?"
          hint="Be specific — what exactly did you do?"
          value={task}
          onChange={setTask}
          minLength={5}
          placeholder="e.g. Assisted in routing electrical conduits on the second floor"
        />
        <EntryField
          label="What was the outcome?"
          hint="What was completed or achieved?"
          value={outcome}
          onChange={setOutcome}
          minLength={5}
          placeholder="e.g. Successfully completed 60% of the floor's electrical routing"
        />
        <EntryField
          label="What did you learn?"
          hint="A skill, concept, or insight you gained"
          value={learning}
          onChange={setLearning}
          minLength={5}
          placeholder="e.g. How to calculate cable load for a three-phase circuit"
        />

        {/* Preview */}
        {preview && (
          <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-[#FF2D78] uppercase tracking-wider">Logbook Summary</p>
              <button
                onClick={() => setTemplateIdx(i => (i + 1) % 3)}
                className="text-xs text-[#FF2D78] font-semibold border border-pink-200 px-2 py-0.5 rounded-full"
              >
                Rephrase
              </button>
            </div>
            <p className="text-sm text-[#0D0D0D] leading-relaxed italic">"{preview}"</p>
            <p className="text-[10px] text-pink-300 mt-2">This exact line goes into your physical logbook.</p>
          </div>
        )}

        {/* Validation hint */}
        {!canSave && (task || outcome || learning) && (
          <p className="text-xs text-gray-400 text-center">Each field needs at least 5 characters</p>
        )}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 pb-8 pt-4 bg-white border-t border-gray-50">
        <button
          onClick={handleSave}
          disabled={!canSave || saving || saved}
          className={`w-full py-4 rounded-2xl text-white text-base font-bold transition-all duration-200 ${
            saved
              ? 'bg-green-500'
              : canSave
              ? 'bg-[#FF2D78] active:scale-[0.98] shadow-lg shadow-pink-200'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {saved ? '✓ Saved!' : saving ? 'Saving...' : existing ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </div>
  )
}

function EntryField({
  label, hint, value, onChange, placeholder, minLength = 0
}: {
  label: string; hint: string; value: string
  onChange: (v: string) => void; placeholder: string; minLength?: number
}) {
  const ok = value.trim().length >= minLength
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-[#0D0D0D]">{label}</label>
      <p className="text-xs text-gray-400 -mt-1">{hint}</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`w-full px-4 py-3.5 rounded-2xl border text-sm text-[#0D0D0D] resize-none
                    focus:outline-none focus:ring-2 focus:ring-pink-100 placeholder:text-gray-300
                    transition-all bg-gray-50 leading-relaxed ${
          value && !ok
            ? 'border-orange-200 focus:border-orange-300'
            : value && ok
            ? 'border-green-200 focus:border-[#FF2D78]'
            : 'border-gray-200 focus:border-[#FF2D78]'
        }`}
      />
    </div>
  )
}
