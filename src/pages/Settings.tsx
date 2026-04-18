import { useEffect, useState } from 'react'
import { getProfile, saveProfile } from '../db'
import type { Profile } from '../db'

export default function Settings({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState<Partial<Profile>>({})
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    getProfile().then(p => { if (p) { setProfile(p); setForm(p) } })
  }, [])

  const set = (k: keyof Profile, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    await saveProfile({ ...profile, ...form } as Omit<Profile, 'id'>)
    const updated = await getProfile()
    setProfile(updated ?? null)
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return null

  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA] page-enter">
      <div className="bg-white px-6 pt-14 pb-5 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-1 text-[#FF2D78] text-sm font-semibold mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Preferences</p>
            <h2 className="text-2xl font-black text-[#0D0D0D]">Settings</h2>
          </div>
          {saved && <span className="text-xs text-green-500 font-bold">Saved ✓</span>}
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-28 flex flex-col gap-4 overflow-y-auto">
        {/* Profile card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 bg-[#0D0D0D] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FF2D78] flex items-center justify-center">
              <span className="text-white font-black text-lg">
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-bold text-base">{profile.name}</p>
              <p className="text-gray-400 text-xs">{profile.matricNo} · {profile.department}</p>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[#0D0D0D]">Profile Details</p>
              <button
                onClick={() => setEditing(e => !e)}
                className="text-xs text-[#FF2D78] font-semibold"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <div className="flex flex-col gap-3">
                {([
                  ['name', 'Full Name'],
                  ['matricNo', 'Matric Number'],
                  ['department', 'Department'],
                  ['institution', 'Institution'],
                  ['organization', 'Organization'],
                  ['supervisor', 'Supervisor'],
                  ['sectionBased', 'Section Based'],
                  ['startDate', 'Start Date', 'date'],
                  ['endDate', 'End Date', 'date'],
                ] as [keyof Profile, string, string?][]).map(([k, label, type]) => (
                  <div key={k} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
                    <input
                      type={type ?? 'text'}
                      value={(form[k] as string) ?? ''}
                      onChange={e => set(k, e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50
                                 focus:outline-none focus:border-[#FF2D78] focus:ring-2 focus:ring-pink-100"
                    />
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-2 py-3.5 rounded-2xl bg-[#FF2D78] text-white font-bold text-sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  ['Institution', profile.institution],
                  ['Organization', profile.organization],
                  ['Supervisor', profile.supervisor],
                  ['Section', profile.sectionBased],
                  ['Start Date', profile.startDate],
                  ['End Date', profile.endDate],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">{label}</span>
                    <span className="text-sm text-[#0D0D0D] text-right">{value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5">
          <p className="text-sm font-bold text-[#0D0D0D] mb-1">Reminders</p>
          <p className="text-xs text-gray-400 mb-4">Notifications fire at 5pm, 7pm, and 9pm if you haven't logged yet.</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D]">Daily Reminders</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {profile.notificationEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <button
              onClick={async () => {
                const enabled = !profile.notificationEnabled
                if (enabled && Notification.permission !== 'granted') {
                  const res = await Notification.requestPermission()
                  if (res !== 'granted') return
                }
                const updated = { ...profile, notificationEnabled: enabled }
                await saveProfile(updated)
                setProfile(updated)
                setForm(updated)
              }}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                profile.notificationEnabled ? 'bg-[#FF2D78]' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                profile.notificationEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* App info */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 text-center">
          <p className="text-2xl font-black text-[#FF2D78]">Logger</p>
          <p className="text-xs text-gray-400 mt-1">SIWES Logbook Companion · v1.0</p>
          <p className="text-xs text-gray-300 mt-1">Data stored on your device only. Never shared.</p>
        </div>
      </div>
    </div>
  )
}
