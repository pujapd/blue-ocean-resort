'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Real-time username check
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    setUsernameStatus(data ? 'taken' : 'available')
  }

  // Debounce username check
  let usernameTimer: NodeJS.Timeout
  const handleUsernameChange = (value: string) => {
    setFormData({ ...formData, username: value })
    clearTimeout(usernameTimer)
    usernameTimer = setTimeout(() => checkUsername(value), 500)
  }

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email'
    }

    if (formData.phone && !/^01[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone format: 01XXXXXXXXX'
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (usernameStatus === 'taken') {
      newErrors.username = 'Username already taken'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      await signUp(formData.email, formData.password, formData.username, formData.phone)
      toast.success('Registration successful! 🎉')
      
      // Auto login after registration
      router.push('/')
      window.location.href = '/'
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-ocean rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">BO</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-2">Join Blue Ocean Resort</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Choose a username"
            required
          />
          {/* Username Status */}
          {usernameStatus === 'checking' && (
            <p className="text-sm text-gray-500 mt-1">⏳ Checking...</p>
          )}
          {usernameStatus === 'available' && (
            <p className="text-sm text-green-600 mt-1">✅ Username available!</p>
          )}
          {usernameStatus === 'taken' && (
            <p className="text-sm text-red-600 mt-1">❌ Username already taken</p>
          )}
          {errors.username && usernameStatus !== 'taken' && (
            <p className="text-sm text-red-600 mt-1">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
            required
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone (Optional)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="01XXXXXXXXX"
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Minimum 6 characters"
            required
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Re-enter password"
            required
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || usernameStatus === 'taken'}
          className="w-full py-3 bg-ocean text-white font-semibold rounded-lg hover:bg-ocean-dark disabled:opacity-50 transition text-lg"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-ocean hover:underline font-semibold">
          Login here
        </a>
      </p>
    </div>
  )
}