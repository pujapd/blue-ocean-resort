export interface User {
  id: string
  email: string
  username: string
  phone?: string
  avatar_url?: string
  created_at: string
}

export interface Room {
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

export interface Booking {
  id: string
  user_id: string
  room_id: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  room_id: string
  content: string
  likes: number
  dislikes: number
  created_at: string
  user?: User
}

export interface Rating {
  id: string
  user_id: string
  room_id: string
  rating: number
  review: string
  created_at: string
}