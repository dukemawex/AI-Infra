interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

interface Props {
  active: string
  onNavigate: (id: string) => void
}

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)

const AssetsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="8" height="8" rx="1" />
    <rect x="14" y="3" width="8" height="8" rx="1" />
    <rect x="2" y="13" width="8" height="8" rx="1" />
    <rect x="14" y="13" width="8" height="8" rx="1" />
  </svg>
)

const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { id: 'map',      label: 'Command Map', icon: <MapIcon /> },
  { id: 'assets',   label: 'Assets',      icon: <AssetsIcon /> },
  { id: 'reports',  label: 'Reports',     icon: <ReportsIcon /> },
  { id: 'settings', label: 'Settings',    icon: <SettingsIcon /> },
]

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside
      className="flex h-full w-16 flex-col items-center border-r py-4 gap-1"
      style={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Logo mark */}
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="flex flex-1 flex-col gap-1 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              title={item.label}
              onClick={() => onNavigate(item.id)}
              className="group relative flex h-10 w-full items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: isActive ? 'rgba(59,130,246,0.18)' : 'transparent',
                color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.4)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
              }}
            >
              {item.icon}
              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute right-0 top-2 bottom-2 w-0.5 rounded-l"
                  style={{ backgroundColor: '#60a5fa' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
