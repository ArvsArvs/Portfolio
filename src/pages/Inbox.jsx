import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

// Messages sent through the Contact page land here. Only the author can read them.
export default function Inbox() {
  const { user, profile, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const isAuthor = profile?.role === 'author'

  useEffect(() => {
    if (!isAuthor) return
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message)
        setMessages(data || [])
        setLoading(false)
      })
  }, [isAuthor])

  const handleDelete = async (id) => {
    const { error: deleteError } = await supabase.from('contact_messages').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setMessages((m) => m.filter((msg) => msg.id !== id))
    setConfirmId(null)
  }

  if (authLoading || (user && !profile)) {
    return <p className="text-center py-16 text-sm text-ink/50">Loading…</p>
  }

  if (!isAuthor) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-sm text-ink/60">
        The inbox is only for the site author.{' '}
        {!user && (
          <>
            <Link to="/login" className="text-cobalt">Log in</Link> to continue.
          </>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-2">Inbox</h1>
      <p className="text-sm text-ink/60 mb-6">Messages sent from the Contact page.</p>

      {error && <p className="text-sm text-rose mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-ink/50">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <article key={m.id} className="rounded-xl border border-sand bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-xs text-cobalt">
                    {m.email}
                  </a>
                </div>
                <p className="text-xs text-ink/40 shrink-0">
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-sm mt-3 whitespace-pre-wrap">{m.message}</p>
              <div className="mt-3 text-xs">
                {confirmId === m.id ? (
                  <span className="flex items-center gap-3">
                    <button onClick={() => handleDelete(m.id)} className="text-rose font-medium">
                      Delete permanently
                    </button>
                    <button onClick={() => setConfirmId(null)} className="text-ink/50 hover:text-ink">
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(m.id)}
                    className="text-ink/40 hover:text-rose"
                  >
                    Delete message
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
