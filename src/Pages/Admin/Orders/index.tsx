import { useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiX,
} from "react-icons/fi";

const orderStats = [
  { label: "New Orders", value: 42, icon: FiShoppingBag, tone: "text-blue-600 bg-blue-50" },
  { label: "Preparing", value: 18, icon: FiPackage, tone: "text-amber-600 bg-amber-50" },
  { label: "Out for Delivery", value: 9, icon: FiTruck, tone: "text-indigo-600 bg-indigo-50" },
  { label: "Completed", value: 126, icon: FiCheckCircle, tone: "text-emerald-600 bg-emerald-50" },
];

const recentOrders = [
  {
    id: "ORD-4021",
    customer: "Maya Carter",
    items: 4,
    total: "$58.00",
    channel: "Online",
    eta: "18 min",
    status: "Preparing",
    createdAt: "Today, 7:12 PM",
    payment: "Card • Paid",
    address: "221B Market Street, Manhattan, NY",
    itemsList: [
      { name: "Butter Chicken Curry", qty: 2, price: 16 },
      { name: "Garlic Naan", qty: 2, price: 4 },
      { name: "Mango Lassi", qty: 1, price: 6 },
    ],
  },
  {
    id: "ORD-4020",
    customer: "Noah Patel",
    items: 2,
    total: "$24.00",
    channel: "Counter",
    eta: "Ready",
    status: "Ready",
    createdAt: "Today, 6:58 PM",
    payment: "Cash • Pending",
    address: "Pickup at counter",
    itemsList: [
      { name: "Lamb Biryani", qty: 1, price: 18 },
      { name: "Naan Platter", qty: 1, price: 6 },
    ],
  },
  {
    id: "ORD-4019",
    customer: "Ava Diaz",
    items: 5,
    total: "$71.00",
    channel: "App",
    eta: "12 min",
    status: "Out for delivery",
    createdAt: "Today, 6:40 PM",
    payment: "Wallet • Paid",
    address: "18 Sunset Blvd, Queens, NY",
    itemsList: [
      { name: "Palak Paneer", qty: 2, price: 14 },
      { name: "Jeera Rice", qty: 1, price: 7 },
      { name: "Masala Chai", qty: 2, price: 4 },
    ],
  },
  {
    id: "ORD-4018",
    customer: "Liam Nguyen",
    items: 3,
    total: "$36.00",
    channel: "Online",
    eta: "Delivered",
    status: "Completed",
    createdAt: "Today, 5:52 PM",
    payment: "Card • Paid",
    address: "390 Pine Ave, Brooklyn, NY",
    itemsList: [
      { name: "Tandoori Naan Platter", qty: 1, price: 12 },
      { name: "Chicken Korma", qty: 1, price: 14 },
      { name: "Soda", qty: 1, price: 3 },
    ],
  },
];

const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = recentOrders.find((order) => order.id === selectedOrderId) ?? null;

  const orderSubtotal = selectedOrder
    ? selectedOrder.itemsList.reduce((sum, row) => sum + row.qty * row.price, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Operations
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">Orders</div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
          <FiClock />
          Live updates
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {orderStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {stat.label}
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${stat.tone}`}>
                <stat.icon />
              </div>
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-slate-900">Recent orders</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Channel</th>
                <th className="pb-3 font-medium">ETA</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{order.id}</td>
                  <td className="py-3">{order.customer}</td>
                  <td className="py-3">{order.items}</td>
                  <td className="py-3">{order.total}</td>
                  <td className="py-3">{order.channel}</td>
                  <td className="py-3">{order.eta}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : order.status === "Out for delivery"
                          ? "bg-indigo-50 text-indigo-600"
                          : order.status === "Ready"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Order summary
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{selectedOrder.id}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-xs text-slate-500">Customer</div>
                  <div className="font-semibold text-slate-900">{selectedOrder.customer}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-xs text-slate-500">Created</div>
                  <div className="font-semibold text-slate-900">{selectedOrder.createdAt}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-xs text-slate-500">Channel & ETA</div>
                  <div className="font-semibold text-slate-900">
                    {selectedOrder.channel} • {selectedOrder.eta}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-xs text-slate-500">Payment</div>
                  <div className="font-semibold text-slate-900">{selectedOrder.payment}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FiShoppingBag className="text-slate-400" />
                  Ordered items
                </div>
                <div className="space-y-2">
                  {selectedOrder.itemsList.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        {item.qty} × {item.name}
                      </span>
                      <span className="font-medium text-slate-900">
                        ${(item.qty * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-semibold text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">${orderSubtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <FiMapPin className="mt-0.5 text-slate-400" />
                <span>{selectedOrder.address}</span>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <FiAlertCircle className="mt-0.5 text-slate-400" />
                <span>Current status: {selectedOrder.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
