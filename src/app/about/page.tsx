export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-ocean to-ocean-dark text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-4">About Blue Ocean Resort</h1>
          <p className="text-xl opacity-90">Where luxury meets nature</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded in 2020, Blue Ocean Resort is nestled along the pristine 
              shores of Cox's Bazar, Bangladesh. Our resort offers a perfect blend 
              of luxury accommodation and natural beauty.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With world-class amenities, breathtaking ocean views, and warm 
              hospitality, we create unforgettable experiences for every guest. 
              Whether you are here for a romantic getaway, family vacation, or 
              business retreat, Blue Ocean Resort is your home away from home.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
              alt="Resort"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            { number: '50+', label: 'Luxury Rooms' },
            { number: '10K+', label: 'Happy Guests' },
            { number: '4.8', label: 'Average Rating' },
            { number: '24/7', label: 'Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-ocean mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* YouTube Video */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Take a Virtual Tour
          </h2>
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/qemqQHaeCYo"
              title="Resort Tour"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}