type MenuHighlight = { name: string; description: string; price: string; tag: string };

type MenuHighlightsCardProps = {
  items: MenuHighlight[];
};

const MenuHighlightsCard = ({ items }: MenuHighlightsCardProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Menu highlights</div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Menu highlights will be available soon.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                <span className="text-xs font-semibold text-slate-600">{item.price}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">{item.description}</div>
              <span className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {item.tag}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuHighlightsCard;
