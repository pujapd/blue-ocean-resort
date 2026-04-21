"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "add" | "manage" | "bookings" | "users"
  >("dashboard");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    capacity: "2",
    amenities: "",
    image1: "",
    image2: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && user && !isAdmin) {
      toast.error("❌ Access Denied! Admin only.");
      router.push("/");
      return;
    }
    if (isAdmin) {
      fetchRooms();
      fetchAllBookings();
      fetchAllUsers();
    }
  }, [isAdmin, authLoading, user]);

  const fetchRooms = async () => {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });
    setRooms(data || []);
  };

  const fetchAllBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select(
        `
        *,
        rooms:room_id (title, price),
        profiles:user_id (username, email, phone)
      `,
      )
      .order("created_at", { ascending: false });
    setAllBookings(data || []);
  };

  const fetchAllUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setAllUsers(data || []);
  };

  // Add Room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amenitiesArray = formData.amenities
        .split(",")
        .map((a: string) => a.trim())
        .filter((a: string) => a !== "");

      const imagesArray = [formData.image1, formData.image2].filter(
        (i: string) => i !== "",
      );

      const { error } = await supabase.from("rooms").insert([
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          capacity: parseInt(formData.capacity),
          amenities:
            amenitiesArray.length > 0 ? amenitiesArray : ["WiFi", "AC"],
          images:
            imagesArray.length > 0
              ? imagesArray
              : [
                  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                ],
          rating: 0,
          available: true,
        },
      ]);

      if (error) throw error;

      toast.success("Room added! 🎉");
      setFormData({
        title: "",
        description: "",
        price: "",
        capacity: "2",
        amenities: "",
        image1: "",
        image2: "",
      });
      fetchRooms();
      setActiveTab("manage");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);
      if (error) throw error;
      toast.success("Room deleted!");
      fetchRooms();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed";
      toast.error(message);
    }
  };

  // Toggle Room Availability
  const handleToggleRoom = async (roomId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("rooms")
      .update({ available: !currentStatus })
      .eq("id", roomId);

    if (!error) {
      toast.success(!currentStatus ? "Room enabled ✅" : "Room disabled ❌");
      fetchRooms();
    }
  };

  // Booking Status Change
  const handleBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (!error) {
      toast.success(`Booking ${status}!`);
      fetchAllBookings();
    }
  };

  // Add Sample Rooms
  const addSampleRooms = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("rooms").insert([
        {
          title: "Ocean View Deluxe",
          description:
            "Spacious room with stunning ocean views and modern amenities. Perfect for couples.",
          price: 12000,
          capacity: 2,
          amenities: ["WiFi", "AC", "TV", "Mini Bar", "Balcony", "Sea View"],
          images: [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
          ],
          rating: 4.5,
          available: true,
        },
        {
          title: "Family Suite",
          description:
            "Large suite perfect for families with separate living area and two bedrooms.",
          price: 20000,
          capacity: 4,
          amenities: [
            "WiFi",
            "AC",
            "TV",
            "Kitchen",
            "Living Room",
            "2 Bedrooms",
          ],
          images: [
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
          ],
          rating: 4.8,
          available: true,
        },
        {
          title: "Beach Bungalow",
          description:
            "Private bungalow right on the beach with direct beach access and private pool.",
          price: 25000,
          capacity: 3,
          amenities: [
            "WiFi",
            "AC",
            "TV",
            "Beach Access",
            "Private Pool",
            "Kitchen",
          ],
          images: [
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
          ],
          rating: 5.0,
          available: true,
        },
        {
          title: "Standard Room",
          description:
            "Comfortable and affordable room with all basic amenities for budget travelers.",
          price: 8000,
          capacity: 2,
          amenities: ["WiFi", "AC", "TV", "Mini Fridge"],
          images: [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
          ],
          rating: 4.0,
          available: true,
        },
        {
          title: "Luxury Penthouse",
          description:
            "Ultimate luxury with panoramic ocean views, private terrace, and premium amenities.",
          price: 35000,
          capacity: 6,
          amenities: [
            "WiFi",
            "AC",
            "TV",
            "Kitchen",
            "Jacuzzi",
            "Terrace",
            "Butler Service",
          ],
          images: [
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
          ],
          rating: 5.0,
          available: true,
        },
        {
          title: "Garden View Room",
          description:
            "Peaceful room overlooking our beautiful tropical gardens. Perfect for nature lovers.",
          price: 10000,
          capacity: 2,
          amenities: ["WiFi", "AC", "TV", "Garden View", "Balcony"],
          images: [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
          ],
          rating: 4.3,
          available: true,
        },
      ]);

      if (error) throw error;
      toast.success("6 sample rooms added! 🎉");
      fetchRooms();
      setActiveTab("manage");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-ocean mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  // Stats
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r: any) => r.available).length;
  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(
    (b: any) => b.status === "pending",
  ).length;
  const confirmedBookings = allBookings.filter(
    (b: any) => b.status === "confirmed",
  ).length;
  const totalRevenue = allBookings
    .filter((b: any) => b.status === "confirmed")
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
  const totalUsers = allUsers.filter((u: any) => u.role !== "admin").length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">⚙️ Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Blue Ocean Resort Management</p>
          </div>
          <div className="bg-red-600 px-4 py-2 rounded-full text-sm font-semibold">
            🔑 {profile?.username || "Admin"}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-blue-600">{totalRooms}</div>
            <div className="text-gray-500 text-xs mt-1">Total Rooms</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-green-600">
              {availableRooms}
            </div>
            <div className="text-gray-500 text-xs mt-1">Available</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-red-600">
              {totalRooms - availableRooms}
            </div>
            <div className="text-gray-500 text-xs mt-1">Disabled</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalBookings}
            </div>
            <div className="text-gray-500 text-xs mt-1">Bookings</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pendingBookings}
            </div>
            <div className="text-gray-500 text-xs mt-1">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {confirmedBookings}
            </div>
            <div className="text-gray-500 text-xs mt-1">Confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalUsers}
            </div>
            <div className="text-gray-500 text-xs mt-1">Clients</div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-ocean to-ocean-dark text-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Revenue (Confirmed)</p>
              <p className="text-4xl font-bold mt-1">
                ৳{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-6xl opacity-20">💰</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "dashboard", label: "📊 Dashboard" },
            { key: "add", label: "➕ Add Room" },
            { key: "manage", label: "🛏️ Manage Rooms" },
            { key: "bookings", label: "📋 Bookings" },
            { key: "users", label: "👥 Users" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2.5 rounded-lg font-semibold transition text-sm ${
                activeTab === tab.key
                  ? "bg-ocean text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Bookings
              </h2>
              {allBookings.slice(0, 5).map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-semibold">
                      {booking.rooms?.title || "Room"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.profiles?.username} •{" "}
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-ocean">
                      ৳{booking.total_price?.toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {allBookings.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No bookings yet
                </p>
              )}
            </div>

            {/* Quick Add */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("add")}
                  className="py-4 bg-ocean text-white font-semibold rounded-lg hover:bg-ocean-dark transition"
                >
                  ➕ Add New Room
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                >
                  📋 View All Bookings
                </button>
                <button
                  onClick={() => router.push("/admin/reports")}
                  className="py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
                >
                  📊 View Reports
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ADD ROOM TAB ==================== */}
        {activeTab === "add" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Room
              </h2>

              <form onSubmit={handleAddRoom} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                    placeholder="e.g. Ocean View Deluxe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                    rows={4}
                    placeholder="Describe the room..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (৳/night) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                      placeholder="12000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Guests *
                    </label>
                    <select
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} Guests
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amenities (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) =>
                      setFormData({ ...formData, amenities: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                    placeholder="WiFi, AC, TV, Pool, Balcony"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL 1
                  </label>
                  <input
                    type="url"
                    value={formData.image1}
                    onChange={(e) =>
                      setFormData({ ...formData, image1: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL 2 (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.image2}
                    onChange={(e) =>
                      setFormData({ ...formData, image2: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Image Preview */}
                {formData.image1 && (
                  <div className="rounded-lg overflow-hidden h-48">
                    <img
                      src={formData.image1}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-ocean text-white font-semibold rounded-lg hover:bg-ocean-dark disabled:opacity-50 transition text-lg"
                >
                  {loading ? "Adding..." : "➕ Add Room"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== MANAGE ROOMS TAB ==================== */}
        {activeTab === "manage" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                All Rooms ({rooms.length})
              </h2>
              <button
                onClick={() => setActiveTab("add")}
                className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean-dark transition text-sm"
              >
                ➕ Add Room
              </button>
            </div>

            {rooms.map((room: any) => (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-48 h-32 md:h-auto">
                    <img
                      src={
                        room.images?.[0] ||
                        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400"
                      }
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-grow p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {room.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        ৳{room.price?.toLocaleString()}/night • {room.capacity}{" "}
                        guests • ⭐ {room.rating}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        ID: {room.id.substring(0, 8)}...
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          room.available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {room.available ? "✅ Available" : "❌ Disabled"}
                      </span>

                      <button
                        onClick={() =>
                          handleToggleRoom(room.id, room.available)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          room.available
                            ? "bg-yellow-500 text-white hover:bg-yellow-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {room.available ? "Disable" : "Enable"}
                      </button>

                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {rooms.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <p className="text-5xl mb-4">🏨</p>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No rooms yet
                </h3>
                <p className="text-gray-500 mb-4">Add your first room!</p>
                <button
                  onClick={addSampleRooms}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  ⚡ Add 6 Sample Rooms
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== BOOKINGS TAB ==================== */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              All Bookings ({allBookings.length})
            </h2>

            {allBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md p-5"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg text-gray-900">
                        {booking.rooms?.title || "Room"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Client</p>
                        <p className="font-semibold text-sm">
                          👤 {booking.profiles?.username || "User"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.profiles?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="font-semibold text-sm">
                          📅 {new Date(booking.check_in).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="font-semibold text-sm">
                          📅 {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-bold text-ocean text-lg">
                          ৳{booking.total_price?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      👥 {booking.guests} guests • 🕐 Booked:{" "}
                      {new Date(booking.created_at).toLocaleDateString()}
                      {booking.profiles?.phone &&
                        ` • 📞 ${booking.profiles.phone}`}
                    </p>
                  </div>

                  {/* Actions */}
                  {booking.status === "pending" && (
                    <div className="flex lg:flex-col gap-2 lg:justify-center">
                      <button
                        onClick={() =>
                          handleBookingStatus(booking.id, "confirmed")
                        }
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleBookingStatus(booking.id, "cancelled")
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {allBookings.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <p className="text-5xl mb-4">📋</p>
                <h3 className="text-xl font-semibold text-gray-700">
                  No bookings yet
                </h3>
                <p className="text-gray-500">Bookings will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== USERS TAB ==================== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              All Users ({allUsers.length})
            </h2>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{u.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {u.phone || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            u.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role === "admin" ? "🔑 Admin" : "👤 Client"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {allUsers.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <p className="text-gray-500">No users yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
