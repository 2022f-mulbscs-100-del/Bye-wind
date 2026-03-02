import { Link } from "react-router-dom";

type QuickActionsCardProps = {
  isAuthenticated: boolean;
  isFavorite: boolean;
  onStartReservation: () => void;
  onToggleFavorite: () => void;
  onOpenReview: () => void;
  onLogin: () => void;
};

const QuickActionsCard = ({
  isAuthenticated,
  isFavorite,
  onStartReservation,
  onToggleFavorite,
  onOpenReview,
  onLogin,
}: QuickActionsCardProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Quick actions</div>
      {isAuthenticated ? (
        <>
          <p className="mt-2 text-sm text-slate-500">
            Manage your next visit faster with one-tap actions.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              onClick={onStartReservation}
            >
              Start reservation
            </button>
            <button
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                isFavorite
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
              onClick={onToggleFavorite}
            >
              {isFavorite ? "Added to favorites" : "Add to favorites"}
            </button>
            <Link
              to="/guest-profile"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-center text-xs font-semibold text-slate-600"
            >
              My bookings
            </Link>
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
              onClick={onOpenReview}
            >
              Leave a review
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to save favorites and manage bookings.
          </p>
          <button
            onClick={onLogin}
            className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Log in
          </button>
        </>
      )}
    </div>
  );
};

export default QuickActionsCard;
