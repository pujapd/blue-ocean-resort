import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import PricePredictor from "@/components/features/PricePredictor";

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      {/* AI Price Predictor */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-ocean font-semibold text-sm uppercase tracking-widest mb-2">
                Smart Booking
              </p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                AI Price Predictor
              </h2>
              <div className="w-20 h-1 bg-ocean rounded-full mb-6"></div>
              <p className="text-gray-600 text-lg mb-4">
                Our AI-powered tool helps you estimate the cost of your stay
                based on room type, season, number of guests, and duration.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Instant price estimation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Season-based pricing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Multi-night discounts</span>
                </li>
              </ul>
            </div>
            <PricePredictor />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ocean to-ocean-dark text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready for Your Dream Vacation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Book your stay now and experience paradise
          </p>
          <a
            href="/rooms"
            className="inline-block px-10 py-4 bg-white text-ocean font-bold rounded-full hover:bg-gray-100 transition transform hover:scale-105"
          >
            Book Now
          </a>
        </div>
      </section>
    </div>
  );
}
