import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type GalleryCarouselProps = {
  images: string[];
  name: string;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
};

const GalleryCarousel = ({
  images,
  name,
  currentIndex,
  onPrev,
  onNext,
  onSelect,
}: GalleryCarouselProps) => {
  if (images.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="relative h-96 w-full group">
        <img
          src={images[currentIndex]}
          alt={`${name} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
          loading="lazy"
          decoding="async"
        />
        {images.length > 1 ? (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg transition-all"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg transition-all"
            >
              <FiChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-white w-6" : "bg-white/50 w-2"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default GalleryCarousel;
