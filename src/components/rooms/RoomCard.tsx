'use client'

import Link from 'next/link'
import Image from 'next/image'

interface RoomCardProps {
  room: {
    id: string
    title: string
    description: string
    price: number
    capacity: number
    amenities: string[]
    images: string[]
    rating: number
    available: boolean
  }
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={room.images[0]}
          alt={room.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        {!room.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">Not Available</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
          <div className="flex items-center space-x-1">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold text-gray-700">{room.rating}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.title}</h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
            >
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Capacity */}
        <div className="flex items-center text-gray-600 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Up to {room.capacity} guests</span>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-ocean">৳{room.price.toLocaleString()}</span>
            <span className="text-gray-500 text-sm ml-1">/night</span>
          </div>
          <Link
            href={`/rooms/${room.id}`}
            className="px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean-dark transition font-semibold"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}