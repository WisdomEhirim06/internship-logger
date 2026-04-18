type Page = 'home' | 'entry' | 'weekly' | 'history' | 'export'

interface Props {
  current: Page
  onChange: (p: Page) => void
}

const tabs: { id: Page; label: string; icon: string }[] = [
  { id: 'home',    label: 'Home',    icon: HomeIcon },
  { id: 'entry',   label: 'Log',     icon: PenIcon },
  { id: 'weekly',  label: 'Week',    icon: CalIcon },
  { id: 'history', label: 'History', icon: ClockIcon },
  { id: 'export',  label: 'Export',  icon: ShareIcon },
]

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function PenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  )
}
function CalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

export default function BottomNav({ current, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(tab => {
          const active = current === tab.id
          const Icon = tab.icon as unknown as () => JSX.Element
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                active
                  ? 'text-[#FF2D78]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className={`transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
                <Icon />
              </span>
              <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-[#FF2D78]' : ''}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute -bottom-0 w-6 h-0.5 bg-[#FF2D78] rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
