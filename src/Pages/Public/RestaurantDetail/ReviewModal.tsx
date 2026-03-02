type ReviewModalProps = {
  open: boolean;
  rating: number;
  text: string;
  error: string;
  onClose: () => void;
  onRatingChange: (value: number) => void;
  onTextChange: (value: string) => void;
  onSubmit: () => void;
};

const ReviewModal = ({
  open,
  rating,
  text,
  error,
  onClose,
  onRatingChange,
  onTextChange,
  onSubmit,
}: ReviewModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Review</div>
            <div className="text-lg font-semibold text-slate-900">Leave a review</div>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Rating</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    rating === value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                  onClick={() => onRatingChange(value)}
                >
                  {value}★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Your review</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
              rows={4}
              placeholder="Share your experience..."
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            onClick={onSubmit}
          >
            Submit review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
