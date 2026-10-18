import { useEffect, useRef } from 'react'
import PostCard from './PostCard.jsx'

// Pop-up view of one post (the same card used in the feed).
// Closes with the ✕ button, the Escape key, or a click outside the card.
export default function PostModal({ post, onClose, onDeleted }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden' // stop the page behind from scrolling
    dialogRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 px-4 py-6 sm:py-10"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close post"
        className="fixed top-3 right-3 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        ✕
      </button>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Post"
        tabIndex={-1}
        className="mx-auto w-full max-w-xl outline-none"
      >
        <PostCard post={post} onDeleted={onDeleted} />
      </div>
    </div>
  )
}
