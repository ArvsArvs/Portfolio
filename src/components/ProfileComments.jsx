import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

// Used on the Profile page of accounts that can't post (kittens, visitors):
// lists what they've commented, with a link to the post each comment is on.
export const PROFILE_COMMENT_SELECT = `id, body, created_at, author_id, post_id,
  posts!post_id ( id, caption, post_media ( media_url, media_type, position ) )`

export default function ProfileComments({ comments, setComments }) {
  const { user, profile } = useAuth()
  const [error, setError] = useState('')
  const viewerIsAuthor = profile?.role === 'author'

  const handleDelete = async (commentId) => {
    setError('')
    const prev = comments
    setComments((c) => c.filter((cm) => cm.id !== commentId)) // optimistic
    const { data, error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .select('id')
    if (deleteError || !data || data.length === 0) {
      setComments(prev) // revert
      setError(deleteError?.message || "Couldn't delete this comment.")
    }
  }

  if (comments.length === 0) {
    return <p className="text-sm text-ink/50">No comments yet.</p>
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-rose">{error}</p>}
      {comments.map((c) => {
        const post = c.posts
        const cover = [...(post?.post_media ?? [])].sort((a, b) => a.position - b.position)[0]
        const canDelete = user && (user.id === c.author_id || viewerIsAuthor)
        return (
          <article key={c.id} className="flex gap-3 rounded-xl border border-sand bg-white p-3">
            <Link to={`/feed?post=${c.post_id}`} className="shrink-0" aria-label="Open post">
              {cover?.media_type === 'image' ? (
                <img
                  src={cover.media_url}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover bg-sand"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-ink/80 text-paper text-xs flex items-center justify-center">
                  {cover ? 'Video' : 'Post'}
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm whitespace-pre-wrap break-words">{c.body}</p>
              <p className="text-xs text-ink/50 mt-1 truncate">
                On {post?.caption ? `"${post.caption.slice(0, 60)}"` : 'a post'}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs">
                <span className="text-ink/40">{new Date(c.created_at).toLocaleDateString()}</span>
                <Link to={`/feed?post=${c.post_id}`} className="text-cobalt">
                  View post
                </Link>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-ink/40 hover:text-rose"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
