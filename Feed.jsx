import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import { POST_SELECT, mapPost } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import SortBar from '../components/SortBar.jsx'
import CreatePostModal from '../components/CreatePostModal.jsx'

export default function Feed() {
  const { user, profile } = useAuth()
  // /feed?post=<id> opens a single post (used by Share links and profile comment lists)
  const [searchParams, setSearchParams] = useSearchParams()
  const sharedPostId = searchParams.get('post')
  const [rawPosts, setRawPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [sort, setSort] = useState('newest')
  const [activeTag, setActiveTag] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const loadPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Could not load posts:', error)
      setLoadError(error.message)
    } else {
      setLoadError('')
      setRawPosts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const posts = useMemo(() => {
    let list = rawPosts.map((p) => mapPost(p, user?.id))

    if (sharedPostId) {
      list = list.filter((p) => p.id === sharedPostId)
    }

    if (activeTag) {
      list = list.filter((p) => p.hashtags.includes(activeTag))
    }

    switch (sort) {
      case 'oldest':
        list = [...list].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'popular':
        list = [...list].sort((a, b) => b.like_count - a.like_count)
        break
      default:
        list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return list
  }, [rawPosts, sort, activeTag, user, sharedPostId])

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Feed</h1>
        {profile?.role === 'author' && (
          <button
            onClick={() => setShowCreate(true)}
            className="text-sm rounded-full bg-cobalt text-paper px-4 py-2 hover:bg-cobalt/90"
          >
            New post
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SortBar value={sort} onChange={setSort} />
        {activeTag && (
          <button
            onClick={() => setActiveTag(null)}
            className="text-xs text-ink/50 hover:text-ink"
          >
            Clear #{activeTag} filter ✕
          </button>
        )}
        {sharedPostId && (
          <button
            onClick={() => setSearchParams({})}
            className="text-xs text-cobalt hover:underline"
          >
            Showing one post. View all posts
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Loading posts…</p>
      ) : loadError ? (
        <p className="text-sm text-rose">Couldn&apos;t load posts: {loadError}</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-ink/50">
          {sharedPostId
            ? "This post isn't available. It may have been deleted."
            : `Nothing here yet${activeTag ? ` for #${activeTag}` : ''}.`}
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onHashtagClick={setActiveTag}
              onDeleted={(id) => setRawPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePostModal onClose={() => setShowCreate(false)} onCreated={loadPosts} />
      )}
    </div>
  )
}
