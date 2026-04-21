'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [statusFilter, setStatusFilter] = useState('all')
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/')
      return
    }
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin, authLoading])

  const fetchData = async () => {
    const { data: bookingData } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (title, price),
        profiles:user_id (username, email, phone)
      `)
      .order('created_at', { ascending: false })

    const { data: roomData } = await supabase.from('rooms').select('*')

    setBookings(bookingData || [])
    setRooms(roomData || [])
  }

  const filteredBookings = bookings.filter((b: any) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (dateRange.from && new Date(b.check_in) < new Date(dateRange.from)) return false
    if (dateRange.to && new Date(b.check_out) > new Date(dateRange.to)) return false
    return true
  })

  const totalRevenue = filteredBookings
    .filter((b: any) => b.status === 'confirmed')
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

  const totalPending = filteredBookings
    .filter((b: any) => b.status === 'pending')
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Blue Ocean Resort - Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #0288D1; border-bottom: 3px solid #0288D1; padding-bottom: 10px; }
            h2 { color: #01579B; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #0288D1; color: white; padding: 10px; text-align: left; }
            td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-box { flex: 1; background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #0288D1; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            .confirmed { color: green; font-weight: bold; }
            .pending { color: orange; font-weight: bold; }
            .cancelled { color: red; font-weight: bold; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>🏖️ Blue Ocean Resort - Booking Report</h1>
          <p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${filteredBookings.length}</div>
              <div>Total Bookings</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">৳${totalRevenue.toLocaleString()}</div>
              <div>Confirmed Revenue</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">৳${totalPending.toLocaleString()}</div>
              <div>Pending Amount</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${rooms.length}</div>
              <div>Total Rooms</div>
            </div>
          </div>

          <h2>Booking Details</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBookings.map((b: any, i: number) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${b.profiles?.username || 'N/A'}<br/><small>${b.profiles?.email || ''}</small></td>
                  <td>${b.rooms?.title || 'N/A'}</td>
                  <td>${new Date(b.check_in).toLocaleDateString()}</td>
                  <td>${new Date(b.check_out).toLocaleDateString()}</td>
                  <td>${b.guests}</td>
                  <td>৳${b.total_price?.toLocaleString()}</td>
                  <td class="${b.status}">${b.status?.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Room Summary</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Room</th>
                <th>Price/Night</th>
                <th>Capacity</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rooms.map((r: any, i: number) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${r.title}</td>
                  <td>৳${r.price?.toLocaleString()}</td>
                  <td>${r.capacity}</td>
                  <td>⭐ ${r.rating}</td>
                  <td class="${r.available ? 'confirmed' : 'cancelled'}">${r.available ? 'Available' : 'Disabled'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>© 2024 Blue Ocean Resort | This is a computer-generated report</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-ocean"></div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Reports</h1>
            <p className="text-gray-500">Crystal Report - Booking & Revenue</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ← Back to Admin
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-ocean text-white rounded-lg hover:bg-ocean-dark transition font-semibold"
            >
              🖨️ Print Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="font-bold text-lg mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div ref={printRef}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-ocean">{filteredBookings.length}</div>
              <div className="text-gray-500 text-sm">Total Bookings</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-green-600">৳{totalRevenue.toLocaleString()}</div>
              <div className="text-gray-500 text-sm">Confirmed Revenue</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-yellow-600">৳{totalPending.toLocaleString()}</div>
              <div className="text-gray-500 text-sm">Pending Amount</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-purple-600">{rooms.length}</div>
              <div className="text-gray-500 text-sm">Total Rooms</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ocean text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm">#</th>
                    <th className="px-4 py-3 text-left text-sm">Guest</th>
                    <th className="px-4 py-3 text-left text-sm">Room</th>
                    <th className="px-4 py-3 text-left text-sm">Check-in</th>
                    <th className="px-4 py-3 text-left text-sm">Check-out</th>
                    <th className="px-4 py-3 text-left text-sm">Guests</th>
                    <th className="px-4 py-3 text-left text-sm">Amount</th>
                    <th className="px-4 py-3 text-left text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBookings.map((booking: any, index: number) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm">{booking.profiles?.username || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{booking.profiles?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{booking.rooms?.title || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{new Date(booking.check_in).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">{new Date(booking.check_out).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-center">{booking.guests}</td>
                      <td className="px-4 py-3 text-sm font-bold text-ocean">৳{booking.total_price?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12 text-gray-500">No bookings found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

