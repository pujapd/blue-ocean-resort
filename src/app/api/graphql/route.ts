import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const typeDefs = `
  type Room {
    id: ID!
    title: String!
    description: String
    price: Float!
    capacity: Int!
    amenities: [String]
    images: [String]
    rating: Float
    available: Boolean
  }

  type Booking {
    id: ID!
    user_id: String!
    room_id: String!
    check_in: String!
    check_out: String!
    guests: Int!
    total_price: Float!
    status: String!
  }

  type Query {
    rooms: [Room]
    room(id: ID!): Room
    bookings(userId: String!): [Booking]
  }
`

async function handleGraphQL(query: string, variables: any = {}) {
  // Parse query type
  if (query.includes('rooms') && !query.includes('room(')) {
    const { data } = await supabase.from('rooms').select('*').eq('available', true)
    return { data: { rooms: data } }
  }

  if (query.includes('room(')) {
    const id = variables.id
    const { data } = await supabase.from('rooms').select('*').eq('id', id).single()
    return { data: { room: data } }
  }

  if (query.includes('bookings')) {
    const userId = variables.userId
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
    return { data: { bookings: data } }
  }

  return { data: null }
}

export async function POST(request: NextRequest) {
  try {
    const { query, variables } = await request.json()
    const result = await handleGraphQL(query, variables)

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { errors: [{ message: error.message }] },
      { status: 500 }
    )
  }
}

// Return schema for GET
export async function GET() {
  return NextResponse.json({
    schema: typeDefs,
    message: 'Blue Ocean Resort GraphQL API',
    endpoints: {
      rooms: 'Query all rooms',
      room: 'Query single room by ID',
      bookings: 'Query user bookings',
    },
  })
}