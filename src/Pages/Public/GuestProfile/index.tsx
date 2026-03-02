import { useEffect, useState } from "react";
import PublicNavbar from "../../../Components/Public/PublicNavbar";
import Loader from "../../../Components/loader";
import type { GuestProfileData } from "./types";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import UpcomingReservations from "./UpcomingReservations";
import RecentVisits from "./RecentVisits";
import SavedRestaurants from "./SavedRestaurants";
import Preferences from "./Preferences";
import BookingDetailsModal from "./BookingDetailsModal";

const defaultGuestProfile: GuestProfileData = {
  profile: {
    name: "Maya Carter",
    email: "maya.carter@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    memberSince: "January 2023",
    totalBookings: 28,
  },
  upcomingBookings: [
    {
      id: "1",
      restaurantName: "ByeWind Downtown",
      date: "2024-02-15",
      time: "7:30 PM",
      guests: 4,
      status: "confirmed",
    },
    {
      id: "2",
      restaurantName: "Uptown Garden",
      date: "2024-02-17",
      time: "6:00 PM",
      guests: 2,
      status: "confirmed",
    },
    {
      id: "3",
      restaurantName: "Marina Harbor",
      date: "2024-02-20",
      time: "8:00 PM",
      guests: 6,
      status: "pending",
    },
  ],
  savedRestaurants: [
    {
      id: "1",
      name: "Marina Harbor",
      cuisine: "Seafood",
      rating: 4.8,
      priceRange: "$$$",
    },
    {
      id: "2",
      name: "ByeWind Downtown",
      cuisine: "Modern American",
      rating: 4.6,
      priceRange: "$$",
    },
    {
      id: "3",
      name: "Uptown Garden",
      cuisine: "Italian",
      rating: 4.7,
      priceRange: "$$$",
    },
    {
      id: "4",
      name: "Sakura Sushi Bar",
      cuisine: "Japanese",
      rating: 4.9,
      priceRange: "$$$$",
    },
  ],
  recentVisits: [
    {
      restaurantName: "The Golden Spoon",
      visitDate: "Jan 28, 2024",
      rating: 5,
    },
    {
      restaurantName: "Café Lumière",
      visitDate: "Jan 15, 2024",
      rating: 4,
    },
    {
      restaurantName: "Spice Route",
      visitDate: "Dec 30, 2023",
    },
  ],
  preferences: {
    dietaryRestrictions: ["Vegetarian options preferred"],
    favoriteCuisines: ["Italian", "Japanese", "Mediterranean"],
  },
};

const GuestProfile = () => {
  const [data, setData] = useState<GuestProfileData>(defaultGuestProfile);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<GuestProfileData["upcomingBookings"][number] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState({
    name: defaultGuestProfile.profile.name,
    email: defaultGuestProfile.profile.email,
    phone: defaultGuestProfile.profile.phone,
    location: defaultGuestProfile.profile.location,
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/DummyApis/guest-profile.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (mounted && json) {
          const override = localStorage.getItem("guest_profile_override");
          const parsedOverride = override ? JSON.parse(override) : null;
          const nextProfile = parsedOverride
            ? { ...json.profile, ...parsedOverride }
            : json.profile;
          setData({ ...json, profile: nextProfile });
          setDraftProfile({
            name: nextProfile.name,
            email: nextProfile.email,
            phone: nextProfile.phone,
            location: nextProfile.location,
          });
        }
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader size={48} color="#0f172a" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full max-w-none px-10 py-10 space-y-6">
        <PublicNavbar />
        
        {/* Profile Header */}
        <ProfileHeader
          profile={data.profile}
          isEditing={isEditing}
          draftProfile={draftProfile}
          onToggleEdit={() => setIsEditing(true)}
          onCancel={() => {
            setDraftProfile({
              name: data.profile.name,
              email: data.profile.email,
              phone: data.profile.phone,
              location: data.profile.location,
            });
            setIsEditing(false);
          }}
          onSave={() => {
            const nextProfile = { ...data.profile, ...draftProfile };
            setData((prev) => ({ ...prev, profile: nextProfile }));
            localStorage.setItem("guest_profile_override", JSON.stringify(draftProfile));
            setIsEditing(false);
          }}
          onChange={(field, value) =>
            setDraftProfile((prev) => ({ ...prev, [field]: value }))
          }
        />
        <ProfileStats profile={data.profile} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Column - Upcoming Bookings */}
          <div className="lg:col-span-2 space-y-6">
            <UpcomingReservations
              bookings={data.upcomingBookings}
              formatDate={formatDate}
              onSelect={(booking) => {
                setSelectedBooking(booking);
                setIsBookingModalOpen(true);
              }}
            />

            {/* Recent Visits */}
            <RecentVisits visits={data.recentVisits} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Saved Restaurants */}
            <SavedRestaurants restaurants={data.savedRestaurants} />

            {/* Dining Preferences */}
            <Preferences preferences={data.preferences} />
          </div>
        </div>
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        open={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        formatDate={formatDate}
      />
    </div>
  );
};

export default GuestProfile;
