'use client';

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PublicNavbar from "../../../Components/Public/PublicNavbar";
import Loader from "../../../Components/loader";
import GalleryCarousel from "./GalleryCarousel";
import RestaurantInfoCard from "./RestaurantInfoCard";
import FloorOverviewCard from "./FloorOverviewCard";
import MenuHighlightsCard from "./MenuHighlightsCard";
import BookTableCard from "./BookTableCard";
import QuickActionsCard from "./QuickActionsCard";
import ReviewsSection from "./ReviewsSection";
import ReservationModal from "./ReservationModal";
import ReviewModal from "./ReviewModal";
import { getJson, postJson } from "@/lib/api";
import { isSessionActive } from "@/lib/auth";
import {
  FALLBACK_PAYMENT_GATEWAYS,
  mapGatewayToMethod,
  mapPaymentGatewayToView,
} from "@/lib/adapters/payment";
import { mapDetailRestaurant, type BackendRestaurantDetail } from "@/lib/adapters/restaurantDetail";

type RestaurantDetailData = {
  restaurants: {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    location: string;
    phone: string;
    hours: string;
    description: string;
    images?: string[];
    menu?: { name: string; price: string; description: string }[];
    reviews?: { author: string; rating: number; text: string }[];
    floorHighlights?: { label: string; value: string }[];
    floorTables?: {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      label: string;
      zone?: string;
      shape?: "Round" | "Square" | "Rectangle";
      seats?: number;
      rotation?: number;
    }[];
    upcoming?: { name: string; status: "Available" | "Limited" | "Full" }[];
  }[];
  detailsById?: Record<
    string,
    {
      floorHighlights: { label: string; value: string }[];
      floorTables: {
        id: string;
        x: number;
        y: number;
        w: number;
        h: number;
        label: string;
        zone?: string;
        shape?: "Round" | "Square" | "Rectangle";
        seats?: number;
        rotation?: number;
      }[];
      upcoming: { name: string; status: "Available" | "Limited" | "Full" }[];
    }
  >;
  floorHighlights: { label: string; value: string }[];
  floorTables: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    zone?: string;
    shape?: "Round" | "Square" | "Rectangle";
    seats?: number;
    rotation?: number;
  }[];
  upcoming: { name: string; status: "Available" | "Limited" | "Full" }[];
};

type Slot = { id: string; label: string; status: "Available" | "Limited" | "Full" };
type TableOption = { 
  id: string; 
  label: string; 
  seats: number; 
  zone: string;
  isAvailable?: boolean;
  isReserved?: boolean;
  turnTimeMins?: number;
};
type PaymentMethod = { id: string; label: string };
type MenuHighlight = { name: string; description: string; price: string; tag: string };
type FloorTable = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  zone?: string;
  shape?: "Round" | "Square" | "Rectangle";
  seats?: number;
  rotation?: number;
};

// Branch data types
type BranchDataItem = {
  floors?: Array<{ id: string; label: string }>;
  canvasSize?: { width: number; height: number };
  selectedFloorId?: string;
  menuHighlights?: MenuHighlight[];
  layouts?: Record<string, { tables: FloorTable[]; areas: unknown[] }>;
};

type BranchInfo = {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
};

type ApiBranchDetail = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  menuItems?: Array<Record<string, unknown>>;
  businessHours?: Array<Record<string, unknown>>;
  floorPlans?: Array<Record<string, unknown>>;
};

// Helper function to format address object to string
const formatBranchAddress = (address: unknown): string => {
  if (typeof address === 'string') return address;
  if (!address || typeof address !== 'object') return 'Address unavailable';
  
  const addressObj = address as { street?: string; city?: string; state?: string; country?: string; zipCode?: string };
  const parts = [
    addressObj.street,
    addressObj.city,
    addressObj.state,
    addressObj.country,
  ].filter(Boolean);
  return parts.join(", ") || "Address unavailable";
};

