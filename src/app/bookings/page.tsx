'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      fetchBookings()
    }
  }, [user, authLoading])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms:room_id (title, images, price)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Booking cancelled')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to cancel booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-ocean"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Room Image */}
                  <div className="md:w-64 h-48 md:h-auto">
                    <img
                      src={booking.rooms?.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'}
                      alt={booking.rooms?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-grow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {booking.rooms?.title || 'Room'}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-ocean">
                          ৳{booking.total_price?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Check-in</div>
                        <div className="font-semibold">
                          {new Date(booking.check_in).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Check-out</div>
                        <div className="font-semibold">
                          {new Date(booking.check_out).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Guests</div>
                        <div className="font-semibold">{booking.guests}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Booked on</div>
                        <div className="font-semibold">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                        >
                          Cancel Booking
                        </button>
                      )}
                      <a
                        href={`/rooms/${booking.room_id}`}
                        className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean-dark transition text-sm"
                      >
                        View Room
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-4">Start exploring our beautiful rooms!</p>
            <a
              href="/rooms"
              className="inline-block px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean-dark transition"
            >
              Browse Rooms
            </a>
          </div>
        )}
      </div>
    </div>
  )
}