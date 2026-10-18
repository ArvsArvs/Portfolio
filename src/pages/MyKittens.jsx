import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import BecomeKitten from '../components/BecomeKitten.jsx'

const avatarFor = (seed, url) =>
  url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`

export default function MyKittens() {
  const { user, profile } = useAuth()
  const [kittens, setKittens] = useState([])
  const [listed, setListed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      // Everyone who signed up and became a kitten (supporter role)
      supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .eq('role', 'supporter')
        .order('created_at', { ascending: false }),
      // Kittens you add by hand in the Supabase `supporters` table (optional)
      supabase.from('supporters').select('*').order('created_at', { ascending: false }),
    ]).then(([accounts, manual]) => {
      if (accounts.error) setError(accounts.error.message)
      setKittens(accounts.data || [])
      setListed(manual.data || [])
      setLoading(false)
    })
  }, [])

  const total = kittens.length + listed.length

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-2">My Kittens</h1>
      <p className="text-sm text-ink/60 mb-6">Thank you to everyone backing this work.</p>

      {profile?.role === 'visitor' && (
        <div className="mb-6 rounded-xl border border-moss/30 bg-moss/5 p-4">
          <BecomeKitten />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : error ? (
        <p className="text-sm text-rose">Couldn&apos;t load kittens: {error}</p>
      ) : total === 0 ? (
        <p className="text-sm text-ink/50">
          No kittens yet.{' '}
          {user ? (
            'Be the first: use the button above if you are a visitor.'
          ) : (
            <>
              <Link to="/register" className="text-cobalt">Sign up</Link> and become a kitten to
              show up here.
            </>
          )}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {kittens.map((k) => (
            <Link
              key={k.id}
              to={`/u/${k.username}`}
              className="rounded-xl border border-sand p-4 text-center bg-moss/5 hover:border-moss/40 transition-colors"
            >
              <img
                src={avatarFor(k.username, k.avatar_url)}
                alt=""
                className="w-12 h-12 rounded-full object-cover mx-auto mb-2 bg-sand"
              />
              <p className="font-medium text-sm">{k.display_name || k.username}</p>
              <p className="text-xs text-ink/50">@{k.username}</p>
              {k.bio && <p className="text-xs text-ink/60 mt-1 line-clamp-2">{k.bio}</p>}
            </Link>
          ))}
          {listed.map((s) => (
            <div key={s.id} className="rounded-xl border border-sand p-4 text-center bg-moss/5">
              <img
                src={avatarFor(s.name, s.avatar_url)}
                alt=""
                className="w-12 h-12 rounded-full object-cover mx-auto mb-2 bg-sand"
              />
              <p className="font-medium text-sm">{s.name}</p>
              {s.tier && <p className="text-xs text-moss">{s.tier}</p>}
              {s.message && <p className="text-xs text-ink/60 mt-1">{s.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
