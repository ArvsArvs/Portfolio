import MediaThumb from './MediaThumb.jsx'

// Thumbnails in 3 columns. Clicking one asks the parent to open the post.
export default function PostGrid({ posts, onOpen, openingId }) {
  return (
    <ul className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post) => (
        <li key={post.id}>
          <button
            onClick={() => onOpen(post.id)}
            disabled={openingId === post.id}
            aria-label={`Open post${post.caption ? `: ${post.caption.slice(0, 60)}` : ''}`}
            className="group relative block w-full aspect-square overflow-hidden rounded-md bg-sand focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
          >
            <MediaThumb media={post.media} caption={post.caption} />
            {/* Likes and comments, shown on hover or keyboard focus */}
            <span className="absolute inset-0 flex items-center justify-center gap-4 bg-black/45 text-white text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 20.5s-7.5-4.6-10-9.2C.5 7.8 2.3 4 6 4c2.1 0 3.6 1.1 6 3.4C14.4 5.1 15.9 4 18 4c3.7 0 5.5 3.8 4 7.3-2.5 4.6-10 9.2-10 9.2z" />
                </svg>
                {post.like_count}
              </span>
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-8.8 8.37 8.5 8.5 0 0 1-4.13-1.1L3 20l1.3-3.9a8.5 8.5 0 0 1-1.1-4.1A8.38 8.38 0 0 1 11.6 3.6 8.5 8.5 0 0 1 21 11.5z" />
                </svg>
                {post.comments.length}
              </span>
            </span>
            {openingId === post.id && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs">
                Opening…
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}
