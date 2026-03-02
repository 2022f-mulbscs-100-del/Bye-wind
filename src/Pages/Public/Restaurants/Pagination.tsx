type PaginationProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ totalPages, currentPage, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`rounded-full border px-4 py-2 text-xs font-semibold ${currentPage === 1
            ? "border-slate-200 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-full border px-3 py-2 text-xs font-semibold ${currentPage === page
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`rounded-full border px-4 py-2 text-xs font-semibold ${currentPage === totalPages
            ? "border-slate-200 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
