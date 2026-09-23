import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-hairline shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logos */}
        <div className="flex items-center gap-4">
          <img
            src="/logos/Microsoft_Logo_512px.png"
            alt="Microsoft"
            className="h-6 object-contain"
          />
          <span className="text-hairline text-lg select-none">×</span>
          <img
            src="/logos/ptulogo2-DP1QNExA.png"
            alt="PTU"
            className="h-8 object-contain"
          />
        </div>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {['About', 'Problem Statements', 'Timeline', 'Rules', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm font-medium text-text-muted hover:text-ink transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right: CTA */}
        <Link
          to="/auth"
          className="px-5 py-2 rounded-full text-sm font-medium bg-ink text-white hover:bg-accent transition-all duration-300"
        >
          Register Now
        </Link>
      </div>
    </nav>
  )
}
