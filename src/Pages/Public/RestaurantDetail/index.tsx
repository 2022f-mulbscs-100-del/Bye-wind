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
type TableOption = { id: string; label: string; seats: number; zone: string };
type PaymentMethod = { id: string; label: string };
type MenuHighlight = { name: string; description: string; price: string; tag: string };
type FloorHighlight = { label: string; value: string };
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
type FloorAreaPreview = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};
type FloorPayloadTable = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  seats: number;
  zone: string;
  shape: "Round" | "Square" | "Rectangle";
};
type FloorPayloadArea = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
type FloorPayloadLayout = {
  tables?: FloorPayloadTable[];
  areas?: FloorPayloadArea[];
};
type FloorPayload = {
  activeFloorId?: string;
  floors?: { id: string; label: string }[];
  settings?: {
    canvas?: {
      width?: number;
      height?: number;
    };
  };
  floorLayouts?: Record<string, FloorPayloadLayout>;
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<RestaurantDetailData>({
    restaurants: [],
    floorHighlights: [],
    floorTables: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
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
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [menuHighlights, setMenuHighlights] = useState<MenuHighlight[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dbFloors, setDbFloors] = useState<{ id: string; label: string }[]>([]);
  const [dbSelectedFloorId, setDbSelectedFloorId] = useState<string>("");
  const [dbFloorLayouts, setDbFloorLayouts] = useState<Record<string, FloorPayloadLayout>>({});
  const [dbCanvasSize, setDbCanvasSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 700,
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/DummyApis/restaurant-detail.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (mounted && json) setData(json);
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/DummyApis/menu-highlights.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!mounted || !json || !id) return;
        const highlights = json.highlightsById?.[id] ?? [];
        setMenuHighlights(highlights);
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    fetch("/DummyApis/restaurant-gallery.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!mounted || !json || !id) return;
        const images = json.galleryById?.[id] ?? [];
        setGalleryImages(images);
        setCurrentImageIndex(0);
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    fetch("/DummyApis/floor-management-db-payload.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: FloorPayload | null) => {
        if (!mounted || !json) return;
        const floors = json.floors ?? [];
        const layouts = json.floorLayouts ?? {};
        const fallbackFloorId = floors[0]?.id ?? Object.keys(layouts)[0] ?? "";
        const selectedFloorId = json.activeFloorId && layouts[json.activeFloorId]
          ? json.activeFloorId
          : fallbackFloorId;

        setDbFloors(floors);
        setDbFloorLayouts(layouts);
        setDbSelectedFloorId(selectedFloorId);
        setDbCanvasSize({
          width: json.settings?.canvas?.width ?? 1200,
          height: json.settings?.canvas?.height ?? 700,
        });
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReservationOpen) return;
    let mounted = true;
    setReservationLoading(true);
    Promise.all([
      fetch("/DummyApis/reservation-slots.json").then((res) =>
        res.ok ? res.json() : null
      ),
      fetch("/DummyApis/reservation-tables.json").then((res) =>
        res.ok ? res.json() : null
      ),
      fetch("/DummyApis/payment-methods.json").then((res) =>
        res.ok ? res.json() : null
      ),
    ])
      .then(([slotsJson, tablesJson, methodsJson]) => {
        if (!mounted) return;
        setSlots(slotsJson?.slots ?? []);
        setTables(tablesJson?.tables ?? []);
        setMethods(methodsJson?.methods ?? []);
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setReservationLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isReservationOpen]);

  const restaurant = data.restaurants.find((item) => item.id === id);
  const restaurantDetails =
    (id && data.detailsById ? data.detailsById[id] : undefined) ??
    (restaurant?.floorHighlights
      ? {
        floorHighlights: restaurant.floorHighlights,
        floorTables: restaurant.floorTables ?? data.floorTables,
        upcoming: restaurant.upcoming ?? data.upcoming,
      }
      : undefined);
  const selectedLayout = useMemo(
    () => (dbSelectedFloorId ? dbFloorLayouts[dbSelectedFloorId] : undefined),
    [dbFloorLayouts, dbSelectedFloorId]
  );
  const selectedLayoutTables = useMemo(
    () => selectedLayout?.tables ?? [],
    [selectedLayout]
  );
  const selectedLayoutArea = useMemo(
    () => selectedLayout?.areas?.[0],
    [selectedLayout]
  );
  const computedFloorHighlights = useMemo<FloorHighlight[]>(
    () =>
      Object.entries(
        selectedLayoutTables.reduce<Record<string, number>>((acc, table) => {
          acc[table.zone] = (acc[table.zone] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([zone, count]) => ({ label: zone, value: `${count} tables` })),
    [selectedLayoutTables]
  );
  const computedFloorTables = useMemo<FloorTable[]>(
    () =>
      selectedLayoutTables.map((table) => ({
        id: table.id,
        label: table.name,
        x: Math.round(table.x),
        y: Math.round(table.y),
        w: Math.max(54, Math.round(table.width)),
        h: Math.max(38, Math.round(table.height)),
        zone: table.zone,
        shape: table.shape,
        seats: table.seats,
        rotation: table.rotation,
      })),
    [selectedLayoutTables]
  );
  const computedFloorArea = useMemo<FloorAreaPreview | null>(
    () =>
      selectedLayoutArea
        ? {
          id: selectedLayoutArea.id,
          label: selectedLayoutArea.label,
          x: Math.round(selectedLayoutArea.x),
          y: Math.round(selectedLayoutArea.y),
          width: Math.round(selectedLayoutArea.width),
          height: Math.round(selectedLayoutArea.height),
        }
        : null,
    [selectedLayoutArea]
  );
  const floorHighlights =
    (computedFloorHighlights.length > 0 ? computedFloorHighlights : undefined) ??
    restaurantDetails?.floorHighlights ??
    data.floorHighlights ??
    [];
  const floorTables =
    (computedFloorTables.length > 0 ? computedFloorTables : undefined) ??
    restaurantDetails?.floorTables ??
    data.floorTables ??
    [];
  const floorArea = computedFloorArea;
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

  const handleReservationConfirm = () => {
    if (!restaurant || !selectedSlot || !selectedTable || !selectedMethod || !reservationDate) {
      return;
    }

    const reference = `BW-${Date.now().toString().slice(-6)}`;
    try {
      const stored = localStorage.getItem("guest_bookings");
      const existing = stored ? (JSON.parse(stored) as unknown[]) : [];
      const nextBooking = {
        id: `booking-${Date.now()}`,
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
      setReservationSuccess(`Booking confirmed. Reference: ${reference}`);
    } catch {
      setReservationSuccess("Booking confirmed.");
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

        <div className="grid grid-cols-1 gap-4">
          <FloorOverviewCard
            highlights={floorHighlights}
            tables={floorTables}
            area={floorArea}
            canvasWidth={dbCanvasSize.width}
            canvasHeight={dbCanvasSize.height}
            floors={dbFloors}
            selectedFloorId={dbSelectedFloorId}
            onFloorSelect={setDbSelectedFloorId}
          />
          <MenuHighlightsCard items={menuHighlights ?? []} />

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
        </div>

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
        reservationLoading={reservationLoading}
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
