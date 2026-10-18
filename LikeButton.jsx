import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

export default function LikeButton({ postId, initialCount, initiallyLiked }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(initiallyLiked)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    if (!user || busy) return
    setBusy(true)
    const nextLiked = !liked
    // optimistic update
    setLiked(nextLiked)
    setCount((c) => c + (nextLiked ? 1 : -1))

    const query = nextLiked
      ? supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      : supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)

    const { error } = await query
    if (error) {
      // revert on failure
      setLiked(!nextLiked)
      setCount((c) => c + (nextLiked ? -1 : 1))
    }
    setBusy(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={!user}
      title={user ? 'Like this post' : 'Log in to like posts'}
      className="flex items-center gap-1.5 text-sm group"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill={liked ? '#C1666B' : 'none'}
        stroke={liked ? '#C1666B' : 'currentColor'}
        strokeWidth="1.8"
        className="transition-transform group-active:scale-90"
      >
        <path d="M12 20.5s-7.5-4.6-10-9.2C.5 7.8 2.3 4 6 4c2.1 0 3.6 1.1 6 3.4C14.4 5.1 15.9 4 18 4c3.7 0 5.5 3.8 4 7.3-2.5 4.6-10 9.2-10 9.2z" />
      </svg>
      <span className={liked ? 'text-rose' : 'text-ink/70'}>{count}</span>
    </button>
  )
}
