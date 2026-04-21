'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RoomCard from '@/components/rooms/RoomCard'
import Pagination from '@/components/common/Pagination'
import toast from 'react-hot-toast'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [filteredRooms, setFilteredRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState('all')
  const [capacityFilter, setCapacityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const roomsPerPage = 6

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [rooms, searchTerm, priceRange, capacityFilter])

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRooms(data || [])
    } catch (error: any) {
      toast.error('Failed to load rooms')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    let filtered = [...rooms]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(room => {
        if (max) {
          return room.price >= min && room.price <= max
        } else {
          return room.price >= min
        }
      })
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      filtered = filtered.filter(room => room.capacity >= parseInt(capacityFilter))
    }

    setFilteredRooms(filtered)
    setCurrentPage(1) // Reset to first page
  }

  // Pagination
  const indexOfLastRoom = currentPage * roomsPerPage
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-ocean"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Rooms</h1>
          <p className="text-xl text-gray-600">Find your perfect accommodation</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean"
              >
                <option value="all">All Prices</option>
                <option value="0-10000">৳0 - ৳10,000</option>
                <option value="10000-20000">৳10,000 - ৳20,000</option>
                <option value="20000-30000">৳20,000 - ৳30,000</option>
                <option value="30000">৳30,000+</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean"
              >
                <option value="all">Any</option>
                <option value="2">2+ Guests</option>
                <option value="4">4+ Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {currentRooms.length} of {filteredRooms.length} rooms
          </div>
        </div>

        {/* Rooms Grid */}
        {currentRooms.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No rooms found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}