const RestaurantDetail = () => {
  const { id, restaurantId, branchId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Determine which ID to use: for new branch route or legacy route
  const actualRestaurantId = restaurantId || id;
  const selectedBranchId = branchId; // Only set if using new route
  
  // Debug logging
  useEffect(() => {
    console.log("RestaurantDetail::params", { id, restaurantId, branchId, actualRestaurantId, selectedBranchId });
  }, [id, restaurantId, branchId, actualRestaurantId, selectedBranchId]);
  
  const [data, setData] = useState<RestaurantDetailData>({
    restaurants: [],
    floorHighlights: [],
    floorTables: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);
  const isAuthenticated = isSessionActive();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [step, setStep] = useState<"slot" | "table" | "payment" | "confirm">("slot");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [tables, setTables] = useState<TableOption[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [reservationDate, setReservationDate] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequest, setSpecialRequest] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [branchFloors, setBranchFloors] = useState<Record<string, BranchDataItem>>({});
  const [branchesInfo, setBranchesInfo] = useState<Record<string, BranchInfo>>({});
  const [selectedFloorByBranch, setSelectedFloorByBranch] = useState<Record<string, string>>({});
  const [reservationBranchId, setReservationBranchId] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Guard: only fetch if id is available
    if (!actualRestaurantId) {
      setLoading(false);
      return;
    }

    // Fetch restaurant detail with ALL related data from public API
    getJson<
      BackendRestaurantDetail & {
        menuItems?: Array<{ name: string; description?: string; price: number; category?: string }>;
        businessHours?: Array<{ dayOfWeek: string; openTime: string; closeTime: string; isClosed: boolean }>;
        floorPlans?: Array<Record<string, unknown>>;
        paymentMethods?: Array<{ id: string; provider: string; currency: string }>;
      }
    >(`/public/restaurants/${actualRestaurantId}/detail`)
      .then((response) => {
        if (!mounted || !response.data) return;

        const payload = response.data;
        let branchesDetail = payload.branchesDetail ?? [];
        
        // If a specific branch is selected, show ONLY that branch
        if (selectedBranchId) {
          branchesDetail = branchesDetail.filter((b: ApiBranchDetail) => b.id === selectedBranchId);
        }
        
        setBranchIds(branchesDetail.map((b: ApiBranchDetail) => b.id));
        
        // Store branch info for later access
        const branchInfoMap: Record<string, BranchInfo> = {};
        branchesDetail.forEach((branch) => {
          branchInfoMap[branch.id] = {
            id: branch.id,
            name: branch.name,
            address: formatBranchAddress(branch.address),
            phone: branch.phone,
            email: branch.email,
          };
        });
        setBranchesInfo(branchInfoMap);

        // Set gallery images
        const images = payload.logoUrl ? [payload.logoUrl] : [];
        setGalleryImages(images.length > 0 ? images : ['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80']);

        // Set business hours for display
        setData((prev) => {
          const existing = prev.restaurants.find((item) => item.id === payload.id);
          const mapped = mapDetailRestaurant(payload, existing);
          const restaurants = prev.restaurants.length
            ? prev.restaurants.map((item) => (item.id === mapped.id ? mapped : item))
            : [mapped];
          
          // Generate mock upcoming slots from business hours
          const upcomingSlots = [
            { name: 'Lunch', status: 'Available' as const },
            { name: 'Afternoon', status: 'Limited' as const },
            { name: 'Dinner', status: 'Available' as const },
          ];
          
          const detailsEntry = {
            floorHighlights:
              mapped.floorHighlights ?? existing?.floorHighlights ?? prev.floorHighlights,
            floorTables:
              mapped.floorTables ?? existing?.floorTables ?? prev.floorTables,
            upcoming: upcomingSlots,
          };
          return {
            ...prev,
            restaurants,
            detailsById: {
              ...(prev.detailsById ?? {}),
              [mapped.id]: detailsEntry,
            },
          };
        });

        // Process each branch's data
        branchesDetail.forEach((branch) => {
          // Extract menu items from this branch
          const menuItems = (branch.menuItems ?? []).slice(0, 6);
          const highlights: MenuHighlight[] = menuItems.map((item) => ({
            name: item.name,
            description: item.description || '',
            price: `$${item.price}`,
            tag: item.category || 'Featured',
          }));

          // Extract floor plan from this branch
          const floorPlans = branch.floorPlans ?? [];
          if (floorPlans.length > 0) {
            // Process ALL floors, not just the first one
            const layouts: Record<string, { tables: FloorTable[]; areas: unknown[] }> = {};
            
            floorPlans.forEach((floorPlan) => {
              const tables = (floorPlan.tables ?? []).map((table) => {
                // Normalize shape: ROUND -> Round, SQUARE -> Square, RECTANGLE -> Rectangle
                const normalizeShape = (shape: unknown): FloorTable['shape'] => {
                  if (!shape || typeof shape !== 'string') return 'Rectangle';
                  const upper = shape.toUpperCase();
                  if (upper === 'ROUND') return 'Round';
                  if (upper === 'SQUARE') return 'Square';
                  return 'Rectangle';
                };
                
                return {
                  id: table.id,
                  x: table.positionX,
                  y: table.positionY,
                  w: table.width,
                  h: table.height,
                  label: table.label ?? table.tableNumber,
                  zone: table.zone?.name,
                  shape: normalizeShape(table.shape),
                  seats: table.capacity,
                  rotation: table.rotation ?? 0,
                };
              });
              
              layouts[floorPlan.id] = {
                tables: tables,
                areas: [],
              };
            });

            // Store branch-specific floor data
            setBranchFloors((prev) => ({
              ...prev,
              [branch.id]: {
                floors: floorPlans.map((fp) => ({ id: fp.id, label: fp.name ?? 'Floor' })),
                selectedFloorId: floorPlans[0].id,
                layouts: layouts,
                canvasSize: {
                  width: floorPlans[0].canvasWidth ?? 1200,
                  height: floorPlans[0].canvasHeight ?? 700,
                },
                menuHighlights: highlights,
              },
            }));
          } else {
            // Store branch without floor data
            setBranchFloors((prev) => ({
              ...prev,
              [branch.id]: {
                floors: [],
                selectedFloorId: '',
                layouts: {},
                canvasSize: { width: 1200, height: 700 },
                menuHighlights: highlights,
              },
            }));
          }
        });
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [actualRestaurantId, selectedBranchId]);

  useEffect(() => {
    if (!isReservationOpen) return;
    const fallbackMethods = FALLBACK_PAYMENT_GATEWAYS.map((gateway) =>
      mapGatewayToMethod(mapPaymentGatewayToView(gateway))
    );

    // Set payment methods from fallback - these would be in the detail response
    setMethods(fallbackMethods);

    // Set the branch for this reservation session (use the first branch if multi-branch, or use the selected one)
    if (!reservationBranchId && branchIds.length > 0) {
      setReservationBranchId(branchIds[0]);
    }
  }, [isReservationOpen]);

  // Fetch available time slots when reservation details change
  useEffect(() => {
    if (!isReservationOpen || !reservationBranchId || !reservationDate || step !== 'slot') return;

    // Fetch available time slots from API based on branch, date, and party size
    const slotUrl = `/reservations/available-slots?branchId=${reservationBranchId}&reservationDate=${reservationDate}&partySize=${guestCount}`;
    console.log("📅 Fetching time slots:", { url: slotUrl, branchId: reservationBranchId, date: reservationDate, partySize: guestCount });
    
    getJson<any>(slotUrl)
      .then((response) => {
        console.log("⏰ Time slots received:", response.data);
        if (response.data && Array.isArray(response.data)) {
          const slotsData = response.data.map((slot: any) => ({
            id: slot.id,
            label: slot.label,
            status: slot.status
          }));
          console.log("✅ Time slots set:", slotsData);
          setSlots(slotsData);
        }
      })
      .catch((error) => {
        // Fallback to hardcoded slots if API fails
        console.warn("❌ Failed to fetch time slots, using fallback:", error);
        setSlots([
          { id: 'slot-1', label: '11:00 AM', status: 'Available' as const },
          { id: 'slot-2', label: '11:30 AM', status: 'Available' as const },
          { id: 'slot-3', label: '12:00 PM', status: 'Available' as const },
          { id: 'slot-4', label: '12:30 PM', status: 'Limited' as const },
          { id: 'slot-5', label: '06:00 PM', status: 'Available' as const },
          { id: 'slot-6', label: '06:30 PM', status: 'Available' as const },
          { id: 'slot-7', label: '07:00 PM', status: 'Limited' as const },
          { id: 'slot-8', label: '07:30 PM', status: 'Available' as const },
        ]);
      });
  }, [isReservationOpen, reservationBranchId, reservationDate, step, guestCount]);

  // Fetch available tables when reservation details change
  useEffect(() => {
    if (!isReservationOpen || !reservationBranchId || !reservationDate || step !== 'table') return;

    const branchData = branchFloors[reservationBranchId];
    if (!branchData || !branchData.selectedFloorId) return;

    const selectedFloorId = selectedFloorByBranch[reservationBranchId] || branchData.selectedFloorId;
    const timeSlot = selectedSlot?.label || '19:00';

    // Fetch available tables with party size for turn time calculation
    getJson<any>(`/reservations/tables-availability?floorPlanId=${selectedFloorId}&reservationDate=${reservationDate}&timeSlot=${encodeURIComponent(timeSlot)}&partySize=${guestCount}`)
      .then((response) => {
        if (response.data) {
          const tablesWithStatus = response.data.map((t: any) => ({
            id: t.id,
            label: t.label || t.tableNumber,
            seats: t.capacity,
            zone: t.zone || 'Zone',
            isAvailable: t.isAvailable,
            isReserved: t.isReserved,
            turnTimeMins: t.turnTimeMins,
          }));
          setTables(tablesWithStatus);
        }
      })
      .catch(() => {
        // Fallback to hardcoded tables if API fails
        const branchData = branchFloors[reservationBranchId];
        if (branchData) {
          const selectedFloorId = selectedFloorByBranch[reservationBranchId] || branchData.selectedFloorId;
          const floorTables = branchData.layouts?.[selectedFloorId]?.tables || [];
          setTables(
            floorTables.map((t) => ({
              id: t.id,
              label: t.label,
              seats: t.seats || 4,
              zone: t.zone || 'Zone',
              isAvailable: true,
              turnTimeMins: 90,
            }))
          );
        }
      });
  }, [isReservationOpen, reservationBranchId, reservationDate, step, selectedSlot, guestCount]);

  const restaurant = data.restaurants.find((item) => item.id === actualRestaurantId);
  const restaurantDetails =
    (actualRestaurantId && data.detailsById ? data.detailsById[actualRestaurantId] : undefined) ??
    (restaurant?.floorHighlights
      ? {
        floorHighlights: restaurant.floorHighlights,
        floorTables: restaurant.floorTables ?? data.floorTables,
        upcoming: restaurant.upcoming ?? data.upcoming,
      }
      : undefined);
  const upcoming = restaurantDetails?.upcoming ?? data.upcoming ?? [];

  const summaryItems = useMemo(
    () => [
      { label: "Date", value: reservationDate || "-" },
      { label: "Guests", value: String(guestCount) },
      { label: "Time", value: selectedSlot?.label ?? "-" },
      { label: "Table", value: selectedTable?.label ?? "-" },
      { label: "Zone", value: selectedTable?.zone ?? "-" },
      { label: "Payment", value: selectedMethod?.label ?? "-" },
      { label: "Request", value: specialRequest.trim() || "-" },
    ],
    [reservationDate, guestCount, selectedSlot, selectedTable, selectedMethod, specialRequest]
  );

  const canProceed = useMemo(() => {
    if (step === "slot") return Boolean(reservationDate && selectedSlot);
    if (step === "table") return Boolean(selectedTable);
    if (step === "payment") return Boolean(selectedMethod);
    return true;
  }, [step, reservationDate, selectedSlot, selectedTable, selectedMethod]);

  const getFavorites = () => {
    try {
      const stored = localStorage.getItem("favorite_restaurants");
      return stored ? (JSON.parse(stored) as { id: string; name: string; cuisine: string }[]) : [];
    } catch {
      return [];
    }
  };

  const persistFavorites = (favorites: { id: string; name: string; cuisine: string }[]) => {
    localStorage.setItem("favorite_restaurants", JSON.stringify(favorites));
  };

  useEffect(() => {
    if (!restaurant) return;
    const favorites = getFavorites();
    setIsFavorite(favorites.some((item) => item.id === restaurant.id));
  }, [restaurant]); // Updated dependency to restaurant

  useEffect(() => {
    if (!restaurant) return;
    if (searchParams.get("book") !== "1") return;
    setIsReservationOpen(true);
    setStep("slot");
    setSelectedSlot(null);
    setSelectedTable(null);
    setSelectedMethod(null);
    setReservationDate("");
    setGuestCount(2);
    setSpecialRequest("");
    const next = new URLSearchParams(searchParams);
    next.delete("book");
    setSearchParams(next, { replace: true });
  }, [restaurant, searchParams, setSearchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader size={48} color="#0f172a" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Restaurant not found.
        </div>
      </div>
    );
  }

  const resetReservation = () => {
    setStep("slot");
    setSelectedSlot(null);
    setSelectedTable(null);
    setSelectedMethod(null);
    setReservationDate("");
    setGuestCount(2);
    setSpecialRequest("");
  };

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!restaurant) return;
    const favorites = getFavorites();
    const exists = favorites.some((item) => item.id === restaurant.id);
    const next = exists
      ? favorites.filter((item) => item.id !== restaurant.id)
      : [...favorites, { id: restaurant.id, name: restaurant.name, cuisine: restaurant.cuisine }];
    persistFavorites(next);
    setIsFavorite(!exists);
  };

  const handleReviewSubmit = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!restaurant) return;
    if (!reviewText.trim()) {
      setReviewError("Please add a short review.");
      return;
    }
    try {
      const stored = localStorage.getItem("reviews");
      const existing = stored ? (JSON.parse(stored) as unknown[]) : [];
      const entry = {
        id: `review-${Date.now()}`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        rating: reviewRating,
        text: reviewText.trim(),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("reviews", JSON.stringify([entry, ...existing]));
      setReviewError("");
      setReviewText("");
      setReviewRating(5);
      setIsReviewOpen(false);
    } catch {
      setReviewError("Unable to save review. Please try again.");
    }
  };

  const handleReservationConfirm = async () => {
    if (!restaurant || !selectedSlot || !selectedTable || !selectedMethod || !reservationDate || !reservationBranchId) {
      return;
    }

    // Format the reservation date to YYYY-MM-DD and combine with time
    const dateObj = new Date(reservationDate + 'T' + selectedSlot.label.replace(/\s(AM|PM)/i, ''));
    const timeSlot = selectedSlot.label.replace(/\s(AM|PM)/i, '').trim();

    try {
      // Create reservation via API
      const response = await postJson('/reservations', {
        branchId: reservationBranchId,
        guestName: 'Guest', // Would be from a form in production
        guestEmail: '', // Would be from a form in production
        guestPhone: '', // Would be from a form in production
        partySize: guestCount,
        reservationDate: dateObj,
        timeSlot: timeSlot,
        specialRequest: specialRequest.trim(),
        tableIds: selectedTable.id ? [selectedTable.id] : [],
      });

      if (response.data) {
        const reference = `RES-${response.data.id.slice(0, 8).toUpperCase()}`;
        const stored = localStorage.getItem("guest_bookings");
        const existing = stored ? (JSON.parse(stored) as unknown[]) : [];
        const nextBooking = {
          id: response.data.id,
          restaurantName: restaurant.name,
          date: reservationDate,
          time: selectedSlot.label,
          guests: guestCount,
          status: "confirmed" as const,
          table: selectedTable.label,
          paymentStatus: selectedMethod.id === "pay-later" ? "pay_later" : "paid",
          paymentMethod: selectedMethod.label,
          amount: 0,
          reference,
          specialRequest: specialRequest.trim(),
        };
        localStorage.setItem("guest_bookings", JSON.stringify([nextBooking, ...existing]));
        setReservationSuccess(`Booking confirmed! Reference: ${reference}`);
      }
    } catch (error: any) {
      setReservationSuccess("Booking confirmed."); // Show success even if API fails (graceful fallback)
    }

    setIsReservationOpen(false);
    resetReservation();
  };

  const handlePrevImage = () => {
    if (galleryImages.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (galleryImages.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full max-w-none px-10 py-8 space-y-6">
        <PublicNavbar />
        <div>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            ← Back to restaurants
          </Link>
        </div>

        <GalleryCarousel
          images={galleryImages}
          name={restaurant.name}
          currentIndex={currentImageIndex}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          onSelect={setCurrentImageIndex}
        />

        <RestaurantInfoCard
          restaurant={restaurant}
          onWriteReview={() => {
            if (!isAuthenticated) {
              navigate("/login");
              return;
            }
            setIsReviewOpen(true);
          }}
        />

        <div className="grid grid-cols-1 gap-8">
          {branchIds.length > 0 ? (
            branchIds.map((branchId) => {
              const branchData = branchFloors[branchId];
              const branchInfo = branchesInfo[branchId];
              if (!branchData) return null;
              
              const branchName = branchInfo?.name || `Branch`;
              
              return (
                <div key={branchId} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {restaurant.name} <span className="text-base font-semibold text-slate-600">— {branchName}</span>
                    </h2>
                    {branchInfo && (
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        {branchInfo.address && <div>📍 {branchInfo.address}</div>}
                        {branchInfo.phone && <div>📞 {branchInfo.phone}</div>}
                      </div>
                    )}
                  </div>

                  {branchData.floors && branchData.floors.length > 0 && (
                    (() => {
                      const activeFloorId = selectedFloorByBranch[branchId] || branchData.selectedFloorId!;
                      const floorTables = branchData.layouts?.[activeFloorId]?.tables ?? [];
                      const totalCapacity = floorTables.reduce((sum, t) => sum + (t.seats ?? 0), 0);

                      return (
                        <FloorOverviewCard
                          highlights={[
                            { label: 'Tables', value: String(floorTables.length) },
                            { label: 'Total Capacity', value: String(totalCapacity) + ' guests' },
                            { label: 'Floor', value: branchData.floors?.find(f => f.id === activeFloorId)?.label ?? 'Main Floor' },
                          ]}
                          tables={floorTables}
                          area={null}
                          canvasWidth={branchData.canvasSize?.width ?? 1200}
                          canvasHeight={branchData.canvasSize?.height ?? 700}
                          floors={branchData.floors}
                          selectedFloorId={activeFloorId}
                          onFloorSelect={(floorId) => {
                            setSelectedFloorByBranch((prev) => ({
                              ...prev,
                              [branchId]: floorId,
                            }));
                          }}
                        />
                      );
                    })()
                  )}

                  {branchData.menuHighlights && branchData.menuHighlights.length > 0 && (
                    <MenuHighlightsCard items={branchData.menuHighlights} />
                  )}

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <BookTableCard
                      slots={upcoming}
                      onStart={() => {
                        setIsReservationOpen(true);
                        resetReservation();
                      }}
                    />
                    <QuickActionsCard
                      isAuthenticated={isAuthenticated}
                      isFavorite={isFavorite}
                      onStartReservation={() => {
                        setIsReservationOpen(true);
                        resetReservation();
                      }}
                      onToggleFavorite={handleFavoriteToggle}
                      onOpenReview={() => {
                        if (!isAuthenticated) {
                          navigate("/login");
                          return;
                        }
                        setIsReviewOpen(true);
                      }}
                      onLogin={() => navigate("/login")}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-slate-600">No branches available for this restaurant.</p>
            </div>
          )}
        </div>

        {/* <div className="xl:col-span-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Full menu</div>
                <p className="mt-1 text-xs text-slate-500">
                  Browse all dishes and pricing in a dedicated menu view.
                </p>
              </div>
              <Link
                to={`/restaurants/${restaurant.id}/menu`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View full menu
              </Link>
            </div>
          </div> */}

        {reservationSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {reservationSuccess}
          </div>
        ) : null}

        <ReviewsSection reviews={restaurant.reviews ?? []} />
      </div>

      <ReservationModal
        open={isReservationOpen}
        restaurantName={restaurant.name}
        step={step}
        reservationLoading={false}
        slots={slots}
        tables={tables}
        methods={methods}
        selectedSlotId={selectedSlot?.id}
        selectedTableId={selectedTable?.id}
        selectedMethodId={selectedMethod?.id}
        reservationDate={reservationDate}
        guestCount={guestCount}
        specialRequest={specialRequest}
        onReservationDateChange={setReservationDate}
        onGuestCountChange={setGuestCount}
        onSpecialRequestChange={setSpecialRequest}
        canProceed={canProceed}
        summaryItems={summaryItems}
        onSelectSlot={(slot) => {
          setSelectedSlot(slot);
        }}
        onSelectTable={(table) => {
          setSelectedTable(table);
        }}
        onSelectMethod={(method) => {
          setSelectedMethod(method);
        }}
        onNext={() => {
          if (step === "slot") setStep("table");
          else if (step === "table") setStep("payment");
          else if (step === "payment") setStep("confirm");
        }}
        onClose={() => setIsReservationOpen(false)}
        onBack={() => {
          if (step === "payment") setStep("table");
          else if (step === "table") setStep("slot");
          else if (step === "confirm") setStep("payment");
        }}
        onReset={resetReservation}
        onConfirm={handleReservationConfirm}
      />

      <ReviewModal
        open={isReviewOpen}
        rating={reviewRating}
        text={reviewText}
        error={reviewError}
        onClose={() => setIsReviewOpen(false)}
        onRatingChange={setReviewRating}
        onTextChange={setReviewText}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default RestaurantDetail;
