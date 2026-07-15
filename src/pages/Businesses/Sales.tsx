import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  LayoutDashboard, DollarSign, ShoppingCart, BarChart3, Bell, MessageSquare, Brain,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar,
} from "recharts";

export default function Sales() {

  const [replyNotificationId, setReplyNotificationId] = useState<number | null>(null);
const [replyText, setReplyText] = useState("");
  const { company } = useParams();

const companyNames: Record<string, string> = {
  "techzone-store": "TechZone Store",
  "urban-fashion-hub": "Urban Fashion Hub",
  "luxe-living-furniture": "Luxe Living Furniture",
  "prosports-gear": "ProSports Gear",
  "glow-beauty-studio": "Glow Beauty Studio",
};
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const monthlySales = [
  { month: "Jan", sales: 42000 },
  { month: "Feb", sales: 51000 },
  { month: "Mar", sales: 47000 },
  { month: "Apr", sales: 62000 },
  { month: "May", sales: 70000 },
  { month: "Jun", sales: 83000 },
];

const productSales = [
  { product: "Laptop", sold: 45 },
  { product: "Phone", sold: 60 },
  { product: "Monitor", sold: 25 },
  { product: "Keyboard", sold: 40 },
  { product: "Headset", sold: 30 },
];
const orderDetails = {
  ORD1001: {
    id: "ORD1001",
    customer: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 9876543210",
    product: "Laptop",
    quantity: 1,
    price: "₹75,000",
    gst: "₹13,500",
    total: "₹88,500",
    payment: "UPI",
    paymentStatus: "Paid",
    transactionId: "TXN5489236",
    status: "Delivered",
    orderDate: "10 Jul 2026",
    deliveryDate: "13 Jul 2026",
    address: "12 MG Road, Bangalore, Karnataka"
  },

  ORD1002: {
    id: "ORD1002",
    customer: "Priya Nair",
    email: "priya@gmail.com",
    phone: "+91 9123456780",
    product: "Wireless Mouse",
    quantity: 2,
    price: "₹2,000",
    gst: "₹360",
    total: "₹2,360",
    payment: "Credit Card",
    paymentStatus: "Paid",
    transactionId: "TXN8745123",
    status: "Processing",
    orderDate: "11 Jul 2026",
    deliveryDate: "15 Jul 2026",
    address: "HSR Layout, Bangalore, Karnataka"
  },

  ORD1003: {
    id: "ORD1003",
    customer: "Arjun Kumar",
    email: "arjun@gmail.com",
    phone: "+91 9988776655",
    product: "Keyboard",
    quantity: 1,
    price: "₹3,500",
    gst: "₹630",
    total: "₹4,130",
    payment: "Cash on Delivery",
    paymentStatus: "Pending",
    transactionId: "N/A",
    status: "Shipped",
    orderDate: "12 Jul 2026",
    deliveryDate: "-",
    address: "Whitefield, Bangalore, Karnataka"
  },
  ORD1004: {
  id: "ORD1004",
  customer: "Anjali Rao",
  email: "anjali@gmail.com",
  phone: "+91 9876543211",
  product: "Monitor",
  quantity: 1,
  price: "₹18,000",
  gst: "₹3,240",
  total: "₹21,240",
  payment: "Credit Card",
  paymentStatus: "Refunded",
  transactionId: "TXN4567890",
  status: "Cancelled",
  orderDate: "12 Jul 2026",
  deliveryDate: "-",
  address: "Jayanagar, Bangalore, Karnataka"
},

ORD1005: {
  id: "ORD1005",
  customer: "Sneha Patel",
  email: "sneha@gmail.com",
  phone: "+91 9123456789",
  product: "Keyboard",
  quantity: 2,
  price: "₹8,000",
  gst: "₹1,440",
  total: "₹9,440",
  payment: "UPI",
  paymentStatus: "Pending",
  transactionId: "N/A",
  status: "Pending",
  orderDate: "12 Jul 2026",
  deliveryDate: "-",
  address: "Electronic City, Bangalore, Karnataka"
}
};

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

const salesNotifications = [
  {
    id: 1,
    title: "New Order Received",
    message: "Rahul Sharma placed an order worth ₹75,000.",
    time: "Today",
    color: "green",
  },
  {
    id: 2,
    title: "Payment Successful",
    message: "Payment of ₹35,000 received from Priya Nair.",
    time: "1 hour ago",
    color: "blue",
  },
  {
    id: 3,
    title: "Low Stock Alert",
    message: "Wireless Keyboard stock is below 10 units.",
    time: "Yesterday",
    color: "yellow",
  },
  {
    id: 4,
    title: "Sales Target Achieved",
    message: "Congratulations! Monthly sales target has been achieved.",
    time: "2 days ago",
    color: "purple",
  },
  {
    id: 5,
    title: "Order Cancelled",
    message: "Order #ORD1004 has been cancelled by the customer.",
    time: "3 days ago",
    color: "red",
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
            ₹4,25,000
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
            156
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
            Reports
          </p>

          <h2 className="text-3xl font-bold mt-2">
            12
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
            5
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

       {/* ================= Sales ================= */}

{activeMenu === "sales" && (

<div className="bg-white rounded-2xl shadow p-6">

  <div className="flex justify-between items-center mb-8">

    <div>

      <h2 className="text-2xl font-bold">
        Sales Records
      </h2>

      <p className="text-slate-500">
        Manage all sales transactions
      </p>

    </div>

    <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition">

      Export Report

    </button>

  </div>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead className="bg-slate-100">

        <tr>

          <th className="text-left p-4">Invoice</th>

          <th className="text-left p-4">Customer</th>

          <th className="text-left p-4">Product</th>

          <th className="text-left p-4">Amount</th>

          <th className="text-left p-4">Payment</th>

          <th className="text-left p-4">Date</th>

          <th className="text-left p-4">Action</th>

        </tr>

      </thead>

      <tbody>

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">INV001</td>

          <td className="p-4">Rahul Sharma</td>

          <td className="p-4">Laptop</td>

          <td className="p-4">₹75,000</td>

          <td className="p-4">

            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

              Paid

            </span>

          </td>

          <td className="p-4">10 Jul 2026</td>

          <td className="p-4">

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">

              View

            </button>

          </td>

        </tr>

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">INV002</td>

          <td className="p-4">Priya Nair</td>

          <td className="p-4">Smart Phone</td>

          <td className="p-4">₹35,000</td>

          <td className="p-4">

            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">

              Pending

            </span>

          </td>

          <td className="p-4">11 Jul 2026</td>

          <td className="p-4">

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">

              View

            </button>

          </td>

        </tr>

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">INV003</td>

          <td className="p-4">John Mathew</td>

          <td className="p-4">Headphones</td>

          <td className="p-4">₹6,500</td>

          <td className="p-4">

            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

              Paid

            </span>

          </td>

          <td className="p-4">12 Jul 2026</td>

          <td className="p-4">

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">

              View

            </button>

          </td>

        </tr>

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">INV004</td>

          <td className="p-4">Anjali Rao</td>

          <td className="p-4">Monitor</td>

          <td className="p-4">₹18,000</td>

          <td className="p-4">

            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">

              Failed

            </span>

          </td>

          <td className="p-4">13 Jul 2026</td>

          <td className="p-4">

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">

              View

            </button>

          </td>

        </tr>

      </tbody>

    </table>

  </div>

</div>

)}

        {/* ================= Order Management ================= */}

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

    <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition">

      Export Orders

    </button>

  </div>

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

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">ORD1001</td>

          <td className="p-4">Rahul Sharma</td>

          <td className="p-4">Laptop</td>

          <td className="p-4">1</td>

          <td className="p-4">₹75,000</td>

          <td className="p-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Delivered
            </span>
          </td>

          <td className="p-4">
            <button
  onClick={() => {
    setSelectedOrder(orderDetails.ORD1001);
    setShowOrderModal(true);
  }}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
>
  View
</button>
          </td>

        </tr>

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">ORD1002</td>

          <td className="p-4">Priya Nair</td>

          <td className="p-4">Smart Phone</td>

          <td className="p-4">2</td>

          <td className="p-4">₹70,000</td>

          <td className="p-4">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
              Processing
            </span>
          </td>

          <td className="p-4">
            <button
  onClick={() => {
    setSelectedOrder(orderDetails.ORD1002);
    setShowOrderModal(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
 View
</button>
          </td>

        </tr>

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">ORD1003</td>

          <td className="p-4">John Mathew</td>

          <td className="p-4">Headphones</td>

          <td className="p-4">3</td>

          <td className="p-4">₹19,500</td>

          <td className="p-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              Shipped
            </span>
          </td>

          <td className="p-4">
            <button
  onClick={() => {
    setSelectedOrder(orderDetails.ORD1003);
    setShowOrderModal(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
 View
</button>
          </td>

        </tr>

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">ORD1004</td>

          <td className="p-4">Anjali Rao</td>

          <td className="p-4">Monitor</td>

          <td className="p-4">1</td>

          <td className="p-4">₹18,000</td>

          <td className="p-4">
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
              Cancelled
            </span>
          </td>

          <td className="p-4">
            <button
  onClick={() => {
    setSelectedOrder(orderDetails["ORD1004"]);
    setShowOrderModal(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  View
</button>
          </td>

        </tr>

        <tr className="border-b hover:bg-slate-50">

          <td className="p-4">ORD1005</td>

          <td className="p-4">Sneha Patel</td>

          <td className="p-4">Keyboard</td>

          <td className="p-4">2</td>

          <td className="p-4">₹8,000</td>

          <td className="p-4">
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
              Pending
            </span>
          </td>

          <td className="p-4">
            <button
  onClick={() => {
    setSelectedOrder(orderDetails["ORD1005"]);
    setShowOrderModal(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  View
</button>
          </td>

        </tr>

      </tbody>

    </table>

  </div>

</div>

)}
{/* ================= Reports ================= */}

{activeMenu === "reports" && (

<div className="space-y-8">

  {/* Report Cards */}

  <div className="grid md:grid-cols-4 gap-6">

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500">Monthly Revenue</p>
      <h2 className="text-3xl font-bold mt-2">₹4.25L</h2>
      <p className="text-green-600 text-sm mt-2">
        ▲ 18% from last month
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500">Orders Completed</p>
      <h2 className="text-3xl font-bold mt-2">156</h2>
      <p className="text-green-600 text-sm mt-2">
        ▲ 12%
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500">Products Sold</p>
      <h2 className="text-3xl font-bold mt-2">200</h2>
      <p className="text-blue-600 text-sm mt-2">
        This Month
      </p>
    </div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500">Top Product</p>
      <h2 className="text-2xl font-bold mt-2">
        Smart Phone
      </h2>
      <p className="text-purple-600 text-sm mt-2">
        60 Units Sold
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

      </div>

    </div>

    {/* Product Sales */}

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-bold mb-6">
        Best Selling Products
      </h2>

      <div className="h-72">

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

      </div>

    </div>

  </div>

</div>

)}

        {/* ================= Notifications ================= */}

{activeMenu === "notifications" && (

<div className="bg-white rounded-2xl shadow p-6">

<h2 className="text-2xl font-bold mb-8">
Sales Notifications
</h2>

<div className="space-y-5">

{salesNotifications.map((notification) => (

<div
key={notification.id}
className={`border-l-4 rounded-xl p-5 hover:shadow-lg transition
${
notification.color==="green"
?"border-green-500 bg-green-50":
notification.color==="blue"
?"border-blue-500 bg-blue-50":
notification.color==="yellow"
?"border-yellow-500 bg-yellow-50":
notification.color==="purple"
?"border-purple-500 bg-purple-50":
"border-red-500 bg-red-50"
}
`}
>

<div className="flex justify-between">

<div>

<h3 className="font-bold text-lg">
{notification.title}
</h3>

<p className="text-slate-600 mt-2">
{notification.message}
</p>

</div>

<span className="text-sm text-slate-500">
{notification.time}
</span>

</div>

<button
onClick={()=>setReplyNotificationId(notification.id)}
className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
>
Reply
</button>

{replyNotificationId===notification.id && (

<div className="mt-4">

<textarea
rows={3}
value={replyText}
onChange={(e)=>setReplyText(e.target.value)}
placeholder="Type your reply..."
className="w-full border border-gray-300 rounded-lg p-3"
/>

<button
onClick={()=>{
alert("Reply submitted successfully");
setReplyText("");
setReplyNotificationId(null);
}}
className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
>
Submit
</button>

</div>

)}

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

<button
onClick={()=>setReplyNotificationId(msg.id)}
className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
>
Reply
</button>

{replyNotificationId===msg.id && (

<div className="mt-4">

<textarea
rows={3}
value={replyText}
onChange={(e)=>setReplyText(e.target.value)}
placeholder="Type your reply..."
className="w-full border border-gray-300 rounded-lg p-3"
/>

<button
onClick={()=>{
alert("Reply submitted successfully");
setReplyText("");
setReplyNotificationId(null);
}}
className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
>
Submit
</button>

</div>

)}

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

{/* ================= Order Details Modal ================= */}

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
          Order ID : {selectedOrder.id}
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
            {selectedOrder.orderDate}
          </h3>

        </div>

        <div>

          <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold">
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
        <p className="font-semibold">{selectedOrder.customer}</p>
      </div>

      <div>
        <p className="text-sm text-slate-500">Email</p>
        <p className="font-semibold">{selectedOrder.email}</p>
      </div>

      <div>
        <p className="text-sm text-slate-500">Phone</p>
        <p className="font-semibold">{selectedOrder.phone}</p>
      </div>

      <div>
        <p className="text-sm text-slate-500">Delivery Date</p>
        <p className="font-semibold">{selectedOrder.deliveryDate}</p>
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
        <span className="font-semibold">{selectedOrder.price}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">GST</span>
        <span className="font-semibold">{selectedOrder.gst}</span>
      </div>

      <hr />

      <div className="flex justify-between text-lg">

        <span className="font-bold">
          Total
        </span>

        <span className="font-bold text-green-600">
          {selectedOrder.total}
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
          {selectedOrder.address}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          Expected Delivery
        </p>

        <p className="font-semibold">
          {selectedOrder.deliveryDate}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          Order Status
        </p>

        <span className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full font-medium mt-1">
          {selectedOrder.status}
        </span>
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
          {selectedOrder.payment}
        </span>

      </div>

      <div className="flex justify-between">

        <span className="text-slate-500">
          Payment Status
        </span>

        <span className={`font-semibold ${
          selectedOrder.paymentStatus === "Paid"
            ? "text-green-600"
            : "text-red-600"
        }`}>
          {selectedOrder.paymentStatus}
        </span>

      </div>

      <div className="flex justify-between">

        <span className="text-slate-500">
          Transaction ID
        </span>

        <span className="font-semibold">
          {selectedOrder.transactionId}
        </span>

      </div>

      <hr />

      <div className="flex justify-between text-lg">

        <span className="font-bold">
          Total Paid
        </span>

        <span className="font-bold text-blue-600">
          {selectedOrder.total}
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
      </main>

    </div>

  );

}