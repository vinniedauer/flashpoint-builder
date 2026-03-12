import { useRef, useState, useEffect } from 'react'

interface Props {
  onDelete: () => void
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  revealWidth?: number
}

export default function SwipeToDelete({ onDelete, children, className = '', style, revealWidth = 72 }: Props) {
  const [tx, setTx] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [hovered, setHovered] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const startTx = useRef(0)
  const active = useRef(false)
  const horizontal = useRef<boolean | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e: TouchEvent) => {
      if (!active.current) return
      const dx = e.touches[0].clientX - startX.current
      const dy = e.touches[0].clientY - startY.current
      if (horizontal.current === null) {
        horizontal.current = Math.abs(dx) > Math.abs(dy)
      }
      if (!horizontal.current) { active.current = false; return }
      e.preventDefault()
      const raw = startTx.current + dx
      setTx(Math.min(0, Math.max(-(revealWidth + 24), raw)))
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [revealWidth])

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    startTx.current = tx
    active.current = true
    horizontal.current = null
    setTransitioning(false)
  }

  const handleTouchEnd = () => {
    active.current = false
    horizontal.current = null
    setTransitioning(true)
    setTx(tx < -(revealWidth / 2) ? -revealWidth : 0)
  }

  const close = () => {
    setTransitioning(true)
    setTx(0)
  }

  const handleDelete = () => {
    close()
    onDelete()
  }

  const showSwipeOverlay = tx < -8

  return (
    // Outer wrapper: relative + overflow visible so the desktop button can sit outside
    <div
      className={`relative ${className}`}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Inner: overflow hidden clips the swipe animation */}
      <div ref={containerRef} className="relative overflow-hidden">
        {/* Mobile: absolute delete zone behind content, revealed by translateX */}
        <div
          className="touch-only absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center gap-1 select-none cursor-pointer"
          style={{ width: revealWidth, background: 'linear-gradient(135deg, #C0392B, #96281b)', borderRadius: '0 8px 8px 0' }}
          onClick={handleDelete}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: 'inherit', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            Delete
          </span>
        </div>

        {/* Sliding content */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(${tx}px)`,
            transition: transitioning ? 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
            willChange: 'transform',
          }}
        >
          {children}
        </div>

        {/* Mobile tap-to-close overlay when swiped open */}
        {showSwipeOverlay && (
          <div
            className="touch-only absolute inset-0 z-10"
            style={{ right: revealWidth }}
            onClick={close}
          />
        )}
      </div>

      {/* Desktop: trash button floats outside the card to the right */}
      <button
        className="hover-only absolute top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-1 rounded-lg cursor-pointer"
        style={{
          left: 'calc(100% + 8px)',
          width: 48,
          height: 'calc(100% - 4px)',
          background: 'linear-gradient(135deg, #C0392B, #96281b)',
          opacity: hovered ? 1 : 0,
          transform: `translateY(-50%) translateX(${hovered ? 0 : -6}px)`,
          transition: 'opacity 0.2s, transform 0.2s',
          pointerEvents: hovered ? 'auto' : 'none',
        }}
        onClick={handleDelete}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          Del
        </span>
      </button>
    </div>
  )
}
