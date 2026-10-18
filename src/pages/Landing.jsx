import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Landing() {
  const { profile } = useAuth()

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-sm uppercase tracking-wide text-cobalt/70 mb-3">Portfolio &amp; feed</p>
      <h1 className="font-display text-4xl sm:text-5xl leading-tight">
        A place to show the work, <br className="hidden sm:block" />
        and everything made along the way.
      </h1>
      <p className="mt-5 text-ink/70 max-w-xl mx-auto">
        Browse posts, react, comment, and follow along — built as a personal feed,
        shaped like the sites I actually enjoy scrolling.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          to="/feed"
          className="rounded-full bg-cobalt text-paper px-6 py-3 text-sm hover:bg-cobalt/90"
        >
          Browse the feed
        </Link>
        {!profile && (
          <Link
            to="/register"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm hover:border-ink/40"
          >
            Create an account
          </Link>
        )}
      </div>
    </div>
  )
}
