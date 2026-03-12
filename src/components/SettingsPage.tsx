import { useSettingsStore } from '../store/settingsStore'
import type { Theme, FontSize } from '../store/settingsStore'

const ACCENT = '#3A7CA5'

export default function SettingsPage() {
  const { theme, fontSize, setTheme, setFontSize } = useSettingsStore()

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-6 pb-4 border-b border-border flex-shrink-0">
        <h1 className="text-2xl font-display font-bold uppercase tracking-widest text-text-primary">
          Settings
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">

        {/* Theme */}
        <div className="mt-6 anim-fade-up" style={{ animationDelay: '60ms' }}>
          <p className="text-xs uppercase tracking-widest text-text-secondary font-display mb-3">
            Theme
          </p>
          <div className="flex gap-3">
            {(['dark', 'light'] as Theme[]).map((t) => {
              const active = theme === t
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="flex-1 py-4 rounded-lg border font-display font-semibold uppercase tracking-wider text-sm transition-all"
                  style={{
                    borderColor: active ? ACCENT : 'var(--color-input-border)',
                    backgroundColor: active ? ACCENT + '18' : 'var(--color-input-bg)',
                    color: active ? ACCENT : 'var(--color-inactive)',
                  }}
                >
                  <div className="flex items-center justify-center gap-2.5">
                    {t === 'dark' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    )}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Font Size */}
        <div className="mt-6 anim-fade-up" style={{ animationDelay: '120ms' }}>
          <p className="text-xs uppercase tracking-widest text-text-secondary font-display mb-3">
            Text Size
          </p>
          <div className="flex gap-3">
            {(['small', 'medium', 'large'] as FontSize[]).map((s, i) => {
              const active = fontSize === s
              const labels = ['Small', 'Medium', 'Large']
              const sizes = ['text-xs', 'text-sm', 'text-base']
              return (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className="flex-1 py-4 rounded-lg border font-display font-semibold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: active ? ACCENT : 'var(--color-input-border)',
                    backgroundColor: active ? ACCENT + '18' : 'var(--color-input-bg)',
                    color: active ? ACCENT : 'var(--color-inactive)',
                  }}
                >
                  <span className={sizes[i]}>{labels[i]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* About */}
        <div className="mt-8 anim-fade-up" style={{ animationDelay: '180ms' }}>
          <div className="bg-surface-hi border border-border rounded-lg px-4 py-4">
            <p className="text-xs uppercase tracking-widest text-text-secondary font-display mb-1">
              Flashpoint Builder
            </p>
            <p className="text-text-muted font-display text-xs leading-relaxed">
              Army list builder for Halo Flashpoint by Mantic Games. Unofficial fan tool.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
