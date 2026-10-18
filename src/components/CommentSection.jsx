import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import BecomeKitten from './BecomeKitten.jsx'

const PREVIEW_COUNT = 3

// Comments load together with the post and are always visible.
// Only authors and supporters (kittens) can write; visitors are invited to become one.
export default function CommentSection({ postId, comments, setComments }) {
  const { user, profile } = useAuth()
  const [body, setBody] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState('')

  const canComment = profile?.role === 'author' || profile?.role === 'supporter'
  const hiddenCount = Math.max(0, comments.length - PREVIEW_COUNT)
  const shown = expanded ? comments : comments.slice(-PREVIEW_COUNT)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim() || !user) return
    setError('')
    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, body: body.trim() })
      .select('id, body, created_at, author_id, profiles!author_id ( username, avatar_url )')
      .single()
    if (insertError) {
      setError(insertError.message)
      return
    }
    setComments((c) => [...c, data])
    setBody('')
  }

  const handleDelete = async (commentId) => {
    setError('')
    const prev = comments
    setComments((c) => c.filter((cm) => cm.id !== commentId)) // optimistic
    const { data, error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .select('id')
    // The database removes nothing (and reports no error) if you aren't allowed to delete it
    if (deleteError || !data || data.length === 0) {
      setComments(prev) // revert
      setError(deleteError?.message || "Couldn't delete this comment.")
    }
  }

  return (
    <div className="px-4 pb-4 space-y-2">
      {hiddenCount > 0 && !expanded && (
        <button onClick={() => setExpanded(true)} className="text-xs text-ink/50 hover:text-ink">
          View all {comments.length} comments
        </button>
      )}

      {shown.map((c) => (
        <div key={c.id} className="flex items-start justify-between gap-2 text-sm">
          <p>
            <span className="font-medium">{c.profiles?.username ?? 'unknown'}</span>{' '}
            <span className="text-ink/80">{c.body}</span>
          </p>
          {/* The comment's own writer can delete it, and so can the site author (moderation) */}
          {user && (user.id === c.author_id || profile?.role === 'author') && (
            <button
              onClick={() => handleDelete(c.id)}
              className="text-xs text-ink/40 hover:text-rose shrink-0"
              title="Delete comment"
            >
              Delete
            </button>
          )}
        </div>
      ))}

      <div className="pt-1">
        {!user ? (
          <p className="text-xs text-ink/50">
            <Link to="/login" className="text-cobalt">Log in</Link> to like and comment.
          </p>
        ) : !profile ? null : canComment ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Comment as ${profile.username}`}
              className="flex-1 text-sm rounded-full border border-ink/15 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
            <button type="submit" className="text-sm text-cobalt font-medium">
              Post
            </button>
          </form>
        ) : (
          <BecomeKitten />
        )}
        {error && <p className="text-xs text-rose mt-1">{error}</p>}
      </div>
    </div>
  )
}
