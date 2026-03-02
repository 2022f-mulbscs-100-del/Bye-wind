import Loader from "../../../Components/loader";

type ReservationStep = "slot" | "table" | "payment" | "confirm";
type Slot = { id: string; label: string; status: "Available" | "Limited" | "Full" };
type TableOption = { id: string; label: string; seats: number; zone: string };
type PaymentMethod = { id: string; label: string };

type SummaryItem = { label: string; value: string };

type ReservationModalProps = {
  open: boolean;
  restaurantName: string;
  step: ReservationStep;
  reservationLoading: boolean;
  slots: Slot[];
  tables: TableOption[];
  methods: PaymentMethod[];
  selectedSlotId?: string | null;
  selectedTableId?: string | null;
  selectedMethodId?: string | null;
  summaryItems: SummaryItem[];
  onSelectSlot: (slot: Slot) => void;
  onSelectTable: (table: TableOption) => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onClose: () => void;
  onBack: () => void;
  onReset: () => void;
  onConfirm: () => void;
};

const ReservationModal = ({
  open,
  restaurantName,
  step,
  reservationLoading,
  slots,
  tables,
  methods,
  selectedSlotId,
  selectedTableId,
  selectedMethodId,
  summaryItems,
  onSelectSlot,
  onSelectTable,
  onSelectMethod,
  onClose,
  onBack,
  onReset,
  onConfirm,
}: ReservationModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Reservation
            </div>
            <div className="text-lg font-semibold text-slate-900">{restaurantName}</div>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {["slot", "table", "payment", "confirm"].map((key) => (
              <span
                key={key}
                className={`rounded-full px-3 py-1 ${
                  step === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {key === "slot"
                  ? "Select time"
                  : key === "table"
                  ? "Choose table"
                  : key === "payment"
                  ? "Payment"
                  : "Confirm"}
              </span>
            ))}
          </div>

          {reservationLoading ? (
            <div className="mt-6 flex items-center justify-center">
              <Loader size={36} color="#0f172a" />
            </div>
          ) : (
            <>
              {step === "slot" ? (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(slots ?? []).map((slot) => (
                    <button
                      key={slot.id}
                      disabled={slot.status === "Full"}
                      onClick={() => onSelectSlot(slot)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                        slot.status === "Full"
                          ? "border-slate-100 bg-slate-50 text-slate-400"
                          : selectedSlotId === slot.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div>{slot.label}</div>
                      <div className="mt-1 text-xs font-medium text-slate-400">
                        {slot.status}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === "table" ? (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(tables ?? []).map((table) => (
                    <button
                      key={table.id}
                      onClick={() => onSelectTable(table)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                        selectedTableId === table.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div>{table.label}</div>
                      <div className="mt-1 text-xs font-medium text-slate-400">
                        {table.zone} · {table.seats} seats
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === "payment" ? (
                <div className="mt-6 grid grid-cols-1 gap-3">
                  {(methods ?? []).map((method) => (
                    <button
                      key={method.id}
                      onClick={() => onSelectMethod(method)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                        selectedMethodId === method.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {step === "confirm" ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Booking summary
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      {summaryItems.map((item) => (
                        <div key={item.label} className="flex justify-between gap-3">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="font-medium text-slate-700">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                    onClick={onConfirm}
                  >
                    Confirm booking
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm">
          <button
            className="text-slate-500 hover:text-slate-700"
            onClick={onBack}
            disabled={step === "slot"}
          >
            Back
          </button>
          <button className="text-slate-500 hover:text-slate-700" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
