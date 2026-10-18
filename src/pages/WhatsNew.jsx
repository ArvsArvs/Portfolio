import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function WhatsNew() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('updates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUpdates(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-6">What&apos;s new</h1>
      {loading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : updates.length === 0 ? (
        <p className="text-sm text-ink/50">
          Nothing posted yet — add rows to the <code>updates</code> table to populate this page.
        </p>
      ) : (
        <div className="space-y-6 border-l border-sand pl-5">
          {updates.map((u) => (
            <div key={u.id}>
              <p className="text-xs text-ink/40 mb-1">
                {new Date(u.created_at).toLocaleDateString()}
              </p>
              <h2 className="font-display text-lg">{u.title}</h2>
              <p className="text-sm text-ink/70 mt-1">{u.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
