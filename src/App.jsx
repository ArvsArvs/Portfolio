import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import Feed from './pages/Feed.jsx'
import Profile from './pages/Profile.jsx'
import Contact from './pages/Contact.jsx'
import WhatsNew from './pages/WhatsNew.jsx'
import MyKittens from './pages/MyKittens.jsx'
import Inbox from './pages/Inbox.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/whats-new" element={<WhatsNew />} />
          <Route path="/my-kittens" element={<MyKittens />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <footer className="border-t border-sand py-6 text-center text-sm text-ink/60">
        Built with React &amp; Supabase.
      </footer>
    </div>
  )
}
