import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function AuthButton() {
  const { user, loading, signIn, signUp, signOut } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signedUpMessage, setSignedUpMessage] = useState(false)

  if (loading) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    if (mode === 'signin') {
      const err = await signIn(email, password)
      if (err) setError(err)
      else setShowModal(false)
    } else {
      const err = await signUp(email, password)
      if (err) setError(err)
      else setSignedUpMessage(true)
    }

    setSubmitting(false)
  }

  const openModal = (m: 'signin' | 'signup') => {
    setMode(m)
    setEmail('')
    setPassword('')
    setError(null)
    setSignedUpMessage(false)
    setShowModal(true)
  }

  if (user) {
    const initials = (user.email ?? 'U')[0].toUpperCase()
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-surface-hi border border-border flex items-center justify-center font-mono text-xs text-text-secondary">
          {initials}
        </div>
        <span className="text-text-secondary font-display text-xs uppercase tracking-wider hidden sm:block max-w-[140px] truncate">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="text-text-muted hover:text-text-secondary font-display text-xs uppercase tracking-wider transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => openModal('signin')}
          className="px-3 py-1.5 rounded border border-border bg-surface-hi hover:bg-surface-hover text-text-secondary hover:text-text-primary font-display text-xs uppercase tracking-wider transition-all"
        >
          Sign in
        </button>
        <button
          onClick={() => openModal('signup')}
          className="px-3 py-1.5 rounded border border-border bg-surface-hi hover:bg-surface-hover text-text-secondary hover:text-text-primary font-display text-xs uppercase tracking-wider transition-all"
        >
          Sign up
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm anim-fade-in" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm mx-4 bg-surface border border-border rounded-2xl p-6 anim-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold uppercase tracking-widest text-text-primary">
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-primary text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {signedUpMessage ? (
              <div className="text-center py-4">
                <p className="text-text-primary font-display mb-2">Check your email!</p>
                <p className="text-text-secondary font-display text-sm">
                  We sent a confirmation link to <span className="text-text-primary">{email}</span>.
                  Click it to activate your account, then sign in.
                </p>
                <button
                  onClick={() => { setMode('signin'); setSignedUpMessage(false) }}
                  className="mt-4 text-text-secondary hover:text-text-primary font-display text-xs uppercase tracking-wider transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-text-secondary font-display mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-lg bg-surface-hi border border-border text-text-primary font-display text-sm focus:outline-none focus:border-text-secondary transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-text-secondary font-display mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg bg-surface-hi border border-border text-text-primary font-display text-sm focus:outline-none focus:border-text-secondary transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className="text-[#C0392B] font-display text-xs uppercase tracking-wider">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg font-display font-semibold uppercase tracking-wider text-sm text-white bg-[#3A7CA5] hover:bg-[#4a8cb5] disabled:opacity-50 transition-all"
                >
                  {submitting ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>

                <p className="text-center text-text-muted font-display text-xs">
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
