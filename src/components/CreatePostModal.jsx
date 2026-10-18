import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import FilePicker from './FilePicker.jsx'

export default function CreatePostModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [caption, setCaption] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const parseTags = () =>
    tagsInput
      .split(/[\s,#]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (files.length === 0 && !caption.trim()) {
      setError('Add a caption or at least one photo/video.')
      return
    }
    setBusy(true)
    setError('')
    try {
      // 1. create the post row
      const { data: post, error: postErr } = await supabase
        .from('posts')
        .insert({ author_id: user.id, caption: caption.trim() })
        .select()
        .single()
      if (postErr) throw postErr

      // 2. upload media files to storage, then record post_media rows
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${post.id}/${i}-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('media').upload(path, file)
        if (upErr) throw upErr
        const { data: pub } = supabase.storage.from('media').getPublicUrl(path)
        const mediaType = file.type.startsWith('video') ? 'video' : 'image'
        const { error: mediaErr } = await supabase.from('post_media').insert({
          post_id: post.id,
          media_url: pub.publicUrl,
          media_type: mediaType,
          position: i,
        })
        if (mediaErr) throw mediaErr
      }

      // 3. hashtags: upsert each tag, then link it to the post
      const tags = parseTags()
      for (const tag of tags) {
        const { data: existing } = await supabase
          .from('hashtags')
          .select('id')
          .eq('tag', tag)
          .maybeSingle()
        let hashtagId = existing?.id
        if (!hashtagId) {
          const { data: created, error: hErr } = await supabase
            .from('hashtags')
            .insert({ tag })
            .select()
            .single()
          if (hErr) throw hErr
          hashtagId = created.id
        }
        await supabase.from('post_hashtags').insert({ post_id: post.id, hashtag_id: hashtagId })
      }

      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">New post</h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption…"
            rows={3}
            className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="hashtags, separated by spaces (e.g. design travel)"
            className="w-full rounded-lg border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
          <FilePicker
            files={files}
            onChange={setFiles}
            accept="image/*,video/*"
            multiple
            label="Choose photos or videos"
            hint="Add one or several. Click to browse, or drop files here"
          />
          {error && <p className="text-sm text-rose">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-cobalt text-paper py-2.5 hover:bg-cobalt/90 disabled:opacity-60"
          >
            {busy ? 'Posting…' : 'Share post'}
          </button>
        </form>
      </div>
    </div>
  )
}
