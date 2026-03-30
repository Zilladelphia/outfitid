'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shows', label: 'Shows' },
    { href: '/actors', label: 'Actors' },
  ]

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden md:flex gap-6 text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'text-purple-500' : 'text-zinc-400 hover:text-white transition'}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button onClick={() => setOpen(!open)} className="text-white p-2">
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {open && (
          <div className="absolute top-16 left-0 right-0 bg-black border-b border-zinc-800 px-4 py-4 flex flex-col gap-4 z-50">
            <form action="/search" method="GET">
              <input
                name="q"
                placeholder="Search shows, actors, outfits..."
                className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-500"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={pathname === link.href ? 'text-purple-500' : 'text-zinc-400 hover:text-white transition'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}