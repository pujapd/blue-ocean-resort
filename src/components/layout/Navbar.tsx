'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, profile, isAdmin, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-ocean to-ocean-dark rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">BO</span>
              </div>
              <span className="text-xl md:text-2xl font-bold text-ocean">
                Blue Ocean Resort
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-ocean transition font-medium">
              Home
            </Link>
            <Link href="/rooms" className="text-gray-700 hover:text-ocean transition font-medium">
              Rooms
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-ocean transition font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-ocean transition font-medium">
              Contact
            </Link>

            {/* Logged in user links */}
            {user && (
              <>
                <Link href="/bookings" className="text-gray-700 hover:text-ocean transition font-medium">
                  My Bookings
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-ocean transition font-medium">
                  Profile
                </Link>
              </>
            )}

            {/* Admin Only */}
            {isAdmin && (
              <Link href="/admin" className="text-red-600 hover:text-red-700 transition font-medium">
                ⚙️ Admin
              </Link>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-ocean rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-semibold text-gray-900">{profile?.username || 'User'}</p>
                    <p className="text-xs text-gray-500">
                      {isAdmin ? '🔑 Admin' : '👤 Client'}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <Link
                  href="/login"
                  className="text-ocean hover:text-ocean-dark font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-ocean text-white rounded-lg hover:bg-ocean-dark transition font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-ocean p-2"
            >
              {mobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {/* User Info (Mobile) */}
            {user && (
              <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg mb-2">
                <div className="w-10 h-10 bg-ocean rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? '🔑 Admin' : '👤 Client'}
                  </p>
                </div>
              </div>
            )}

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-ocean rounded-lg transition"
            >
              🏠 Home
            </Link>
            <Link
              href="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-ocean rounded-lg transition"
            >
              🛏️ Rooms
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-ocean rounded-lg transition"
            >
              ℹ️ About
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-ocean rounded-lg transition"
            >
              📞 Contact
            </Link>

            {/* Logged in links */}
            {user && (
              <>
                <div className="border-t my-2"></div>
                <Link
                  href="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-ocean rounded-lg transition"
                >
                  📋 My Bookings
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-ocean rounded-lg transition"
                >
                  👤 Profile
                </Link>
              </>
            )}

            {/* Admin Only */}
            {isAdmin && (
              <>
                <div className="border-t my-2"></div>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition font-semibold"
                >
                  ⚙️ Admin Panel
                </Link>
              </>
            )}

            {/* Auth */}
            <div className="border-t my-2"></div>
            {user ? (
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition font-semibold"
              >
                🚪 Logout
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-ocean hover:bg-blue-50 rounded-lg transition text-center font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 bg-ocean text-white hover:bg-ocean-dark rounded-lg transition text-center font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}