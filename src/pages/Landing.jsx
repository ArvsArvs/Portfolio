import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// The organic shape behind the portrait. Defined once in bounding-box units (0 to 1)
// so it scales with whatever size the element is.
function BlobClip() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="hero-blob" clipPathUnits="objectBoundingBox">
          <path d="M0.3 0 H1 V0.86 C0.93 1 0.74 1.03 0.6 0.94 C0.47 0.86 0.42 0.7 0.3 0.57 C0.14 0.4 0.02 0.28 0.11 0.14 C0.16 0.07 0.23 0.03 0.3 0 Z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default function Landing() {
  const { profile } = useAuth()

  return (
    <section className="relative overflow-hidden">
      <BlobClip />
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-2 lg:py-0">
        {/* Text column */}
        <div className="relative z-10 max-w-lg lg:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blush-deep">
            Professional teacher
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Hello, my name is Katrina Asuncion
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink/70">
            I help learners find confidence in their own voice through patient guidance,
            creative lessons, and a classroom where everyone belongs. Follow along for my
            projects, moments, and updates.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/feed"
              className="rounded-lg bg-blush px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-blush/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Browse the feed
            </Link>
            <Link
              to={profile ? '/whats-new' : '/register'}
              className="rounded-lg border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              {profile ? "What's new" : 'Create an account'}
            </Link>
          </div>
        </div>

        {/* Portrait column: on large screens the blob is pinned to the right half of the hero, off the top and right edges */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm sm:max-w-md lg:static lg:mx-0 lg:aspect-auto lg:max-w-none lg:self-stretch">
          <div
            className="absolute inset-0 bg-blush lg:left-auto lg:right-0 lg:w-1/2"
            style={{ clipPath: 'url(#hero-blob)' }}
          >
            <img
              src="/katrina.webp"
              alt="Katrina Asuncion, smiling in a white shirt and a sparkling tiara"
              width="1107"
              height="1400"
              fetchpriority="high"
              decoding="async"
              className="absolute bottom-0 left-1/2 h-[92%] w-auto max-w-none -translate-x-1/2 object-contain lg:h-[90%]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
