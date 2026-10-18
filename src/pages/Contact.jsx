import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

export default function Contact() {
  const { user, profile, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.from('contact_messages').insert(form)
    if (error) setError(error.message)
    else setSent(true)
    setBusy(false)
  }

  // Wait until we know who is signed in, so the author never sees the form flash up
  if (authLoading || (user && !profile)) {
    return <div className="max-w-md mx-auto px-4 py-16" />
  }

  // The author receives these messages, so there's nobody for them to contact
  if (profile?.role === 'author') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="font-display text-3xl mb-2">Contact</h1>
        <p className="text-sm text-ink/60">
          Messages from this page arrive in your{' '}
          <Link to="/inbox" className="text-cobalt">Inbox</Link>.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-2">Get in touch</h1>
      <p className="text-sm text-ink/60 mb-6">Questions, collaborations, or just saying hi.</p>

      {sent ? (
        <p className="text-sm">Thanks — message sent. I'll get back to you soon.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            required
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Message"
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
          {error && <p className="text-sm text-rose">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-cobalt text-paper py-2.5 hover:bg-cobalt/90 disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  )
}
