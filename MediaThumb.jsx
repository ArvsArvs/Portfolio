// Square cover image for a post. Fills its (relatively positioned) parent.
// Shows the first photo, the first frame of a video, or the caption for text-only posts.
export default function MediaThumb({ media = [], caption }) {
  const sorted = [...media].sort((a, b) => a.position - b.position)
  const first = sorted[0]

  if (!first) {
    return (
      <div className="absolute inset-0 bg-sand p-3 overflow-hidden">
        <p className="text-xs sm:text-sm text-ink/70 line-clamp-6 break-words">{caption || 'Post'}</p>
      </div>
    )
  }

  const isVideo = first.media_type === 'video'
  const hasMany = sorted.length > 1

  return (
    <div className="absolute inset-0 bg-black">
      {isVideo ? (
        <video
          src={`${first.media_url}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <img src={first.media_url} alt="" loading="lazy" className="w-full h-full object-cover" />
      )}

      {/* Corner badge: several items, or a video */}
      {(hasMany || isVideo) && (
        <span
          className="absolute top-1.5 right-1.5 text-white drop-shadow"
          title={hasMany ? 'Several photos or videos' : 'Video'}
        >
          {hasMany ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M7 3h11a3 3 0 0 1 3 3v11h-2V6a1 1 0 0 0-1-1H7V3zM4 7h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
      )}
    </div>
  )
}
