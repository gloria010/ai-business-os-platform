//Sales.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MessageForm from "../../components/Businesses/MessageForm";
import {
  LayoutDashboard, DollarSign, ShoppingCart, BarChart3, Bell, MessageSquare, Brain,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar,
} from "recharts";

// ---- Types matching the orders table / routes/user/orders.js API ----
type Order = {
  id: number;
  order_code: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  product: string;
  quantity: number;
  price: string | number;
  gst: string | number;
  total: string | number;
  payment_method: string | null;
  payment_status: "Paid" | "Pending" | "Refunded" | "Failed";
  transaction_id: string | null;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  order_date: string;
  delivery_date: string | null;
  address: string | null;
  created_at: string;
};

type ReportSummary = {
  totalRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  completedOrders: number;
  productsSold: number;
  topProduct: string;
  topProductUnits: number;
};

type MonthlySalesPoint = { month: string; sales: number };
type ProductSalesPoint = { product: string; sold: number };

const statusColors: Record<Order["status"], string> = {
  Pending: "bg-orange-100 text-orange-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const paymentStatusColor = (status: string) =>
  status === "Paid" ? "text-green-600" : status === "Refunded" ? "text-blue-600" : "text-red-600";

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Sales() {

  const { company } = useParams();

const companyNames: Record<string, string> = {
  "techzone-store": "TechZone Store",
  "urban-fashion-hub": "Urban Fashion Hub",
  "luxe-living-furniture": "Luxe Living Furniture",
  "prosports-gear": "ProSports Gear",
  "glow-beauty-studio": "Glow Beauty Studio",
};
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // ---- Orders (real data) ----
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const loadOrders = async () => {
    if (!company) return;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/sales/${company}/orders`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        setOrdersError(data.message || "Failed to load orders.");
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      setOrdersError("Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (order: Order, newStatus: Order["status"]) => {
    if (!company) return;
    setStatusUpdatingId(order.id);
    try {
      const res = await fetch(
        `http://localhost:5000/api/sales/${company}/orders/${order.id}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder?.id === order.id) {
          setSelectedOrder({ ...order, status: newStatus });
        }
      } else {
        alert(data.message || "Failed to update order status.");
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // ---- Reports (real data) ----
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesPoint[]>([]);
  const [productSales, setProductSales] = useState<ProductSalesPoint[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const loadReports = async () => {
    if (!company) return;
    setReportsLoading(true);
    setReportsError(null);
    try {
      const [summaryRes, monthlyRes, productRes] = await Promise.all([
        fetch(`http://localhost:5000/api/sales/${company}/reports/summary`, { credentials: "include" }),
        fetch(`http://localhost:5000/api/sales/${company}/reports/monthly-sales`, { credentials: "include" }),
        fetch(`http://localhost:5000/api/sales/${company}/reports/product-sales`, { credentials: "include" }),
      ]);

      const [summaryData, monthlyData, productData] = await Promise.all([
        summaryRes.json(),
        monthlyRes.json(),
        productRes.json(),
      ]);

      if (summaryData.success) setReportSummary(summaryData.summary);
      if (monthlyData.success) setMonthlySales(monthlyData.monthlySales);
      if (productData.success) setProductSales(productData.productSales);

      if (!summaryData.success || !monthlyData.success || !productData.success) {
        setReportsError("Some report data failed to load.");
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
      setReportsError("Failed to load reports.");
    } finally {
      setReportsLoading(false);
    }
  };

  // ---- Notifications (real messages sent to Sales department) ----
  type DeptMessage = {
    id: number;
    from_name: string;
    from_department: string;
    to_recipient: string;
    subject: string;
    message: string;
    created_at: string;
  };
  const [deptMessages, setDeptMessages] = useState<DeptMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const loadNotifications = async () => {
    if (!company) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages?businessId=${company}&to=Sales`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setDeptMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "notifications" || activeMenu === "dashboard") {
      loadNotifications();
    }
    if (activeMenu === "orders" || activeMenu === "dashboard" || activeMenu === "sales") {
      loadOrders();
    }
    if (activeMenu === "reports" || activeMenu === "sales") {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, company]);

const communicationMessages = [
  {
    id: 1,
    sender: "Sales Manager",
    color: "blue",
    border: "border-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    time: "Today • 9:15 AM",
    message:
      "Laptop sales increased by 18% this week. We recommend adding more inventory before the weekend.",
  },
  {
    id: 2,
    sender: "Business Owner",
    color: "green",
    border: "border-green-600",
    bg: "bg-green-50",
    text: "text-green-700",
    time: "Today • 10:00 AM",
    message:
      "Approved. Increase the stock by 100 units and inform the warehouse team.",
  },
  {
    id: 3,
    sender: "Sales Executive",
    color: "yellow",
    border: "border-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    time: "Yesterday",
    message:
      "Several customers requested an additional 10% discount on smartphones during the festival sale.",
  },
  {
    id: 4,
    sender: "Marketing Team",
    color: "purple",
    border: "border-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-700",
    time: "Yesterday",
    message:
      "A new social media campaign will begin tomorrow to boost weekend sales.",
  },
  {
    id: 5,
    sender: "Warehouse Team",
    color: "red",
    border: "border-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    time: "2 Days Ago",
    message:
      "Inventory for wireless keyboards is running low. Please arrange replenishment within two days.",
  },
];

  return (
     <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg border-r">
        <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">
             {companyNames[company || ""] || "Business Workspace"}
          </h1>

          <p className="text-slate-500 text-sm">
            Sales Workspace
          </p>

        </div>

        <nav className="p-4 space-y-2">

          {/* Dashboard */}

          <button
            onClick={() => setActiveMenu("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "dashboard"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          {/* Sales */}

          <button
            onClick={() => setActiveMenu("sales")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "sales"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <DollarSign size={20} />
            Sales
          </button>

          {/* Orders */}

          <button
            onClick={() => setActiveMenu("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "orders"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <ShoppingCart size={20} />
            Order Management
          </button>

          {/* Reports */}

          <button
            onClick={() => setActiveMenu("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "reports"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <BarChart3 size={20} />
            Reports
          </button>

          {/* Notifications */}

          <button
            onClick={() => setActiveMenu("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "notifications"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <Bell size={20} />
            Notifications
          </button>

          <button
  onClick={() => setActiveMenu("messages")}
  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
    activeMenu === "messages"
      ? "bg-blue-600 text-white"
      : "hover:bg-slate-100"
  }`}
>
  <MessageSquare size={20} />
  Messages
</button>

          {/* Business Communication */}

          <button
            onClick={() => setActiveMenu("communication")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "communication"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <MessageSquare size={20} />
            Business Communication
          </button>

          {/* AI Analytics */}

          <button
            onClick={() => setActiveMenu("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeMenu === "analytics"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            <Brain size={20} />
            AI Analytics
          </button>

        </nav>

      </aside>

      {/* Main */}

      <main className="flex-1 p-8">

        <h1 className="text-3xl font-bold mb-8">
          Sales Workspace
        </h1>

        {/* ================= Dashboard ================= */}

{activeMenu === "dashboard" && (

<div className="space-y-8">

  {/* Top Cards */}

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

    {/* Total Sales */}

    <div
      onClick={() => setActiveMenu("sales")}
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition"
    >

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500 text-sm">
            Total Sales
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {reportSummary ? formatCurrency(reportSummary.totalRevenue) : "—"}
          </h2>

        </div>

        <div className="bg-green-100 p-4 rounded-full">

          <DollarSign className="text-green-600" size={28} />

        </div>

      </div>

    </div>

    {/* Orders */}

    <div
      onClick={() => setActiveMenu("orders")}
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition"
    >

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500 text-sm">
            Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {orders.length}
          </h2>

        </div>

        <div className="bg-blue-100 p-4 rounded-full">

          <ShoppingCart className="text-blue-600" size={28} />

        </div>

      </div>

    </div>

    {/* Reports */}

    <div
      onClick={() => setActiveMenu("reports")}
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition"
    >

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500 text-sm">
            Completed Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {reportSummary?.completedOrders ?? "—"}
          </h2>

        </div>

        <div className="bg-purple-100 p-4 rounded-full">

          <BarChart3 className="text-purple-600" size={28} />

        </div>

      </div>

    </div>

    {/* Notifications */}

    <div
      onClick={() => setActiveMenu("notifications")}
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition"
    >

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500 text-sm">
            Notifications
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {deptMessages.length}
          </h2>

        </div>

        <div className="bg-yellow-100 p-4 rounded-full">

          <Bell className="text-yellow-600" size={28} />

        </div>

      </div>

    </div>

  </div>

  {/* Quick Access */}

  <div className="bg-white rounded-2xl shadow-lg p-6">

    <h2 className="text-2xl font-bold mb-6">
      Quick Access
    </h2>

    <div className="grid md:grid-cols-3 gap-5">

      <button
        onClick={() => setActiveMenu("sales")}
        className="bg-green-50 hover:bg-green-100 rounded-xl p-6 transition"
      >
        <DollarSign className="text-green-600 mb-3" />
        <h3 className="font-bold">Sales</h3>
        <p className="text-sm text-slate-500">
          View all sales
        </p>
      </button>

      <button
        onClick={() => setActiveMenu("orders")}
        className="bg-blue-50 hover:bg-blue-100 rounded-xl p-6 transition"
      >
        <ShoppingCart className="text-blue-600 mb-3" />
        <h3 className="font-bold">Orders</h3>
        <p className="text-sm text-slate-500">
          Manage customer orders
        </p>
      </button>

      <button
        onClick={() => setActiveMenu("analytics")}
        className="bg-violet-50 hover:bg-violet-100 rounded-xl p-6 transition"
      >
        <Brain className="text-violet-600 mb-3" />
        <h3 className="font-bold">AI Analytics</h3>
        <p className="text-sm text-slate-500">
          View AI insights
        </p>
      </button>

    </div>

  </div>

</div>

)}

       {/* ================= Sales (no live endpoint yet) ================= */}

{activeMenu === "sales" && (

<div className="bg-white rounded-2xl shadow p-6">

  <div className="flex justify-between items-center mb-8">

    <div>

      <h2 className="text-2xl font-bold">
        Sales Records
      </h2>

      <p className="text-slate-500">
        Review recent transactions from the orders table
      </p>

    </div>

    <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition">
      Refresh
    </button>

  </div>

  {ordersLoading && (
    <p className="text-slate-400 text-center py-8">Loading sales...</p>
  )}

  {!ordersLoading && ordersError && (
    <p className="text-red-500 text-center py-8">{ordersError}</p>
  )}

  {!ordersLoading && !ordersError && orders.length === 0 && (
    <p className="text-slate-400 text-center py-8">No sales records found yet.</p>
  )}

  {!ordersLoading && !ordersError && orders.length > 0 && (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-left p-4">Order</th>
            <th className="text-left p-4">Customer</th>
            <th className="text-left p-4">Product</th>
            <th className="text-left p-4">Amount</th>
            <th className="text-left p-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-slate-50">
              <td className="p-4 font-semibold">{order.order_code}</td>
              <td className="p-4">{order.customer_name}</td>
              <td className="p-4">{order.product}</td>
              <td className="p-4">{formatCurrency(order.total)}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

</div>

)}

        {/* ================= Order Management (LIVE DATA) ================= */}

{activeMenu === "orders" && (

<div className="bg-white rounded-2xl shadow p-6">

  <div className="flex justify-between items-center mb-8">

    <div>

      <h2 className="text-2xl font-bold">
        Order Management
      </h2>

      <p className="text-slate-500">
        Manage all customer orders
      </p>

    </div>

    <button
      onClick={loadOrders}
      className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
    >
      Refresh
    </button>

  </div>

  {ordersLoading && (
    <p className="text-slate-400 text-center py-8">Loading orders...</p>
  )}

  {!ordersLoading && ordersError && (
    <p className="text-red-500 text-center py-8">{ordersError}</p>
  )}

  {!ordersLoading && !ordersError && orders.length === 0 && (
    <p className="text-slate-400 text-center py-8">No orders yet.</p>
  )}

  {!ordersLoading && !ordersError && orders.length > 0 && (

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead className="bg-slate-100">

        <tr>

          <th className="text-left p-4">Order ID</th>

          <th className="text-left p-4">Customer</th>

          <th className="text-left p-4">Product</th>

          <th className="text-left p-4">Quantity</th>

          <th className="text-left p-4">Amount</th>

          <th className="text-left p-4">Status</th>

          <th className="text-left p-4">Action</th>

        </tr>

      </thead>

      <tbody>

        {orders.map((order) => (

        <tr key={order.id} className="border-b hover:bg-slate-50">

          <td className="p-4">{order.order_code}</td>

          <td className="p-4">{order.customer_name}</td>

          <td className="p-4">{order.product}</td>

          <td className="p-4">{order.quantity}</td>

          <td className="p-4">{formatCurrency(order.total)}</td>

          <td className="p-4">
            <select
              value={order.status}
              disabled={statusUpdatingId === order.id}
              onChange={(e) => handleStatusChange(order, e.target.value as Order["status"])}
              className={`px-3 py-1 rounded-full text-sm border-0 cursor-pointer ${statusColors[order.status]}`}
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </td>

          <td className="p-4">
            <button
              onClick={() => {
                setSelectedOrder(order);
                setShowOrderModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              View
            </button>
          </td>

        </tr>

        ))}

      </tbody>

    </table>

  </div>

  )}

</div>

)}
{/* ================= Reports (LIVE DATA) ================= */}

{activeMenu === "reports" && (

<div className="space-y-8">

  {reportsLoading && (
    <p className="text-slate-400 text-center py-8">Loading reports...</p>
  )}

  {!reportsLoading && reportsError && (
    <p className="text-red-500 text-center py-8">{reportsError}</p>
  )}

  {!reportsLoading && (

  <>

  {/* Report Cards */}

  <div className="grid md:grid-cols-4 gap-6">

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500">Monthly Revenue</p>
      <h2 className="text-3xl font-bold mt-2">
        {reportSummary ? formatCurrency(reportSummary.monthRevenue) : "—"}
      </h2>
      <p className="text-slate-400 text-sm mt-2">
        This calendar month
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500">Orders Completed</p>
      <h2 className="text-3xl font-bold mt-2">
        {reportSummary ? reportSummary.completedOrders : "—"}
      </h2>
      <p className="text-slate-400 text-sm mt-2">
        of {reportSummary?.totalOrders ?? 0} total orders
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500">Products Sold</p>
      <h2 className="text-3xl font-bold mt-2">
        {reportSummary ? reportSummary.productsSold : "—"}
      </h2>
      <p className="text-blue-600 text-sm mt-2">
        All time
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500">Top Product</p>
      <h2 className="text-2xl font-bold mt-2">
        {reportSummary?.topProduct || "—"}
      </h2>
      <p className="text-purple-600 text-sm mt-2">
        {reportSummary ? `${reportSummary.topProductUnits} Units Sold` : ""}
      </p>
    </div>

  </div>

  {/* Charts */}

  <div className="grid lg:grid-cols-2 gap-8">

    {/* Sales Growth */}

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-bold mb-6">
        Monthly Sales Growth
      </h2>

      <div className="h-72">

        {monthlySales.length === 0 ? (
          <p className="text-slate-400 text-center pt-24">No sales data yet.</p>
        ) : (
        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={monthlySales}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="sales"
              stroke="#2563eb"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>
        )}

      </div>

    </div>

    {/* Product Sales */}

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-bold mb-6">
        Best Selling Products
      </h2>

      <div className="h-72">

        {productSales.length === 0 ? (
          <p className="text-slate-400 text-center pt-24">No product data yet.</p>
        ) : (
        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={productSales}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="product" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="sold"
              fill="#3b82f6"
            />

          </BarChart>

        </ResponsiveContainer>
        )}

      </div>

    </div>

  </div>

  </>

  )}

</div>

)}

{/* ================= Notifications ================= */}

{activeMenu === "notifications" && (

<div className="bg-white rounded-2xl shadow p-6">

<h2 className="text-2xl font-bold mb-8">
Sales Notifications
</h2>

{messagesLoading && (
  <p className="text-slate-400 text-center py-8">Loading messages...</p>
)}

{!messagesLoading && deptMessages.length === 0 && (
  <p className="text-slate-400 text-center py-8">No messages yet.</p>
)}

<div className="space-y-5">

{!messagesLoading && deptMessages.map((msg) => (

<div
  key={msg.id}
  className="border-l-4 border-blue-500 bg-blue-50 rounded-xl p-5 hover:shadow-lg transition"
>

<div className="flex justify-between">

<div>

<div className="flex items-center gap-2">
  <h3 className="font-bold text-lg">
    {msg.subject}
  </h3>
  <span className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded-full border">
    {msg.from_department}
  </span>
</div>

<p className="text-slate-600 mt-2">
{msg.message}
</p>

</div>

<span className="text-sm text-slate-500 whitespace-nowrap">
{new Date(msg.created_at).toLocaleString()}
</span>

</div>

</div>

))}

</div>

</div>

)}
        {/* ================= Business Communication ================= */}

{activeMenu === "communication" && (

<div className="bg-white rounded-2xl shadow p-6">

<h2 className="text-2xl font-bold mb-8">
Business Communication
</h2>

<div className="space-y-5">

{communicationMessages.map((msg)=>(

<div
key={msg.id}
className={`${msg.bg} border-l-4 ${msg.border} rounded-xl p-5`}
>

<div className="flex justify-between">

<h3 className={`font-bold ${msg.text}`}>
{msg.sender}
</h3>

<span className="text-sm text-slate-500">
{msg.time}
</span>

</div>

<p className="mt-3 text-slate-700">
{msg.message}
</p>

</div>

))}

</div>

</div>

)}

        {/* ================= AI Analytics ================= */}

{activeMenu === "analytics" && (

<div className="space-y-8">

  {/* AI Summary Cards */}

  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">

      <h3 className="text-lg font-semibold">
        Revenue Prediction
      </h3>

      <h2 className="text-3xl font-bold mt-3">
        ₹5.2L
      </h2>

      <p className="mt-2 text-indigo-100">
        Expected next month
      </p>

    </div>

    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">

      <h3 className="text-lg font-semibold">
        Sales Growth
      </h3>

      <h2 className="text-3xl font-bold mt-3">
        +18%
      </h2>

      <p className="mt-2 text-green-100">
        Compared to last month
      </p>

    </div>

    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">

      <h3 className="text-lg font-semibold">
        Top Product
      </h3>

      <h2 className="text-2xl font-bold mt-3">
        Smart Phone
      </h2>

      <p className="mt-2 text-orange-100">
        60 Units Sold
      </p>

    </div>

    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">

      <h3 className="text-lg font-semibold">
        Customer Satisfaction
      </h3>

      <h2 className="text-3xl font-bold mt-3">
        96%
      </h2>

      <p className="mt-2 text-cyan-100">
        Based on reviews
      </p>

    </div>

  </div>

  {/* AI Recommendations */}

  <div className="bg-white rounded-2xl shadow p-6">

    <h2 className="text-2xl font-bold mb-6">
      AI Recommendations
    </h2>

    <div className="space-y-4">

      <div className="bg-indigo-50 border-l-4 border-indigo-600 rounded-xl p-5">
        <h3 className="font-bold text-indigo-700">
          Increase Inventory
        </h3>
        <p className="text-slate-600 mt-2">
          Laptop demand has increased by 18%. Restock within the next 5 days to avoid shortages.
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-600 rounded-xl p-5">
        <h3 className="font-bold text-green-700">
          Best Time to Launch Offers
        </h3>
        <p className="text-slate-600 mt-2">
          Weekend promotions are predicted to increase revenue by approximately 15%.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-5">
        <h3 className="font-bold text-yellow-700">
          Customer Insight
        </h3>
        <p className="text-slate-600 mt-2">
          Customers purchasing laptops frequently buy wireless mice and keyboards together.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-5">
        <h3 className="font-bold text-red-700">
          Low Performing Product
        </h3>
        <p className="text-slate-600 mt-2">
          Desktop speakers recorded the lowest sales this month. Consider promotional discounts.
        </p>
      </div>

    </div>

  </div>

  {/* AI Confidence */}

  <div className="bg-white rounded-2xl shadow p-6">

    <h2 className="text-2xl font-bold mb-6">
      AI Confidence Levels
    </h2>

    <div className="space-y-6">

      <div>

        <div className="flex justify-between mb-2">

          <span>Revenue Forecast</span>

          <span>94%</span>

        </div>

        <div className="w-full bg-slate-200 rounded-full h-3">

          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: "94%" }}
          />

        </div>

      </div>

      <div>

        <div className="flex justify-between mb-2">

          <span>Customer Trend Prediction</span>

          <span>89%</span>

        </div>

        <div className="w-full bg-slate-200 rounded-full h-3">

          <div
            className="bg-green-600 h-3 rounded-full"
            style={{ width: "89%" }}
          />

        </div>

      </div>

      <div>

        <div className="flex justify-between mb-2">

          <span>Demand Forecast</span>

          <span>91%</span>

        </div>

        <div className="w-full bg-slate-200 rounded-full h-3">

          <div
            className="bg-purple-600 h-3 rounded-full"
            style={{ width: "91%" }}
          />

        </div>

      </div>

    </div>

  </div>

</div>

)}

{/* ================= Order Details Modal (LIVE DATA) ================= */}

{showOrderModal && selectedOrder && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

    {/* Header */}

    <div className="flex justify-between items-center border-b p-6">

      <div>

        <h2 className="text-3xl font-bold">
          📦 Order Details
        </h2>

        <p className="text-slate-500 mt-1">
          Order ID : {selectedOrder.order_code}
        </p>

      </div>

      <button
        onClick={() => setShowOrderModal(false)}
        className="text-3xl font-bold text-slate-500 hover:text-red-600 transition"
      >
        ×
      </button>

    </div>

    <div className="p-8">

      {/* Status */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <p className="text-slate-500">
            Order Date
          </p>

          <h3 className="font-semibold">
            {formatDate(selectedOrder.order_date)}
          </h3>

        </div>

        <div>

          <span className={`px-5 py-2 rounded-full font-semibold ${statusColors[selectedOrder.status]}`}>
            {selectedOrder.status}
          </span>

        </div>

      </div>
            {/* ================= Customer & Product ================= */}

<div className="grid md:grid-cols-2 gap-6 mb-8">

  {/* Customer Information */}

  <div className="bg-slate-50 rounded-2xl p-6 border">

    <h3 className="text-xl font-bold mb-5 text-blue-700">
      👤 Customer Information
    </h3>

    <div className="space-y-4">

      <div>
        <p className="text-sm text-slate-500">Customer Name</p>
        <p className="font-semibold">{selectedOrder.customer_name}</p>
      </div>

      <div>
        <p className="text-sm text-slate-500">Email</p>
        <p className="font-semibold">{selectedOrder.email || "-"}</p>
      </div>

      <div>
        <p className="text-sm text-slate-500">Phone</p>
        <p className="font-semibold">{selectedOrder.phone || "-"}</p>
      </div>

      <div>
        <p className="text-sm text-slate-500">Delivery Date</p>
        <p className="font-semibold">{formatDate(selectedOrder.delivery_date)}</p>
      </div>

    </div>

  </div>

  {/* Product Details */}

  <div className="bg-slate-50 rounded-2xl p-6 border">

    <h3 className="text-xl font-bold mb-5 text-green-700">
      📦 Product Details
    </h3>

    <div className="space-y-4">

      <div className="flex justify-between">
        <span className="text-slate-500">Product</span>
        <span className="font-semibold">{selectedOrder.product}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Quantity</span>
        <span className="font-semibold">{selectedOrder.quantity}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Price</span>
        <span className="font-semibold">{formatCurrency(selectedOrder.price)}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">GST</span>
        <span className="font-semibold">{formatCurrency(selectedOrder.gst)}</span>
      </div>

      <hr />

      <div className="flex justify-between text-lg">

        <span className="font-bold">
          Total
        </span>

        <span className="font-bold text-green-600">
          {formatCurrency(selectedOrder.total)}
        </span>

      </div>

    </div>

  </div>

</div>

      {/* ================= Shipping & Payment ================= */}

<div className="grid md:grid-cols-2 gap-6 mb-8">

  {/* Shipping */}

  <div className="bg-slate-50 rounded-2xl p-6 border">

    <h3 className="text-xl font-bold mb-5 text-orange-600">
      🚚 Shipping Address
    </h3>

    <div className="space-y-4">

      <div>
        <p className="text-sm text-slate-500">
          Delivery Address
        </p>

        <p className="font-semibold leading-7">
          {selectedOrder.address || "-"}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          Expected Delivery
        </p>

        <p className="font-semibold">
          {formatDate(selectedOrder.delivery_date)}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          Order Status
        </p>

        <select
          value={selectedOrder.status}
          disabled={statusUpdatingId === selectedOrder.id}
          onChange={(e) => handleStatusChange(selectedOrder, e.target.value as Order["status"])}
          className={`inline-block px-4 py-1 rounded-full font-medium mt-1 border-0 cursor-pointer ${statusColors[selectedOrder.status]}`}
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

      </div>

    </div>

  </div>

  {/* Payment */}

  <div className="bg-slate-50 rounded-2xl p-6 border">

    <h3 className="text-xl font-bold mb-5 text-purple-700">
      💳 Payment Details
    </h3>

    <div className="space-y-4">

      <div className="flex justify-between">

        <span className="text-slate-500">
          Payment Method
        </span>

        <span className="font-semibold">
          {selectedOrder.payment_method || "-"}
        </span>

      </div>

      <div className="flex justify-between">

        <span className="text-slate-500">
          Payment Status
        </span>

        <span className={`font-semibold ${paymentStatusColor(selectedOrder.payment_status)}`}>
          {selectedOrder.payment_status}
        </span>

      </div>

      <div className="flex justify-between">

        <span className="text-slate-500">
          Transaction ID
        </span>

        <span className="font-semibold">
          {selectedOrder.transaction_id || "N/A"}
        </span>

      </div>

      <hr />

      <div className="flex justify-between text-lg">

        <span className="font-bold">
          Total Paid
        </span>

        <span className="font-bold text-blue-600">
          {formatCurrency(selectedOrder.total)}
        </span>

      </div>

    </div>

  </div>

</div>

      {/* ================= AI Insights ================= */}

<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 mb-8">

  <h3 className="text-2xl font-bold text-blue-700 mb-6">
    🤖 AI Insights
  </h3>

  <div className="grid md:grid-cols-2 gap-6">

    <div className="bg-white rounded-xl p-5 shadow-sm">

      <p className="text-slate-500 text-sm">
        Customer Type
      </p>

      <h4 className="text-xl font-bold mt-2">
        Repeat Customer
      </h4>

      <p className="text-green-600 mt-2">
        Purchased 6 times previously
      </p>

    </div>

    <div className="bg-white rounded-xl p-5 shadow-sm">

      <p className="text-slate-500 text-sm">
        Repeat Purchase Probability
      </p>

      <h4 className="text-xl font-bold mt-2">
        91%
      </h4>

      <div className="w-full bg-slate-200 rounded-full h-3 mt-3">

        <div
          className="bg-green-600 h-3 rounded-full"
          style={{ width: "91%" }}
        />

      </div>

    </div>

    <div className="bg-white rounded-xl p-5 shadow-sm">

      <p className="text-slate-500 text-sm mb-3">
        Recommended Products
      </p>

      <ul className="space-y-2">

        <li>🖱 Wireless Mouse</li>

        <li>⌨ Mechanical Keyboard</li>

        <li>💼 Laptop Bag</li>

      </ul>

    </div>

    <div className="bg-white rounded-xl p-5 shadow-sm">

      <p className="text-slate-500 text-sm">
        Customer Satisfaction
      </p>

      <h4 className="text-3xl font-bold mt-2 text-yellow-500">
        ★★★★★
      </h4>

      <p className="mt-2 text-green-600">
        Excellent Buying Experience
      </p>

    </div>

  </div>

</div>

{/* ================= Buttons ================= */}

<div className="flex justify-end gap-4 border-t pt-6">

  <button
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
  >
    Download Invoice
  </button>

  <button
    onClick={() => setShowOrderModal(false)}
    className="bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-xl font-semibold transition"
  >
    Close
  </button>

</div>

    </div>

  </div>

</div>

)}
{activeMenu === "messages" && (
  <MessageForm sender="Sales" businessId={company || ""} />
)}
      </main>

    </div>

  );

}