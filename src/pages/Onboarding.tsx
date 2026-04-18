import { useState } from 'react'
import { saveProfile } from '../db'
import type { Profile } from '../db'

interface Props { onDone: () => void }

const STEPS = ['Personal', 'Placement', 'Dates']

export default function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', matricNo: '', department: '', institution: 'FUTO',
    organization: '', supervisor: '', sectionBased: '',
    startDate: '', endDate: '', notificationEnabled: true,
  })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.matricNo.trim() && form.department.trim()
    if (step === 1) return form.organization.trim() && form.supervisor.trim()
    if (step === 2) return form.startDate && form.endDate
    return false
  }

  async function finish() {
    setSaving(true)
    await saveProfile(form as Omit<Profile, 'id'>)
    if (form.notificationEnabled && 'Notification' in window) {
      await Notification.requestPermission()
    }
    onDone()
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Pink header */}
      <div className="bg-[#FF2D78] px-6 pt-14 pb-10">
        <p className="text-pink-100 text-sm font-medium mb-1 tracking-widest uppercase">Welcome to</p>
        <h1 className="text-white text-4xl font-black tracking-tight">Logger</h1>
        <p className="text-pink-100 text-sm mt-2">Your SIWES logbook companion. Set up once, log daily.</p>

        {/* Step dots */}
        <div className="flex gap-2 mt-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i <= step ? 'bg-white text-[#FF2D78]' : 'bg-pink-400 text-pink-100'
              }`}>{i + 1}</div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 ${i < step ? 'bg-white' : 'bg-pink-400'}`} />
              )}
            </div>
          ))}
          <span className="text-pink-100 text-sm ml-2 self-center">{STEPS[step]}</span>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-28 flex flex-col gap-5 page-enter">
        {step === 0 && (
          <>
            <Field label="Full Name" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Emeka Okafor" />
            <Field label="Matric Number" value={form.matricNo} onChange={v => set('matricNo', v)} placeholder="e.g. 2020/1/12345EA" />
            <Field label="Department" value={form.department} onChange={v => set('department', v)} placeholder="e.g. Computer Science" />
            <Field label="Institution" value={form.institution} onChange={v => set('institution', v)} placeholder="e.g. FUTO" />
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Organization / Company" value={form.organization} onChange={v => set('organization', v)} placeholder="Where you're serving" />
            <Field label="Supervisor Name" value={form.supervisor} onChange={v => set('supervisor', v)} placeholder="Your workplace supervisor" />
            <Field label="Section / Department (at placement)" value={form.sectionBased} onChange={v => set('sectionBased', v)} placeholder="e.g. IT Unit, Engineering Dept." />
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Internship Start Date" value={form.startDate} onChange={v => set('startDate', v)} type="date" />
            <Field label="Internship End Date" value={form.endDate} onChange={v => set('endDate', v)} type="date" />

            {/* Notifications toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50 border border-pink-100">
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D]">Daily Reminders</p>
                <p className="text-xs text-gray-500 mt-0.5">5pm, 7pm and 9pm if not yet logged</p>
              </div>
              <button
                onClick={() => set('notificationEnabled', !form.notificationEnabled)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                  form.notificationEnabled ? 'bg-[#FF2D78]' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  form.notificationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer buttons */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-6 pb-8 pt-4 bg-white border-t border-gray-50">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500"
            >
              Back
            </button>
          )}
          <button
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : finish()}
            disabled={!canNext() || saving}
            className="flex-1 py-3.5 rounded-2xl bg-[#FF2D78] text-white text-sm font-bold disabled:opacity-40 transition-opacity"
          >
            {saving ? 'Saving...' : step < STEPS.length - 1 ? 'Continue' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text'
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-sm text-[#0D0D0D]
                   focus:outline-none focus:border-[#FF2D78] focus:ring-2 focus:ring-pink-100
                   placeholder:text-gray-300 transition-all bg-gray-50"
      />
    </div>
  )
}
