import { useState } from 'react'

export default function ShareButton({ postId, caption }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/feed?post=${postId}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check out this post', text: caption || '', url })
      } catch {
        // user cancelled share sheet — no-op
      }
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-ink/70">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{copied ? 'Link copied' : 'Share'}</span>
    </button>
  )
}
