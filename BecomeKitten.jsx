import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

// Shown to visitors: one click turns them into a kitten (supporter), who can comment.
export default function BecomeKitten() {
  const { refreshProfile } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    setBusy(true)
    setError('')
    const { error: rpcError } = await supabase.rpc('become_supporter')
    if (rpcError) {
      setError(rpcError.message)
      setBusy(false)
      return
    }
    await refreshProfile()
    setBusy(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap text-sm">
      <span className="text-ink/60">Want to comment?</span>
      <button
        onClick={handleClick}
        disabled={busy}
        className="rounded-full bg-moss text-paper px-3 py-1 hover:bg-moss/90 disabled:opacity-60"
      >
        {busy ? 'Joining…' : 'Become a kitten (supporter)'}
      </button>
      {error && <span className="text-xs text-rose">{error}</span>}
    </div>
  )
}
