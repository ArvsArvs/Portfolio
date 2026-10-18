import { useEffect, useRef, useState } from 'react'

export default function MediaCarousel({ media }) {
  const rootRef = useRef(null)
  const trackRef = useRef(null)
  const videoRefs = useRef({})
  const [index, setIndex] = useState(0)
  const [inView, setInView] = useState(false)

  const items = media ?? []
  const hasMedia = items.length > 0

  // Know whether the carousel is on screen, so a video only plays while you can see it
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMedia])

  // Play the video on the active slide (when visible); pause every other video
  useEffect(() => {
    items.forEach((m, i) => {
      const video = videoRefs.current[m.id]
      if (!video) return
      if (i === index && inView) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }, [index, inView, items])

  if (!hasMedia) return null

  const scrollToIndex = (i) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(items.length - 1, i))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
    setIndex(clamped)
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    const i = Math.round(track.scrollLeft / track.clientWidth)
    setIndex(i)
  }

  return (
    <div ref={rootRef} className="relative bg-black">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="carousel-track flex overflow-x-auto aspect-square"
      >
        {items.map((m) => (
          <div key={m.id} className="carousel-slide shrink-0 w-full h-full">
            {m.media_type === 'video' ? (
              // Browsers only allow autoplay when muted; viewers can unmute from the controls
              <video
                ref={(el) => {
                  videoRefs.current[m.id] = el
                }}
                src={m.media_url}
                controls
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
            ) : (
              <img src={m.media_url} alt="" className="w-full h-full object-contain" />
            )}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => scrollToIndex(index - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
          >
            ‹
          </button>
          <button
            aria-label="Next slide"
            onClick={() => scrollToIndex(index + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((m, i) => (
              <span
                key={m.id}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === index ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
