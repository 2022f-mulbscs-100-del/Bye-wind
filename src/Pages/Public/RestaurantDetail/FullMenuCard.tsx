type MenuItem = {
  name: string;
  price: string;
  description: string;
  image?: string;
};

type FullMenuCardProps = {
  items: MenuItem[];
  fallbackImage?: string;
};

const FullMenuCard = ({ items, fallbackImage }: FullMenuCardProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Full menu</div>
      <div className="mt-4 grid grid-cols-1 gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Full menu is not available yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.name} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <img
                    src={
                      item.image ||
                      fallbackImage ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=240&h=180&fit=crop"
                    }
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.description}</div>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.price}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FullMenuCard;
