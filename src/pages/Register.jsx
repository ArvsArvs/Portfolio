import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { signUp } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null) // null, 'signed-in' or 'confirm'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await signUp({ email, password, username })
      if (data?.session) {
        // Email confirmation is off in Supabase, so they're already signed in: go to the feed
        setDone('signed-in')
        setTimeout(() => window.location.assign('/feed'), 1200)
      } else {
        // Email confirmation is on: they sign in after clicking the link in their email
        setDone('confirm')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-6">Create an account</h1>
      {done ? (
        <p className="text-sm">
          {done === 'signed-in'
            ? "You're in. Taking you to the feed…"
            : 'Almost there. Check your email and click the confirmation link, then log in.'}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-ink/70">Username</label>
            <input
              required
              pattern="[a-zA-Z0-9_]{3,20}"
              title="3-20 letters, numbers or underscores"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-ink/70">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-ink/70">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
          </div>
          {error && <p className="text-sm text-rose">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-cobalt text-paper py-2.5 hover:bg-cobalt/90 disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Sign up'}
          </button>
        </form>
      )}
      <p className="text-sm text-ink/60 mt-6">
        Already have an account? <Link to="/login" className="text-cobalt">Log in</Link>
      </p>
    </div>
  )
}
