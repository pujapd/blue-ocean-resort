'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface RatingSectionProps {
  roomId: string
}

export default function RatingSection({ roomId }: RatingSectionProps) {
  const { user } = useAuth()
  const [ratings, setRatings] = useState<any[]>([])
  const [userRating, setUserRating] = useState<number>(0)
  const [review, setReview] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRatings()
    if (user) {
      fetchUserRating()
    }
  }, [roomId, user])

  const fetchRatings = async () => {
    const { data } = await supabase
      .from('ratings')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })

    setRatings(data || [])
  }

  const fetchUserRating = async () => {
    if (!user) return

    const { data } = await supabase
      .from('ratings')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single()

    if (data) {
      setUserRating(data.rating)
      setReview(data.review || '')
    }
  }

  const handleSubmitRating = async () => {
    if (!user) {
      toast.error('Please login to rate')
      return
    }

    if (userRating === 0) {
      toast.error('Please select a rating')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          room_id: roomId,
          rating: userRating,
          review: review.trim(),
        })

      if (error) throw error

      toast.success('Rating submitted!')
      fetchRatings()
      
      // Update room average rating
      updateRoomRating()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateRoomRating = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('rating')
      .eq('room_id', roomId)

    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
      await supabase
        .from('rooms')
        .update({ rating: parseFloat(avg.toFixed(1)) })
        .eq('id', roomId)
    }
  }

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0.0'

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ratings & Reviews</h2>

      {/* Average Rating */}
      <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
        <div className="text-center">
          <div className="text-5xl font-bold text-ocean">{averageRating}</div>
          <div className="text-gray-500 text-sm mt-1">{ratings.length} reviews</div>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-8 h-8 ${
                star <= parseFloat(averageRating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Add Rating (if logged in) */}
      {user && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Your Rating</h3>
          
          {/* Star Rating */}
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setUserRating(star)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 transition ${
                    star <= (hoveredStar || userRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>

          {/* Review Text */}
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review (optional)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean mb-3"
            rows={3}
          />

          <button
            onClick={handleSubmitRating}
            disabled={loading || userRating === 0}
            className="px-6 py-2 bg-ocean text-white rounded-lg hover:bg-ocean-dark disabled:opacity-50 transition"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="border-b pb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-900">
                  {rating.profiles?.username || 'Anonymous'}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(rating.created_at).toLocaleDateString()}
              </span>
            </div>
            {rating.review && (
              <p className="text-gray-700 text-sm">{rating.review}</p>
            )}
          </div>
        ))}
      </div>

      {ratings.length === 0 && (
        <p className="text-center text-gray-500 py-8">No reviews yet. Be the first!</p>
      )}
    </div>
  )
}