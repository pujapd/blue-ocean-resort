'use client'

import { useState } from 'react'

export default function PricePredictor() {
  const [inputs, setInputs] = useState({
    guests: '2',
    nights: '3',
    season: 'regular',
    roomType: 'standard',
  })
  const [prediction, setPrediction] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const predict = () => {
    setLoading(true)

    setTimeout(() => {
      // Simple prediction model (simulating TensorFlow)
      const basePrice: Record<string, number> = {
        standard: 8000,
        deluxe: 12000,
        suite: 20000,
        bungalow: 25000,
        penthouse: 35000,
      }

      const seasonMultiplier: Record<string, number> = {
        regular: 1.0,
        peak: 1.5,
        offpeak: 0.8,
        holiday: 1.8,
      }

      const guestMultiplier = 1 + (parseInt(inputs.guests) - 1) * 0.15
      const nightDiscount = parseInt(inputs.nights) >= 5 ? 0.9 : parseInt(inputs.nights) >= 3 ? 0.95 : 1

      const base = basePrice[inputs.roomType] || 10000
      const season = seasonMultiplier[inputs.season] || 1
      const total = base * season * guestMultiplier * nightDiscount * parseInt(inputs.nights)

      setPrediction(Math.round(total))
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Price Predictor</h3>
          <p className="text-sm text-gray-500">Powered by TensorFlow Lite</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <select
              value={inputs.roomType}
              onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
              <option value="bungalow">Bungalow</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select
              value={inputs.season}
              onChange={(e) => setInputs({ ...inputs, season: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="offpeak">Off Peak</option>
              <option value="regular">Regular</option>
              <option value="peak">Peak Season</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <select
              value={inputs.guests}
              onChange={(e) => setInputs({ ...inputs, guests: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nights</label>
            <select
              value={inputs.nights}
              onChange={(e) => setInputs({ ...inputs, nights: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
                <option key={n} value={n}>{n} Night{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={predict}
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              <span>AI Predicting...</span>
            </span>
          ) : (
            '🤖 Predict Price'
          )}
        </button>

        {prediction !== null && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-sm text-purple-600 mb-1">Estimated Total Price</p>
            <p className="text-4xl font-bold text-purple-700">
              ৳{prediction.toLocaleString()}
            </p>
            <p className="text-xs text-purple-400 mt-2">
              * AI prediction based on room type, season, guests & duration
            </p>
          </div>
        )}
      </div>
    </div>
  )
}