import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import MediaCarousel from './MediaCarousel.jsx'
import LikeButton from './LikeButton.jsx'
import ShareButton from './ShareButton.jsx'
import HashtagPill from './HashtagPill.jsx'
import CommentSection from './CommentSection.jsx'

// Public storage URLs look like  <project>/storage/v1/object/public/media/<path>
const MEDIA_MARKER = '/storage/v1/object/public/media/'

export default function PostCard({ post, onHashtagClick, onDeleted }) {
  const { user } = useAuth()
  const [comments, setComments] = useState(post.comments ?? [])
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const isMine = Boolean(user) && post.author_id === user.id

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')

    // Deleting the post also removes its media rows, hashtag links, likes and comments
    const { data, error } = await supabase.from('posts').delete().eq('id', post.id).select('id')

    if (error || !data || data.length === 0) {
      setDeleteError(error?.message || "Couldn't delete this post. Make sure you're signed in as its author.")
      setDeleting(false)
      return
    }

    // Also remove the uploaded photo/video files (best effort: the post is already gone)
    const paths = post.media
      .map((m) => m.media_url.split(MEDIA_MARKER)[1])
      .filter(Boolean)
      .map(decodeURIComponent)
    if (paths.length > 0) {
      await supabase.storage.from('media').remove(paths)
    }

    onDeleted?.(post.id)
  }

  return (
    <article className="border border-sand rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={post.author.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${post.author.username}`}
          alt=""
          className="w-9 h-9 rounded-full object-cover bg-sand"
        />
        <Link to={`/u/${post.author.username}`} className="font-medium text-sm hover:underline">
          {post.author.username}
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-ink/40">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          {isMine &&
            (confirmingDelete ? (
              <span className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-rose font-medium disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete permanently'}
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="text-ink/50 hover:text-ink"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="text-xs text-ink/40 hover:text-rose"
              >
                Delete post
              </button>
            ))}
        </div>
      </div>
      {deleteError && <p className="px-4 pb-2 text-xs text-rose">{deleteError}</p>}

      <MediaCarousel media={post.media} />

      <div className="px-4 pt-3 flex items-center gap-4">
        <LikeButton
          postId={post.id}
          initialCount={post.like_count}
          initiallyLiked={post.liked_by_me}
        />
        <span className="flex items-center gap-1.5 text-sm text-ink/70" title="Comments">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.8 8.37 8.5 8.5 0 0 1-4.13-1.1L3 20l1.3-3.9a8.5 8.5 0 0 1-1.1-4.1A8.38 8.38 0 0 1 11.6 3.6 8.5 8.5 0 0 1 21 11.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {comments.length}
        </span>
        <ShareButton postId={post.id} caption={post.caption} />
      </div>

      {post.hashtags?.length > 0 && (
        <div className="px-4 pt-2 flex flex-wrap gap-1.5">
          {post.hashtags.map((tag) => (
            <HashtagPill key={tag} tag={tag} onClick={onHashtagClick} />
          ))}
        </div>
      )}

      {post.caption && (
        <p className="px-4 pt-2 pb-3 text-sm">
          <span className="font-medium">{post.author.username}</span> {post.caption}
        </p>
      )}

      <CommentSection postId={post.id} comments={comments} setComments={setComments} />
    </article>
  )
}
