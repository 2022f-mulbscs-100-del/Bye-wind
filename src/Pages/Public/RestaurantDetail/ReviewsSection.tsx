import { FiStar } from "react-icons/fi";

type Review = { author: string; rating: number; text: string };

type ReviewsSectionProps = {
  reviews: Review[];
};

const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
  if (reviews.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900 mb-4">Guest Reviews</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-slate-900 text-sm">{review.author}</div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
