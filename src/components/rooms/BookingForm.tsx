'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface BookingFormProps {
  room: {
    id: string
    title: string
    price: number
    capacity: number
    available: boolean
  }
}

export default function BookingForm({ room }: BookingFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)

  const calculateNights = (): number => {
    if (!checkIn || !checkOut) return 0
    const diff = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = (): number => {
    return calculateNights() * room.price
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book')
      router.push('/login')
      return
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (checkOut <= checkIn) {
      toast.error('Check-out must be after check-in')
      return
    }

    if (guests > room.capacity) {
      toast.error(`Maximum ${room.capacity} guests allowed`)
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            room_id: room.id,
            check_in: checkIn.toISOString().split('T')[0],
            check_out: checkOut.toISOString().split('T')[0],
            guests: guests,
            total_price: calculateTotal(),
            status: 'pending',
          },
        ])

      if (error) throw error

      toast.success('Booking successful! 🎉')
      router.push('/bookings')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Booking failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const nights = calculateNights()
  const total = calculateTotal()

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Book This Room</h3>

      {/* Check-in Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Check-in Date
        </label>
        <DatePicker
          selected={checkIn}
          onChange={(date: Date | null) => setCheckIn(date)}
          minDate={new Date()}
          dateFormat="dd/MM/yyyy"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean"
          placeholderText="Select date"
        />
      </div>

      {/* Check-out Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Check-out Date
        </label>
        <DatePicker
          selected={checkOut}
          onChange={(date: Date | null) => setCheckOut(date)}
          minDate={checkIn || new Date()}
          dateFormat="dd/MM/yyyy"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean"
          placeholderText="Select date"
        />
      </div>

      {/* Guests */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Guests
        </label>
        <select
          value={guests}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGuests(parseInt(e.target.value))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean"
        >
          {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Guest' : 'Guests'}
            </option>
          ))}
        </select>
      </div>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-gray-700 mb-2">
            <span>৳{room.price.toLocaleString()} × {nights} nights</span>
            <span>৳{total.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-ocean">৳{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={loading || !room.available}
        className="w-full py-3 bg-ocean text-white font-semibold rounded-lg hover:bg-ocean-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Processing...' : room.available ? 'Book Now' : 'Not Available'}
      </button>

      {!user && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Please <a href="/login" className="text-ocean hover:underline">login</a> to book
        </p>
      )}
    </div>
  )
}