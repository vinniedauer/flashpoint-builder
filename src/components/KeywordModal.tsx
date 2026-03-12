interface Props {
  name: string
  description: string
  factionColor: string
  onClose: () => void
}

export default function KeywordModal({ name, description, factionColor, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm anim-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface border border-border rounded-2xl p-6 anim-fade-up shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className="font-display font-bold text-base uppercase tracking-widest"
            style={{ color: factionColor }}
          >
            {name}
          </span>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-2xl leading-none font-light flex-shrink-0 -mt-0.5"
          >
            ×
          </button>
        </div>
        <p className="font-display text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
