import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const link = ({ isActive }) =>
  `px-3 py-2 text-sm transition-colors ${
    isActive ? 'text-cobalt font-medium' : 'text-ink/70 hover:text-ink'
  }`

export default function Navbar() {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="border-b border-sand bg-paper/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="font-display text-xl">
          Portfolio<span className="text-cobalt">.</span>
        </Link>
        <nav className="hidden sm:flex items-center">
          <NavLink to="/feed" className={link}>Feed</NavLink>
          <NavLink to="/whats-new" className={link}>What&apos;s New</NavLink>
          <NavLink to="/my-kittens" className={link}>My Kittens</NavLink>
          {/* The author is the one who receives Contact messages, so they get the Inbox instead */}
          {profile?.role !== 'author' && (
            <NavLink to="/contact" className={link}>Contact</NavLink>
          )}
          {profile?.role === 'author' && (
            <NavLink to="/inbox" className={link}>Inbox</NavLink>
          )}
          {profile && (
            <NavLink to={`/u/${profile.username}`} className={link}>
              My Profile
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-sm rounded-full border border-ink/20 hover:border-ink/40 transition-colors"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 text-sm text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm rounded-full bg-cobalt text-paper hover:bg-cobalt/90 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      {/* mobile nav row */}
      <nav className="sm:hidden flex justify-between px-4 pb-2 text-xs overflow-x-auto">
        <NavLink to="/feed" className={link}>Feed</NavLink>
        <NavLink to="/whats-new" className={link}>New</NavLink>
        <NavLink to="/my-kittens" className={link}>My Kittens</NavLink>
        {profile?.role !== 'author' && (
          <NavLink to="/contact" className={link}>Contact</NavLink>
        )}
        {profile?.role === 'author' && (
          <NavLink to="/inbox" className={link}>Inbox</NavLink>
        )}
      </nav>
    </header>
  )
}
