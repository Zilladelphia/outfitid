import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import MobileMenu from '@/components/MobileMenu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OutfitID',
  description: 'Shop outfits from your favorite shows and influencers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <nav className="border-b border-zinc-800 bg-black px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-xl tracking-tight shrink-0">
            Outfit<span className="text-purple-500">ID</span>
          </Link>
          
          {/* Desktop search + nav */}
          <form action="/search" method="GET" className="hidden md:flex items-center mx-4 flex-1 max-w-sm">
            <input
              name="q"
              placeholder="Search shows, actors, outfits..."
              className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-500"
            />
          </form>

          {/* Mobile hamburger */}
          <MobileMenu />
        </nav>
        <main className="bg-zinc-950 min-h-screen text-white">
          {children}
        </main>
      </body>
    </html>
  )
}