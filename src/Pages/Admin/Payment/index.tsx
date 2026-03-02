import {
  FiAlertTriangle,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiGift,
  FiRefreshCw,
  FiShield,
  FiShuffle,
  FiTag,
} from "react-icons/fi";

const recentPayments = [
  {
    id: "p-204",
    guest: "Maya Carter",
    amount: "$126.50",
    method: "Visa •••• 1284",
    status: "Paid",
    date: "Today, 6:12 PM",
  },
  {
    id: "p-205",
    guest: "Liam Nguyen",
    amount: "$58.90",
    method: "Apple Pay",
    status: "Pending",
    date: "Today, 5:40 PM",
  },
  {
    id: "p-206",
    guest: "Ava Diaz",
    amount: "$210.00",
    method: "Mastercard •••• 7711",
    status: "Refunded",
    date: "Yesterday, 8:32 PM",
  },
];

const Payment = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Payments & Billing
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">Payment</div>
        </div>
        <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm">
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Today Revenue", value: "$4,250", icon: FiDollarSign },
          { label: "Pending", value: "$980", icon: FiRefreshCw },
          { label: "Refunds", value: "$210", icon: FiFileText },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase text-slate-400">
                {item.label}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <item.icon />
              </div>
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Payment gateway processing</div>
              <p className="mt-1 text-sm text-slate-500">
                PCI compliant gateways with tokenization and webhooks.
              </p>
            </div>
            <FiShield className="text-slate-400" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 px-4 py-2">Stripe · Connected</div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">Square · Connected</div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">Webhooks · Active</div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">Tokenization · Enabled</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiAlertTriangle /> Payment failures & retries
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Retry policy: 3 attempts over 24h · Notify guest on failure
          </div>
          <button className="mt-4 w-full rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            Configure retries
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="text-sm font-semibold text-slate-900">Deposits & Prepaid</div>
          <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Deposit: 20% for parties 6+ · USD
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Prepaid: Required for peak hours and special events
          </div>
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            Configure rules
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="text-sm font-semibold text-slate-900">Cancellation & No‑show charges</div>
          <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            24h window · $25 penalty · Auto charge
          </div>
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            Edit policies
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Recent payments</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Guest</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{payment.guest}</td>
                    <td className="py-3">{payment.amount}</td>
                    <td className="py-3">{payment.method}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        payment.status === "Paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : payment.status === "Refunded"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiShuffle /> Split & multi‑method payments
            </div>
            <div className="mt-2 text-sm text-slate-600">Card + Wallet + Gift card</div>
            <button className="mt-4 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              Configure methods
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiGift /> Gift cards & stored value
            </div>
            <div className="mt-2 text-sm text-slate-600">Issue, manage, redeem balances</div>
            <button className="mt-4 w-full rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
              Manage gift cards
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="text-sm font-semibold text-slate-900">Subscription & SaaS billing</div>
          <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Plan: Scale · Annual · Renewal in 24 days
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Manage plan</button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">View invoices</button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Invoices & receipts</div>
          <div className="mt-2 text-sm text-slate-600">Auto‑generated with tax breakdowns</div>
          <button className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            Download sample
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FiTag /> Financial audit & reconciliation
        </div>
        <div className="mt-2 text-sm text-slate-600">Export reports for accounting and compliance.</div>
        <button className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
          Export reconciliation
        </button>
      </div>
    </div>
  );
};

export default Payment;
