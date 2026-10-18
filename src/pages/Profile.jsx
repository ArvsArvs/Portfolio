import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import { POST_SELECT, mapPost } from '../lib/posts.js'
import PostGrid from '../components/PostGrid.jsx'
import PostModal from '../components/PostModal.jsx'
import FilePicker from '../components/FilePicker.jsx'
import ProfileComments, { PROFILE_COMMENT_SELECT } from '../components/ProfileComments.jsx'

export default function Profile() {
  const { username } = useParams()
  const { user, refreshProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  // The post shown in the pop-up (null = closed), and which thumbnail is still loading
  const [openPostData, setOpenPostData] = useState(null)
  const [openingId, setOpeningId] = useState(null)
  const [openError, setOpenError] = useState('')

  const isOwnProfile = user && profile && user.id === profile.id
  const isAuthorProfile = profile?.role === 'author'

  const fetchPosts = async (authorId) => {
    const { data } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
    return (data || []).map((p) => mapPost(p, user?.id))
  }

  const load = async () => {
    setLoading(true)
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle()
    setProfile(prof)
    setDisplayName(prof?.display_name || '')
    setBio(prof?.bio || '')

    if (prof) {
      setPosts(await fetchPosts(prof.id))

      // Accounts that can't post (kittens, visitors) are shown by what they've commented
      if (prof.role === 'author') {
        setComments([])
      } else {
        const { data: theirComments } = await supabase
          .from('comments')
          .select(PROFILE_COMMENT_SELECT)
          .eq('author_id', prof.id)
          .order('created_at', { ascending: false })
        setComments(theirComments || [])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  // Always load the post fresh, so likes and comments are up to date in the pop-up
  const openPost = async (postId) => {
    setOpeningId(postId)
    setOpenError('')
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('id', postId)
      .maybeSingle()
    setOpeningId(null)
    if (error || !data) {
      setOpenError(error?.message || "This post isn't available anymore.")
      return
    }
    setOpenPostData(mapPost(data, user?.id))
  }

  const closePost = async () => {
    setOpenPostData(null)
    // Quietly refresh the thumbnails so their like and comment counts are current
    if (profile) setPosts(await fetchPosts(profile.id))
  }

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setOpenPostData(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      let avatar_url = profile.avatar_url
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = pub.publicUrl
      }
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName, bio, avatar_url })
        .eq('id', user.id)
      if (updateError) throw updateError
      await refreshProfile()
      setEditing(false)
      setAvatarFile(null)
      load()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center py-16 text-sm text-ink/50">Loading…</p>
  if (!profile) return <p className="text-center py-16 text-sm text-ink/50">No one here yet.</p>

  return (
    <div className={`${isAuthorProfile ? 'max-w-3xl' : 'max-w-xl'} mx-auto px-4 py-10 space-y-8`}>
      <div className="flex items-start gap-5">
        <img
          src={profile.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.username}`}
          alt=""
          className="w-20 h-20 rounded-full object-cover bg-sand"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl">{profile.display_name || profile.username}</h1>
            {isOwnProfile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs rounded-full border border-ink/20 px-3 py-1 hover:border-ink/40"
              >
                Edit profile
              </button>
            )}
          </div>
          <p className="text-sm text-ink/50">@{profile.username}</p>
          {isAuthorProfile && (
            <p className="text-xs text-ink/50 mt-1">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
          )}
          {!editing && profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="space-y-3 bg-sand/40 rounded-2xl p-4 max-w-xl">
          <div>
            <label className="block text-sm mb-1 text-ink/70">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-ink/70">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white"
            />
          </div>
          <div>
            <span className="block text-sm mb-1 text-ink/70">Avatar</span>
            <FilePicker
              files={avatarFile ? [avatarFile] : []}
              onChange={(chosen) => setAvatarFile(chosen[0] ?? null)}
              accept="image/*"
              label="Choose a photo"
              hint="Click to browse, or drop an image here"
            />
          </div>
          {saveError && <p className="text-sm text-rose">{saveError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-cobalt text-paper px-4 py-2 text-sm hover:bg-cobalt/90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setAvatarFile(null)
                setSaveError('')
              }}
              className="rounded-full border border-ink/20 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {profile.role !== 'author' && (
        <section>
          <h2 className="font-display text-xl mb-3">Comments ({comments.length})</h2>
          <ProfileComments comments={comments} setComments={setComments} />
        </section>
      )}

      {(isAuthorProfile || posts.length > 0) && (
        <section>
          {openError && <p className="text-sm text-rose mb-3">{openError}</p>}
          {posts.length === 0 ? (
            <p className="text-sm text-ink/50">
              No posts yet.{isOwnProfile && ' Use New post on the Feed page to add one.'}
            </p>
          ) : (
            <PostGrid posts={posts} onOpen={openPost} openingId={openingId} />
          )}
        </section>
      )}

      {openPostData && (
        <PostModal
          key={openPostData.id}
          post={openPostData}
          onClose={closePost}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
