import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Grid2X2,
  Boxes,
  ShoppingCart,
  Truck,
  Warehouse,
  BarChart3,
  Brain,
  Building2,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

interface CompanyInventory {
  totalProducts: number;
  totalCategories: number;
  lowStock: number;
  inventoryValue: string;
  categories: string[];
}

const inventoryData: Record<string, CompanyInventory> = {
  "TechZone Store": {
    totalProducts: 245,
    totalCategories: 8,
    lowStock: 12,
    inventoryValue: "₹24,50,000",
    categories: [
      "Mobile Phones",
      "Laptops",
      "Tablets",
      "Smart Watches",
      "Audio Devices",
      "Gaming",
      "Accessories",
      "Computer Parts",
    ],
  },

  "Urban Fashion Hub": {
    totalProducts: 430,
    totalCategories: 8,
    lowStock: 18,
    inventoryValue: "₹18,75,000",
    categories: [
      "Men's Wear",
      "Women's Wear",
      "Kids Wear",
      "Footwear",
      "Bags",
      "Accessories",
      "Watches",
      "Ethnic Wear",
    ],
  },

  "Luxe Living Furniture": {
    totalProducts: 180,
    totalCategories: 8,
    lowStock: 9,
    inventoryValue: "₹52,00,000",
    categories: [
      "Living Room",
      "Bedroom",
      "Dining",
      "Office Furniture",
      "Storage",
      "Outdoor",
      "Lighting",
      "Decor",
    ],
  },

  "ProSports Gear": {
    totalProducts: 310,
    totalCategories: 8,
    lowStock: 15,
    inventoryValue: "₹21,40,000",
    categories: [
      "Cricket",
      "Football",
      "Basketball",
      "Badminton",
      "Gym Equipment",
      "Cycling",
      "Running",
      "Accessories",
    ],
  },

  "Glow Beauty Studio": {
    totalProducts: 270,
    totalCategories: 8,
    lowStock: 11,
    inventoryValue: "₹16,90,000",
    categories: [
      "Skincare",
      "Hair Care",
      "Makeup",
      "Fragrances",
      "Beauty Tools",
      "Salon Equipment",
      "Personal Care",
      "Spa Products",
    ],
  },
};
interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  price: string;
  status: "In Stock" | "Low Stock";
}

const companyProducts: Record<string, Product[]> = {
  "TechZone Store": [
    {
      id: "P001",
      name: "iPhone 16 Pro",
      category: "Mobile Phones",
      sku: "TECH-101",
      stock: 35,
      price: "₹1,29,900",
      status: "In Stock",
    },
    {
      id: "P002",
      name: "Samsung Galaxy S25",
      category: "Mobile Phones",
      sku: "TECH-102",
      stock: 8,
      price: "₹92,000",
      status: "Low Stock",
    },
    {
      id: "P003",
      name: "MacBook Pro",
      category: "Laptops",
      sku: "TECH-103",
      stock: 15,
      price: "₹2,09,900",
      status: "In Stock",
    },
    {
      id: "P004",
      name: "Apple Watch",
      category: "Smart Watches",
      sku: "TECH-104",
      stock: 22,
      price: "₹44,900",
      status: "In Stock",
    },
  ],

  "Urban Fashion Hub": [
    {
      id: "F001",
      name: "Men's Hoodie",
      category: "Men's Wear",
      sku: "FAS-101",
      stock: 65,
      price: "₹1,899",
      status: "In Stock",
    },
    {
      id: "F002",
      name: "Women's Kurti",
      category: "Women's Wear",
      sku: "FAS-102",
      stock: 12,
      price: "₹1,299",
      status: "Low Stock",
    },
    {
      id: "F003",
      name: "Running Shoes",
      category: "Footwear",
      sku: "FAS-103",
      stock: 31,
      price: "₹2,999",
      status: "In Stock",
    },
  ],

  "Luxe Living Furniture": [
    {
      id: "L001",
      name: "Luxury Sofa",
      category: "Living Room",
      sku: "FUR-101",
      stock: 7,
      price: "₹42,000",
      status: "Low Stock",
    },
    {
      id: "L002",
      name: "Dining Table",
      category: "Dining",
      sku: "FUR-102",
      stock: 18,
      price: "₹35,000",
      status: "In Stock",
    },
  ],

  "ProSports Gear": [
    {
      id: "S001",
      name: "Cricket Bat",
      category: "Cricket",
      sku: "SPT-101",
      stock: 42,
      price: "₹5,500",
      status: "In Stock",
    },
    {
      id: "S002",
      name: "Football",
      category: "Football",
      sku: "SPT-102",
      stock: 9,
      price: "₹2,000",
      status: "Low Stock",
    },
  ],

  "Glow Beauty Studio": [
    {
      id: "B001",
      name: "Vitamin C Face Serum",
      category: "Skincare",
      sku: "BEA-101",
      stock: 28,
      price: "₹1,499",
      status: "In Stock",
    },
    {
      id: "B002",
      name: "Matte Lipstick",
      category: "Makeup",
      sku: "BEA-102",
      stock: 11,
      price: "₹899",
      status: "Low Stock",
    },
  ],
};

export default function Inventory() {
    const [showProductDeleted, setShowProductDeleted] = useState(false);
    const [editedProduct, setEditedProduct] = useState<Product | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

const [showViewModal, setShowViewModal] = useState(false);

const [showEditModal, setShowEditModal] = useState(false);

const [showDeleteModal, setShowDeleteModal] = useState(false);

const [showAddProductModal, setShowAddProductModal] = useState(false);
const [showProductAdded, setShowProductAdded] = useState(false);
const [newProduct, setNewProduct] = useState<Product>({
  id: Date.now(),
  name: "",
  category: "",
  sku: "",
  price: "",
  stock: 0,
  status: "In Stock",
});
  const location = useLocation();

  const company =
    location.state?.company || {
      name: "TechZone Store",
    };

  const inventory = useMemo(() => {
    return (
      inventoryData[company.name] ??
      inventoryData["TechZone Store"]
    );
  }, [company.name]);

  const [activeMenu, setActiveMenu] =
    useState("Dashboard");
    const [products, setProducts] = useState<Product[]>(
  companyProducts[company.name] ??
  companyProducts["TechZone Store"]
);

const [categories, setCategories] = useState<string[]>(
  inventory.categories
);
  const sidebarItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      icon: Package,
    },
    {
      name: "Categories",
      icon: Grid2X2,
    },
    {
      name: "Stock Management",
      icon: Boxes,
    },
    {
      name: "Purchase Orders",
      icon: ShoppingCart,
    },
    {
      name: "Suppliers",
      icon: Truck,
    },
    {
      name: "Warehouses",
      icon: Warehouse,
    },
    {
      name: "Reports",
      icon: BarChart3,
    },
    {
      name: "AI Inventory Assistant",
      icon: Brain,
    },
  ];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

const [showViewCategoryModal, setShowViewCategoryModal] = useState(false);

const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

const [newCategory, setNewCategory] = useState({
  name: "",
  description: "",
  status: "Active",
});

const [editedCategory, setEditedCategory] = useState("");

const [showCategoryAdded, setShowCategoryAdded] = useState(false);
const [showCategoryUpdated, setShowCategoryUpdated] = useState(false);

const [selectedOrder, setSelectedOrder] = useState<any>(null);

const [editedOrder, setEditedOrder] = useState<any>(null);

const [showViewOrderModal, setShowViewOrderModal] = useState(false);

const [showEditOrderModal, setShowEditOrderModal] = useState(false);

const [showOrderUpdated, setShowOrderUpdated] = useState(false);

const [purchaseOrders, setPurchaseOrders] = useState([
  {
    id: "PO-1001",
    supplier: "ABC Suppliers",
    product: inventory.categories[0],
    amount: "₹1,20,000",
    date: "15 Jul 2026",
    status: "Pending",
  },
  {
    id: "PO-1002",
    supplier: "Prime Traders",
    product: inventory.categories[1],
    amount: "₹78,000",
    date: "18 Jul 2026",
    status: "Approved",
  },
  {
    id: "PO-1003",
    supplier: "Global Distributors",
    product: inventory.categories[2],
    amount: "₹2,10,000",
    date: "20 Jul 2026",
    status: "Received",
  },
]);
const [showCreatePOModal, setShowCreatePOModal] = useState(false);

const [showPOCreated, setShowPOCreated] = useState(false);

const [newPO, setNewPO] = useState({
  id: "",
  supplier: "",
  product: "",
  amount: "",
  date: "",
  status: "Pending",
});
const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

const [editedSupplier, setEditedSupplier] = useState<any>(null);

const [showViewSupplierModal, setShowViewSupplierModal] = useState(false);

const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);

const [showSupplierUpdated, setShowSupplierUpdated] = useState(false);
const [suppliers, setSuppliers] = useState([
  {
    id: 1,
    name: "ABC Suppliers",
    contact: "Rajesh Kumar",
    phone: "+91 9876543210",
    email: "rajesh@abcsuppliers.com",
    address: "Bangalore",
    products: inventory.categories[0],
    rating: "★★★★★",
    status: "Active",
  },
  {
    id: 2,
    name: "Prime Traders",
    contact: "Amit Shah",
    phone: "+91 9876501234",
    email: "amit@primetraders.com",
    address: "Mumbai",
    products: inventory.categories[1],
    rating: "★★★★☆",
    status: "Active",
  },
  {
    id: 3,
    name: "Global Distributors",
    contact: "Priya Nair",
    phone: "+91 9876512345",
    email: "priya@globaldist.com",
    address: "Chennai",
    products: inventory.categories[2],
    rating: "★★★★☆",
    status: "Pending",
  },
]);
const [warehouses, setWarehouses] = useState([
  {
    id: 1,
    name: "Bangalore Central Warehouse",
    location: "Bangalore",
    manager: "Rahul Sharma",
    capacity: "15,000 Units",
    stock: "12,450 Units",
    occupancy: "83%",
    status: "Active",
  },
  {
    id: 2,
    name: "Mumbai Warehouse",
    location: "Mumbai",
    manager: "Amit Verma",
    capacity: "12,000 Units",
    stock: "9,100 Units",
    occupancy: "76%",
    status: "Active",
  },
  {
    id: 3,
    name: "Chennai Warehouse",
    location: "Chennai",
    manager: "Priya Nair",
    capacity: "10,000 Units",
    stock: "8,450 Units",
    occupancy: "85%",
    status: "Maintenance",
  },
]);

const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

const [editedWarehouse, setEditedWarehouse] = useState<any>(null);

const [showViewWarehouseModal, setShowViewWarehouseModal] = useState(false);

const [showEditWarehouseModal, setShowEditWarehouseModal] = useState(false);

const [showWarehouseUpdated, setShowWarehouseUpdated] = useState(false);
  return (
    <div className="min-h-screen bg-gray-100 flex">
              {/* ================= Sidebar ================= */}

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="w-72 bg-white border-r border-gray-200 flex flex-col"
      >
        <div className="p-6 border-b">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="text-white" size={24} />
            </div>

            <div>
              <h2 className="font-bold text-lg text-gray-900">
                {company.name}
              </h2>

              <p className="text-sm text-gray-500">
                Inventory Workspace
              </p>
            </div>

          </div>

        </div>

        <div className="flex-1 px-4 py-5">

          <div className="space-y-2">

            {sidebarItems.map((item) => {

              const Icon = item.icon;

              return (

                <button
                  key={item.name}
                  onClick={() => setActiveMenu(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition

                  ${
                    activeMenu === item.name
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >

                  <Icon size={20} />

                  <span className="font-medium">
                    {item.name}
                  </span>

                </button>

              );

            })}

          </div>

        </div>

      </motion.aside>

      {/* ================= Main ================= */}

      <main className="flex-1 overflow-y-auto">

        {/* Header */}

        <div className="bg-white border-b px-8 py-6">

          <div className="flex justify-between items-center">

            <div>

              <h1 className="text-3xl font-bold text-gray-900">
                Inventory Dashboard
              </h1>

              <p className="text-gray-500 mt-1">
                Manage inventory, stock and warehouse operations.
              </p>

            </div>

            <div className="text-right">

              <p className="font-semibold text-gray-900">
                {company.name}
              </p>

              <p className="text-sm text-gray-500">
                Inventory Management
              </p>

            </div>

          </div>

        </div>

        <div className="p-8">

          {/* Dashboard Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border shadow-sm p-6"
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-gray-500 text-sm">
                    Total Products
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {inventory.totalProducts}
                  </h2>

                </div>

                <Package className="text-blue-600" size={30} />

              </div>

            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border shadow-sm p-6"
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-gray-500 text-sm">
                    Categories
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {inventory.totalCategories}
                  </h2>

                </div>

                <Grid2X2 className="text-green-600" size={30} />

              </div>

            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border shadow-sm p-6"
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-gray-500 text-sm">
                    Low Stock
                  </p>

                  <h2 className="text-3xl font-bold mt-2 text-orange-600">
                    {inventory.lowStock}
                  </h2>

                </div>

                <AlertTriangle
                  className="text-orange-500"
                  size={30}
                />

              </div>

            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border shadow-sm p-6"
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-gray-500 text-sm">
                    Inventory Value
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    {inventory.inventoryValue}
                  </h2>

                </div>

                <IndianRupee
                  className="text-emerald-600"
                  size={30}
                />

              </div>

            </motion.div>

          </div>
                    {/* ================= Dashboard ================= */}

          {activeMenu === "Dashboard" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {/* Inventory Overview */}

              <div className="grid lg:grid-cols-2 gap-6">

                {/* Inventory Value */}

                <div className="bg-white rounded-2xl border shadow-sm p-6">

                  <div className="flex items-center justify-between mb-6">

                    <h2 className="text-xl font-semibold text-gray-800">
                      Inventory Overview
                    </h2>

                    <TrendingUp className="text-blue-600" />

                  </div>

                  <div className="space-y-5">

                    {[
                      {
                        title: "Available Stock",
                        value: "92%",
                        width: "92%",
                        color: "bg-blue-600",
                      },
                      {
                        title: "Reserved Stock",
                        value: "15%",
                        width: "15%",
                        color: "bg-yellow-500",
                      },
                      {
                        title: "Damaged Stock",
                        value: "3%",
                        width: "3%",
                        color: "bg-red-500",
                      },
                    ].map((item) => (

                      <div key={item.title}>

                        <div className="flex justify-between mb-2">

                          <span className="text-gray-600">
                            {item.title}
                          </span>

                          <span className="font-medium">
                            {item.value}
                          </span>

                        </div>

                        <div className="h-3 rounded-full bg-gray-200">

                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: item.width }}
                            transition={{ duration: 0.8 }}
                            className={`h-3 rounded-full ${item.color}`}
                          />

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

                {/* Low Stock */}

                <div className="bg-white rounded-2xl border shadow-sm p-6">

                  <div className="flex justify-between items-center mb-6">

                    <h2 className="text-xl font-semibold">
                      Low Stock Alerts
                    </h2>

                    <AlertTriangle className="text-orange-500" />

                  </div>

                  <div className="space-y-4">

                    {inventory.categories.slice(0,5).map((item,index)=>(

                      <div
                        key={item}
                        className="flex justify-between items-center border-b pb-3"
                      >

                        <div>

                          <p className="font-medium">
                            {item}
                          </p>

                          <p className="text-sm text-gray-500">
                            SKU-10{index+1}
                          </p>

                        </div>

                        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                          Low
                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              </div>

              {/* Recent Activity */}

              <div className="grid lg:grid-cols-2 gap-6">

                <div className="bg-white rounded-2xl border shadow-sm p-6">

                  <h2 className="text-xl font-semibold mb-6">
                    Recent Inventory Activity
                  </h2>

                  <div className="space-y-5">

                    {[
                      "Stock Updated",
                      "Purchase Order Received",
                      "Warehouse Transfer",
                      "New Product Added",
                      "Low Stock Notification",
                    ].map((activity,index)=>(

                      <div
                        key={activity}
                        className="flex justify-between items-center"
                      >

                        <div>

                          <p className="font-medium">
                            {activity}
                          </p>

                          <p className="text-sm text-gray-500">
                            Today
                          </p>

                        </div>

                        <ArrowUpRight
                          size={18}
                          className="text-blue-600"
                        />

                      </div>

                    ))}

                  </div>

                </div>

                {/* AI */}

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

                  <div className="flex items-center gap-3 mb-5">

                    <Brain className="text-blue-600" />

                    <h2 className="text-xl font-semibold">
                      AI Inventory Insights
                    </h2>

                  </div>

                  <div className="space-y-4">

                    <div className="bg-white rounded-xl p-4 border">

                      📦 Demand for
                      <strong>
                        {" "}
                        {inventory.categories[0]}
                      </strong>
                      {" "}is expected to increase next week.

                    </div>

                    <div className="bg-white rounded-xl p-4 border">

                      ⚠ Consider reordering products with low stock.

                    </div>

                    <div className="bg-white rounded-xl p-4 border">

                      📈 Inventory turnover has increased by
                      <strong> 12%</strong> this month.

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>
          )}
                    {/* ================= PRODUCTS ================= */}

          {activeMenu === "Products" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {/* Top Bar */}

              <div className="bg-white rounded-2xl border shadow-sm p-5">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <h2 className="text-2xl font-semibold text-gray-800">
                      Products
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Manage all products for {company.name}
                    </p>

                  </div>

    <div className="flex justify-end">

                    
                  </div>
<button
  onClick={() => setShowAddProductModal(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
>
  + Add Product
</button>
                </div>

              </div>

              {/* Products Table */}

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr className="text-left">

                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>

                    </tr>

                  </thead>

                  <tbody>

                    {products.map((product) => (

                      <tr
                        key={product.id}
                        className="border-t hover:bg-gray-50 transition"
                      >

                        <td className="px-6 py-4 font-medium">
                          {product.name}
                        </td>

                        <td className="px-6 py-4">
                          {product.category}
                        </td>

                        <td className="px-6 py-4">
                          {product.sku}
                        </td>

                        <td className="px-6 py-4">
                          {product.stock}
                        </td>

                        <td className="px-6 py-4">
                          {product.price}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              product.status === "In Stock"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {product.status}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-center gap-2">

                            <button
                              onClick={() => {
    setSelectedProduct(product);
    setShowViewModal(true);
}}
                              className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              View
                            </button>

                            <button
  onClick={() => {
    setSelectedProduct(product);
    setEditedProduct({ ...product });
    setShowEditModal(true);
  }}
  className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
>
  Edit
</button>

                            <button
  onClick={() => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  }}
  className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
>
  Delete
</button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </motion.div>
          )}
          {/* ================= CATEGORIES ================= */}

{activeMenu === "Categories" && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mt-8 space-y-6"
  >
    {/* Header */}

    <div className="bg-white rounded-2xl border shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-semibold text-gray-800">
            Categories
          </h2>

          <p className="text-gray-500 mt-1">
            Product categories available for {company.name}
          </p>

        </div>
<button
  onClick={() => setShowAddCategoryModal(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
>
  + Add Category
</button>

      </div>

    </div>

    {/* Category Grid */}

    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

     {categories.map((category) => (

        <motion.div
          key={category}
          whileHover={{
            y: -4,
          }}
          className="bg-white border rounded-2xl shadow-sm p-6"
        >

          <div className="flex justify-between items-center mb-5">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

              <Grid2X2
                className="text-blue-600"
                size={24}
              />

            </div>

            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">

              Active

            </span>

          </div>

          <h3 className="font-semibold text-lg">

            {category}

          </h3>

          <p className="text-gray-500 text-sm mt-2">

            {Math.floor(Math.random() * 40) + 10} Products

          </p>

          <div className="flex gap-2 mt-6">

            <button
  onClick={() => {
    setSelectedCategory(category);
    setShowViewCategoryModal(true);
  }}
  className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
>
  View
</button>

            <button
  onClick={() => {
    setSelectedCategory(category);
    setEditedCategory(category);
    setShowEditCategoryModal(true);
  }}
  className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
>
  Edit
</button>

          </div>

        </motion.div>

      ))}

    </div>

  </motion.div>
)}
{/* ================= STOCK MANAGEMENT ================= */}

{activeMenu === "Stock Management" && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mt-8 space-y-6"
  >

    {/* Summary Cards */}

    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <p className="text-sm text-gray-500">Available Stock</p>
        <h2 className="text-3xl font-bold mt-2">1,245</h2>
        <p className="text-green-600 text-sm mt-2">↑ 4.8% this month</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <p className="text-sm text-gray-500">Incoming Stock</p>
        <h2 className="text-3xl font-bold mt-2">235</h2>
        <p className="text-blue-600 text-sm mt-2">
          Expected this week
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <p className="text-sm text-gray-500">Outgoing Stock</p>
        <h2 className="text-3xl font-bold mt-2">198</h2>
        <p className="text-orange-600 text-sm mt-2">
          Ready for delivery
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <p className="text-sm text-gray-500">Low Stock Items</p>
        <h2 className="text-3xl font-bold mt-2">
          {inventory.lowStock}
        </h2>
        <p className="text-red-600 text-sm mt-2">
          Requires replenishment
        </p>
      </div>

    </div>

    {/* Stock Table */}

    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

      <div className="px-6 py-5 border-b">

        <h2 className="text-xl font-semibold">
          Current Stock
        </h2>

      </div>

      <table className="w-full">

        <thead className="bg-gray-50">

          <tr>

            <th className="text-left px-6 py-4">
              Product
            </th>

            <th className="text-left px-6 py-4">
              SKU
            </th>

            <th className="text-left px-6 py-4">
              Available
            </th>

            <th className="text-left px-6 py-4">
              Reserved
            </th>

            <th className="text-left px-6 py-4">
              Warehouse
            </th>

            <th className="text-left px-6 py-4">
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {products.map((product) => (

            <tr
              key={product.id}
              className="border-t hover:bg-gray-50"
            >

              <td className="px-6 py-4 font-medium">
                {product.name}
              </td>

              <td className="px-6 py-4">
                {product.sku}
              </td>

              <td className="px-6 py-4">
                {product.stock}
              </td>

              <td className="px-6 py-4">
                {Math.floor(product.stock / 4)}
              </td>

              <td className="px-6 py-4">
                Main Warehouse
              </td>

              <td className="px-6 py-4">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === "In Stock"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {product.status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

    {/* Stock Insights */}

    <div className="grid lg:grid-cols-2 gap-6">

      <div className="bg-white rounded-2xl border shadow-sm p-6">

        <h2 className="text-xl font-semibold mb-5">
          Stock Movement
        </h2>

        <div className="space-y-4">

          <div className="flex justify-between">
            <span>Products Added</span>
            <span className="font-semibold text-green-600">
              +120
            </span>
          </div>

          <div className="flex justify-between">
            <span>Products Sold</span>
            <span className="font-semibold text-blue-600">
              -94
            </span>
          </div>

          <div className="flex justify-between">
            <span>Returned</span>
            <span className="font-semibold text-orange-600">
              +8
            </span>
          </div>

          <div className="flex justify-between">
            <span>Damaged</span>
            <span className="font-semibold text-red-600">
              -3
            </span>
          </div>

        </div>

      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-5">
          AI Stock Suggestions
        </h2>

        <div className="space-y-4">

          <div className="bg-white rounded-xl p-4 border">
            📦 Restock <strong>{inventory.categories[0]}</strong>
            before next week.
          </div>

          <div className="bg-white rounded-xl p-4 border">
            📈 Sales trend indicates higher demand this month.
          </div>

          <div className="bg-white rounded-xl p-4 border">
            💰 Maintain at least 20 units for fast-moving
            products.
          </div>

        </div>

      </div>

    </div>

  </motion.div>
)}
          {/* ================= PURCHASE ORDERS ================= */}

          {activeMenu === "Purchase Orders" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {/* Header */}

              <div className="bg-white rounded-2xl border shadow-sm p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-semibold text-gray-800">
                      Purchase Orders
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Manage supplier purchase orders for {company.name}
                    </p>

                  </div>

                  <button
  onClick={() => setShowCreatePOModal(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
>
  + Create PO
</button>

                </div>

              </div>

              {/* Summary */}

              <div className="grid md:grid-cols-4 gap-6">

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Pending</p>
                  <h2 className="text-3xl font-bold mt-2">8</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Approved</p>
                  <h2 className="text-3xl font-bold mt-2">14</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Received</p>
                  <h2 className="text-3xl font-bold mt-2">32</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Cancelled</p>
                  <h2 className="text-3xl font-bold mt-2">2</h2>
                </div>

              </div>

              {/* Purchase Order Table */}

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-6 py-4">PO ID</th>
                      <th className="text-left px-6 py-4">Supplier</th>
                      <th className="text-left px-6 py-4">Products</th>
                      <th className="text-left px-6 py-4">Amount</th>
                      <th className="text-left px-6 py-4">Expected Date</th>
                      <th className="text-left px-6 py-4">Status</th>
                      <th className="text-center px-6 py-4">Actions</th>

                    </tr>

                  </thead>

                  <tbody>

                    {purchaseOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-medium">
                          {order.id}
                        </td>

                        <td className="px-6 py-4">
                          {order.supplier}
                        </td>

                        <td className="px-6 py-4">
                          {order.product}
                        </td>

                        <td className="px-6 py-4">
                          {order.amount}
                        </td>

                        <td className="px-6 py-4">
                          {order.date}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium
                              ${
                                order.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : order.status === "Approved"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                          >
                            {order.status}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-center gap-2">

                            <button
  onClick={() => {
    setSelectedOrder(order);
    setShowViewOrderModal(true);
  }}
  className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
>
  View
</button>

                            <button
  onClick={() => {
    setSelectedOrder(order);
    setEditedOrder({ ...order });
    setShowEditOrderModal(true);
  }}
  className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
>
  Edit
</button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </motion.div>
          )}
                    {/* ================= SUPPLIERS ================= */}

          {activeMenu === "Suppliers" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {/* Header */}

              <div className="bg-white rounded-2xl border shadow-sm p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-semibold text-gray-800">
                      Suppliers
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Manage suppliers for {company.name}
                    </p>

                  </div>

                  <button
                    onClick={() => alert("Add Supplier feature coming soon")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                  >
                    + Add Supplier
                  </button>

                </div>

              </div>

              {/* Summary Cards */}

              <div className="grid md:grid-cols-4 gap-6">

                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Total Suppliers</p>
                  <h2 className="text-3xl font-bold mt-2">24</h2>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Active</p>
                  <h2 className="text-3xl font-bold mt-2 text-green-600">21</h2>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Pending Approval</p>
                  <h2 className="text-3xl font-bold mt-2 text-orange-600">2</h2>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Inactive</p>
                  <h2 className="text-3xl font-bold mt-2 text-red-600">1</h2>
                </div>

              </div>

              {/* Suppliers Table */}

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-6 py-4">Supplier</th>
                      <th className="text-left px-6 py-4">Contact</th>
                      <th className="text-left px-6 py-4">Phone</th>
                      <th className="text-left px-6 py-4">Products</th>
                      <th className="text-left px-6 py-4">Rating</th>
                      <th className="text-left px-6 py-4">Status</th>
                      <th className="text-center px-6 py-4">Actions</th>

                    </tr>

                  </thead>

                  <tbody>

                  {suppliers.map((supplier) => (

                      <tr
                        key={supplier.name}
                        className="border-t hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-medium">
                          {supplier.name}
                        </td>

                        <td className="px-6 py-4">
                          {supplier.contact}
                        </td>

                        <td className="px-6 py-4">
                          {supplier.phone}
                        </td>

                        <td className="px-6 py-4">
                          {supplier.products}
                        </td>

                        <td className="px-6 py-4 text-yellow-500">
                          {supplier.rating}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              supplier.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {supplier.status}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-center gap-2">

                            <div className="flex justify-center gap-2">

  <button
    onClick={() => {
      setSelectedSupplier(supplier);
      setShowViewSupplierModal(true);
    }}
    className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
  >
    View
  </button>

  <button
    onClick={() => {
      setSelectedSupplier(supplier);
      setEditedSupplier({ ...supplier });
      setShowEditSupplierModal(true);
    }}
    className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
  >
    Edit
  </button>

</div>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </motion.div>
          )}
                    {/* ================= WAREHOUSES ================= */}

          {activeMenu === "Warehouses" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {/* Header */}

              <div className="bg-white rounded-2xl border shadow-sm p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-semibold text-gray-800">
                      Warehouses
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Warehouse management for {company.name}
                    </p>

                  </div>

                  <button
                    onClick={() => alert("Add Warehouse feature coming soon")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                  >
                    + Add Warehouse
                  </button>

                </div>

              </div>

              {/* Summary Cards */}

              <div className="grid md:grid-cols-4 gap-6">

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Warehouses</p>
                  <h2 className="text-3xl font-bold mt-2">4</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Capacity Used</p>
                  <h2 className="text-3xl font-bold mt-2">78%</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Available Space</p>
                  <h2 className="text-3xl font-bold mt-2">22%</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Total Stock Value</p>
                  <h2 className="text-2xl font-bold mt-2">
                    {inventory.inventoryValue}
                  </h2>
                </div>

              </div>

              {/* Warehouses Table */}

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-6 py-4">
                        Warehouse
                      </th>

                      <th className="text-left px-6 py-4">
                        Manager
                      </th>

                      <th className="text-left px-6 py-4">
                        Location
                      </th>

                      <th className="text-left px-6 py-4">
                        Capacity
                      </th>

                      <th className="text-left px-6 py-4">
                        Occupancy
                      </th>

                      <th className="text-left px-6 py-4">
                        Status
                      </th>

                      <th className="text-center px-6 py-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {warehouses.map((warehouse)=>(

                      <tr
                        key={warehouse.name}
                        className="border-t hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-medium">
                          {warehouse.name}
                        </td>

                        <td className="px-6 py-4">
                          {warehouse.manager}
                        </td>

                        <td className="px-6 py-4">
                          {warehouse.location}
                        </td>

                        <td className="px-6 py-4">
                          {warehouse.capacity}
                        </td>

                        <td className="px-6 py-4">
                          {warehouse.occupancy}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              warehouse.status === "Operational"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {warehouse.status}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-center gap-2">

                            <div className="flex justify-center gap-2">

<button
onClick={()=>{
setSelectedWarehouse(warehouse);
setShowViewWarehouseModal(true);
}}
className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
>

View

</button>

<button
onClick={()=>{
setSelectedWarehouse(warehouse);
setEditedWarehouse({...warehouse});
setShowEditWarehouseModal(true);
}}
className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
>

Edit

</button>

</div>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </motion.div>
          )}
                    {/* ================= REPORTS ================= */}

          {activeMenu === "Reports" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {/* Header */}

              <div className="bg-white rounded-2xl border shadow-sm p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-semibold text-gray-800">
                      Inventory Reports
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Inventory analytics for {company.name}
                    </p>

                  </div>

                  <button
                    onClick={() => alert("Report exported successfully")}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Export Report
                  </button>

                </div>

              </div>

              {/* Summary */}

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">
                    Inventory Value
                  </p>
                  <h2 className="text-2xl font-bold mt-2">
                    {inventory.inventoryValue}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">
                    Total Products
                  </p>
                  <h2 className="text-3xl font-bold mt-2">
                    {inventory.totalProducts}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">
                    Low Stock
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-orange-600">
                    {inventory.lowStock}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">
                    Inventory Accuracy
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-green-600">
                    98%
                  </h2>
                </div>

              </div>

              {/* Report Table */}

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-6 py-4">
                        Report
                      </th>

                      <th className="text-left px-6 py-4">
                        Generated On
                      </th>

                      <th className="text-left px-6 py-4">
                        Status
                      </th>

                      <th className="text-center px-6 py-4">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {[
                      "Inventory Value Report",
                      "Stock Movement Report",
                      "Low Stock Report",
                      "Purchase Order Report",
                      "Warehouse Report",
                    ].map((report, index) => (

                      <tr
                        key={report}
                        className="border-t hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-medium">
                          {report}
                        </td>

                        <td className="px-6 py-4">
                          13 Jul 2026
                        </td>

                        <td className="px-6 py-4">

                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                            Ready
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-center">

                            <button
                              onClick={() =>
                                alert(`${report} downloaded`)
                              }
                              className="px-4 py-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              Download
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* Report Insights */}

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

                <h2 className="text-xl font-semibold mb-5">
                  Report Insights
                </h2>

                <div className="space-y-4">

                  <div className="bg-white rounded-xl border p-4">
                    📈 Inventory value has increased by
                    <strong> 11%</strong> compared to last month.
                  </div>

                  <div className="bg-white rounded-xl border p-4">
                    📦 Fast-moving products belong to
                    <strong> {inventory.categories[0]}</strong>.
                  </div>

                  <div className="bg-white rounded-xl border p-4">
                    ⚠ {inventory.lowStock} products require restocking.
                  </div>

                </div>

              </div>

            </motion.div>
          )}
                    {/* ================= AI INVENTORY ASSISTANT ================= */}

          {activeMenu === "AI Inventory Assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {/* Header */}

              <div className="bg-white rounded-2xl border shadow-sm p-6">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Brain className="text-white" size={30} />
                  </div>

                  <div>

                    <h2 className="text-2xl font-semibold">
                      AI Inventory Assistant
                    </h2>

                    <p className="text-gray-500">
                      Smart inventory recommendations powered by AI.
                    </p>

                  </div>

                </div>

              </div>

              {/* Chat */}

              <div className="bg-white rounded-2xl border shadow-sm p-6">

                <div className="space-y-5">

                  <div className="bg-gray-100 rounded-xl p-4">
                    👋 Hello! I'm your Inventory AI Assistant.
                  </div>

                  <div className="bg-blue-600 text-white rounded-xl p-4 ml-20">
                    Which products need restocking?
                  </div>

                  <div className="bg-gray-100 rounded-xl p-4">

                    Based on current inventory, I recommend restocking:

                    <ul className="list-disc ml-6 mt-3">

                      <li>{inventory.categories[0]}</li>
                      <li>{inventory.categories[1]}</li>
                      <li>{inventory.categories[2]}</li>

                    </ul>

                  </div>

                </div>

                <div className="mt-6 flex gap-3">

                  <input
                    type="text"
                    placeholder="Ask AI anything..."
                    className="flex-1 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"
                  >
                    Send
                  </button>

                </div>

              </div>

              {/* AI Suggestions */}

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                {[
                  "Restock Low Inventory",
                  "Predict Demand",
                  "Best Selling Products",
                  "Inventory Summary",
                ].map((item) => (

                  <button
                    key={item}
                    onClick={() => alert(item)}
                    className="bg-white border rounded-xl p-5 hover:border-blue-600 hover:bg-blue-50 transition"
                  >

                    <Brain
                      className="text-blue-600 mb-3"
                      size={24}
                    />

                    <p className="font-medium">
                      {item}
                    </p>

                  </button>

                ))}

              </div>

              {/* AI Recommendations */}

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

                <h2 className="text-xl font-semibold mb-5">
                  AI Recommendations
                </h2>

                <div className="space-y-4">

                  <div className="bg-white border rounded-xl p-4">

                    📈 Demand for
                    <strong> {inventory.categories[0]}</strong>
                    {" "}is expected to increase next week.

                  </div>

                  <div className="bg-white border rounded-xl p-4">

                    📦 Consider ordering
                    <strong> 150 more units</strong>
                    {" "}to avoid stock shortages.

                  </div>

                  <div className="bg-white border rounded-xl p-4">

                    💰 Estimated inventory savings:
                    <strong> ₹42,000</strong>
                    {" "}this month.

                  </div>

                </div>

              </div>

            </motion.div>
          )}
                  </div>
                  {/* ================= PRODUCT VIEW MODAL ================= */}

{showViewModal && selectedProduct && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity:0, scale:0.95 }}
    animate={{ opacity:1, scale:1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">

        Product Details

      </h2>

      <button
        onClick={() => setShowViewModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8">

      <div className="grid grid-cols-2 gap-6">

        <div>

          <p className="text-gray-500">Product Name</p>

          <h3 className="font-semibold text-lg">
            {selectedProduct.name}
          </h3>

        </div>

        <div>

          <p className="text-gray-500">Category</p>

          <h3 className="font-semibold text-lg">
            {selectedProduct.category}
          </h3>

        </div>

        <div>

          <p className="text-gray-500">SKU</p>

          <h3 className="font-semibold">
            {selectedProduct.sku}
          </h3>

        </div>

        <div>

          <p className="text-gray-500">Price</p>

          <h3 className="font-semibold">
            {selectedProduct.price}
          </h3>

        </div>

        <div>

          <p className="text-gray-500">Stock</p>

          <h3 className="font-semibold">
            {selectedProduct.stock}
          </h3>

        </div>

        <div>

          <p className="text-gray-500">Status</p>

          <span
            className={`px-3 py-1 rounded-full text-sm ${
              selectedProduct.status === "In Stock"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {selectedProduct.status}
          </span>

        </div>

      </div>

      <div className="mt-8">

        <h3 className="font-semibold mb-2">
          Description
        </h3>

        <p className="text-gray-600">

          This is one of the products available in
          {` ${company.name}`} inventory.

        </p>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-5 flex justify-end">

      <button
        onClick={() => setShowViewModal(false)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
      >
        Close
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= EDIT PRODUCT MODAL ================= */}

{showEditModal && editedProduct && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity:0, scale:0.95 }}
    animate={{ opacity:1, scale:1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Edit Product
      </h2>

      <button
        onClick={() => setShowEditModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8 grid grid-cols-2 gap-6">

      <div>

        <label className="text-sm text-gray-600">
          Product Name
        </label>

        <input
          value={editedProduct.name}
          onChange={(e)=>
            setEditedProduct({
              ...editedProduct,
              name:e.target.value,
            })
          }
          className="w-full mt-2 border rounded-xl px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm text-gray-600">
          Category
        </label>

        <input
          value={editedProduct.category}
          onChange={(e)=>
            setEditedProduct({
              ...editedProduct,
              category:e.target.value,
            })
          }
          className="w-full mt-2 border rounded-xl px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm text-gray-600">
          Price
        </label>

        <input
          value={editedProduct.price}
          onChange={(e)=>
            setEditedProduct({
              ...editedProduct,
              price:e.target.value,
            })
          }
          className="w-full mt-2 border rounded-xl px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm text-gray-600">
          Stock
        </label>

        <input
          type="number"
          value={editedProduct.stock}
          onChange={(e)=>
            setEditedProduct({
              ...editedProduct,
              stock:Number(e.target.value),
            })
          }
          className="w-full mt-2 border rounded-xl px-4 py-3"
        />

      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-6 flex justify-end gap-3">

      <button
        onClick={()=>setShowEditModal(false)}
        className="px-6 py-2 rounded-xl border"
      >
        Cancel
      </button>

      <button
        onClick={()=>{
          alert("Product Updated Successfully");
          setShowEditModal(false);
        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl"
      >
        Update Product
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= ADD PRODUCT MODAL ================= */}

{showAddProductModal && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity:0, scale:0.95 }}
    animate={{ opacity:1, scale:1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Add Product
      </h2>

      <button
        onClick={() => setShowAddProductModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8 grid grid-cols-2 gap-6">

      <div>

        <label className="text-sm font-medium">
          Product Name
        </label>

        <input
          type="text"
          value={newProduct.name}
          onChange={(e)=>
            setNewProduct({
              ...newProduct,
              name:e.target.value,
            })
          }
          className="w-full border rounded-xl mt-2 px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm font-medium">
          Category
        </label>

        <input
          type="text"
          value={newProduct.category}
          onChange={(e)=>
            setNewProduct({
              ...newProduct,
              category:e.target.value,
            })
          }
          className="w-full border rounded-xl mt-2 px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm font-medium">
          SKU
        </label>

        <input
          type="text"
          value={newProduct.sku}
          onChange={(e)=>
            setNewProduct({
              ...newProduct,
              sku:e.target.value,
            })
          }
          className="w-full border rounded-xl mt-2 px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm font-medium">
          Price
        </label>

        <input
          type="text"
          value={newProduct.price}
          onChange={(e)=>
            setNewProduct({
              ...newProduct,
              price:e.target.value,
            })
          }
          className="w-full border rounded-xl mt-2 px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm font-medium">
          Stock
        </label>

        <input
          type="number"
          value={newProduct.stock}
          onChange={(e)=>
            setNewProduct({
              ...newProduct,
              stock:Number(e.target.value),
            })
          }
          className="w-full border rounded-xl mt-2 px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm font-medium">
          Status
        </label>

        <select
          value={newProduct.status}
          onChange={(e)=>
            setNewProduct({
              ...newProduct,
              status:e.target.value,
            })
          }
          className="w-full border rounded-xl mt-2 px-4 py-3"
        >
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-6 flex justify-end gap-3">

      <button
        onClick={() => setShowAddProductModal(false)}
        className="px-6 py-2 border rounded-xl"
      >
        Cancel
      </button>

      <button
        onClick={() => {

          const product = {
            ...newProduct,
            id: Date.now(),
          };

          setProducts((prev) => [...prev, product]);

setShowAddProductModal(false);

setShowProductAdded(true);

setTimeout(() => {
  setShowProductAdded(false);
}, 2000);

setNewProduct({
  id: Date.now(),
  name: "",
  category: "",
  sku: "",
  price: "",
  stock: 0,
  status: "In Stock",
});

        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
      >
        Add Product
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= DELETE PRODUCT MODAL ================= */}

{showDeleteModal && selectedProduct && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity:0, scale:0.95 }}
    animate={{ opacity:1, scale:1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
  >

    <div className="bg-red-600 text-white px-6 py-5">

      <h2 className="text-xl font-bold">
        Delete Product
      </h2>

    </div>

    <div className="p-6">

      <p className="text-gray-700 text-lg">

        Are you sure you want to delete

        <span className="font-bold">
          {" "}
          {selectedProduct.name}
        </span>

        ?

      </p>

      <p className="text-gray-500 mt-3">
        This action cannot be undone.
      </p>

    </div>

    <div className="border-t p-5 flex justify-end gap-3">

      <button
        onClick={() => setShowDeleteModal(false)}
        className="px-5 py-2 border rounded-xl"
      >
        Cancel
      </button>

      <button
        onClick={() => {

          setProducts(prev =>
            prev.filter(item => item.id !== selectedProduct.id)
          );

          setShowDeleteModal(false);

          setSelectedProduct(null);

          setShowProductDeleted(true);

          setTimeout(() => {
            setShowProductDeleted(false);
          }, 2000);

        }}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl"
      >
        Delete
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= ADD CATEGORY MODAL ================= */}

{showAddCategoryModal && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity:0, scale:0.95 }}
    animate={{ opacity:1, scale:1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Add Category
      </h2>

      <button
        onClick={() => setShowAddCategoryModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8 space-y-6">

      <div>

        <label className="text-sm font-medium">
          Category Name
        </label>

        <input
          type="text"
          value={newCategory.name}
          onChange={(e)=>
            setNewCategory({
              ...newCategory,
              name:e.target.value,
            })
          }
          className="w-full mt-2 border rounded-xl px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm font-medium">
          Description
        </label>

        <textarea
          rows={4}
          value={newCategory.description}
          onChange={(e)=>
            setNewCategory({
              ...newCategory,
              description:e.target.value,
            })
          }
          className="w-full mt-2 border rounded-xl px-4 py-3"
        />

      </div>

      <div>

        <label className="text-sm font-medium">
          Status
        </label>

        <select
          value={newCategory.status}
          onChange={(e)=>
            setNewCategory({
              ...newCategory,
              status:e.target.value,
            })
          }
          className="w-full mt-2 border rounded-xl px-4 py-3"
        >

          <option>Active</option>
          <option>Inactive</option>

        </select>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-6 flex justify-end gap-3">

      <button
        onClick={() => setShowAddCategoryModal(false)}
        className="px-6 py-2 border rounded-xl"
      >
        Cancel
      </button>

      <button
        onClick={() => {

          setCategories(prev => [
            ...prev,
            newCategory.name,
          ]);

          setShowAddCategoryModal(false);

          setShowCategoryAdded(true);

          setTimeout(() => {
            setShowCategoryAdded(false);
          }, 2000);

          setNewCategory({
            name:"",
            description:"",
            status:"Active",
          });

        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
      >
        Create Category
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= VIEW CATEGORY MODAL ================= */}

{showViewCategoryModal && selectedCategory && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity:0, scale:0.95 }}
    animate={{ opacity:1, scale:1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
  >

    <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Category Details
      </h2>

      <button
        onClick={() => setShowViewCategoryModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    <div className="p-8 space-y-6">

      <div>

        <p className="text-gray-500">
          Category Name
        </p>

        <h3 className="text-xl font-semibold">
          {selectedCategory}
        </h3>

      </div>

      <div>

        <p className="text-gray-500">
          Company
        </p>

        <h3 className="font-semibold">
          {company.name}
        </h3>

      </div>

      <div>

        <p className="text-gray-500">
          Status
        </p>

        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
          Active
        </span>

      </div>

      <div>

        <p className="text-gray-500">
          Description
        </p>

        <p>
          {selectedCategory} products available in {company.name}.
        </p>

      </div>

    </div>

    <div className="border-t p-5 flex justify-end">

      <button
        onClick={() => setShowViewCategoryModal(false)}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl"
      >
        Close
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= EDIT CATEGORY MODAL ================= */}

{showEditCategoryModal && selectedCategory && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity:0, scale:0.95 }}
    animate={{ opacity:1, scale:1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Edit Category
      </h2>

      <button
        onClick={() => setShowEditCategoryModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8">

      <label className="text-sm font-medium">
        Category Name
      </label>

      <input
        type="text"
        value={editedCategory}
        onChange={(e)=>setEditedCategory(e.target.value)}
        className="w-full mt-2 border rounded-xl px-4 py-3"
      />

    </div>

    {/* Footer */}

    <div className="border-t p-6 flex justify-end gap-3">

      <button
        onClick={() => setShowEditCategoryModal(false)}
        className="px-6 py-2 border rounded-xl"
      >
        Cancel
      </button>

      <button
        onClick={() => {

          setCategories(prev =>
            prev.map(item =>
              item === selectedCategory
                ? editedCategory
                : item
            )
          );

          setShowEditCategoryModal(false);

          setShowCategoryUpdated(true);

          setTimeout(() => {
            setShowCategoryUpdated(false);
          }, 2000);

        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl"
      >
        Update Category
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= PURCHASE ORDER VIEW ================= */}

{showViewOrderModal && selectedOrder && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<motion.div
initial={{opacity:0,scale:0.95}}
animate={{opacity:1,scale:1}}
className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
>

<div className="bg-blue-600 text-white px-8 py-5 flex justify-between">

<h2 className="text-2xl font-bold">
Purchase Order Details
</h2>

<button
onClick={()=>setShowViewOrderModal(false)}
className="text-2xl"
>
×
</button>

</div>

<div className="p-8 grid grid-cols-2 gap-6">

<div>
<p className="text-gray-500">Order ID</p>
<h3 className="font-semibold">
{selectedOrder.id}
</h3>
</div>

<div>
<p className="text-gray-500">Supplier</p>
<h3 className="font-semibold">
{selectedOrder.supplier}
</h3>
</div>

<div>
<p className="text-gray-500">Amount</p>
<h3 className="font-semibold">
{selectedOrder.amount}
</h3>
</div>

<div>
<p className="text-gray-500">Status</p>
<h3 className="font-semibold">
{selectedOrder.status}
</h3>
</div>

</div>

<div className="border-t p-5 flex justify-end">

<button
onClick={()=>setShowViewOrderModal(false)}
className="bg-blue-600 text-white px-6 py-2 rounded-xl"
>

Close

</button>

</div>

</motion.div>

</div>

)}
{/* ================= VIEW PURCHASE ORDER MODAL ================= */}

{showViewOrderModal && selectedOrder && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Purchase Order Details
      </h2>

      <button
        onClick={() => setShowViewOrderModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8 grid grid-cols-2 gap-6">

      <div>
        <p className="text-gray-500">PO Number</p>
        <h3 className="font-semibold">{selectedOrder.id}</h3>
      </div>

      <div>
        <p className="text-gray-500">Supplier</p>
        <h3 className="font-semibold">{selectedOrder.supplier}</h3>
      </div>

      <div>
        <p className="text-gray-500">Product</p>
        <h3 className="font-semibold">{selectedOrder.product}</h3>
      </div>

      <div>
        <p className="text-gray-500">Amount</p>
        <h3 className="font-semibold">{selectedOrder.amount}</h3>
      </div>

      <div>
        <p className="text-gray-500">Expected Date</p>
        <h3 className="font-semibold">{selectedOrder.date}</h3>
      </div>

      <div>
        <p className="text-gray-500">Status</p>

        <span
          className={`px-3 py-1 rounded-full text-sm ${
            selectedOrder.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : selectedOrder.status === "Approved"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {selectedOrder.status}
        </span>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-5 flex justify-end">

      <button
        onClick={() => setShowViewOrderModal(false)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
      >
        Close
      </button>

    </div>

  </motion.div>

</div>


)}
{showProductAdded && (
  <motion.div
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
  >
    ✅ Product added successfully
  </motion.div>
)}
{showProductDeleted && (

<motion.div
  initial={{ opacity:0, y:-30 }}
  animate={{ opacity:1, y:0 }}
  className="fixed top-20 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
>

✅ Product deleted successfully

</motion.div>

)}
{showCategoryUpdated && (

<motion.div
  initial={{ opacity:0, y:-30 }}
  animate={{ opacity:1, y:0 }}
  className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
>

✅ Category updated successfully

</motion.div>

)}
{/* ================= EDIT PURCHASE ORDER MODAL ================= */}

{showEditOrderModal && editedOrder && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Edit Purchase Order
      </h2>

      <button
        onClick={() => setShowEditOrderModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8 grid grid-cols-2 gap-6">

      <div>
        <label className="block mb-2 font-medium">
          Supplier
        </label>

        <input
          type="text"
          value={editedOrder.supplier}
          onChange={(e) =>
            setEditedOrder({
              ...editedOrder,
              supplier: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Product
        </label>

        <input
          type="text"
          value={editedOrder.product}
          onChange={(e) =>
            setEditedOrder({
              ...editedOrder,
              product: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Amount
        </label>

        <input
          type="text"
          value={editedOrder.amount}
          onChange={(e) =>
            setEditedOrder({
              ...editedOrder,
              amount: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Expected Date
        </label>

        <input
          type="text"
          value={editedOrder.date}
          onChange={(e) =>
            setEditedOrder({
              ...editedOrder,
              date: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div className="col-span-2">
        <label className="block mb-2 font-medium">
          Status
        </label>

        <select
          value={editedOrder.status}
          onChange={(e) =>
            setEditedOrder({
              ...editedOrder,
              status: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3"
        >
          <option>Pending</option>
          <option>Approved</option>
          <option>Received</option>
        </select>
      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-6 flex justify-end gap-3">

      <button
        onClick={() => setShowEditOrderModal(false)}
        className="px-6 py-2 border rounded-xl"
      >
        Cancel
      </button>

      <button
        onClick={() => {

          setPurchaseOrders(prev =>
            prev.map(item =>
              item.id === editedOrder.id ? editedOrder : item
            )
          );

          setShowEditOrderModal(false);

          setShowOrderUpdated(true);

          setTimeout(() => {
            setShowOrderUpdated(false);
          }, 2000);

        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl"
      >
        Update Purchase Order
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= CREATE PURCHASE ORDER MODAL ================= */}

{showCreatePOModal && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<motion.div
initial={{opacity:0,scale:0.95}}
animate={{opacity:1,scale:1}}
className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
>

<div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">

<h2 className="text-2xl font-bold">
Create Purchase Order
</h2>

<button
onClick={()=>setShowCreatePOModal(false)}
className="text-2xl"
>
×
</button>

</div>

<div className="p-8 grid grid-cols-2 gap-6">

<div>

<label className="font-medium">
PO Number
</label>

<input
type="text"
value={newPO.id}
onChange={(e)=>setNewPO({...newPO,id:e.target.value})}
className="w-full border rounded-xl px-4 py-3 mt-2"
/>

</div>

<div>

<label className="font-medium">
Supplier
</label>

<input
type="text"
value={newPO.supplier}
onChange={(e)=>setNewPO({...newPO,supplier:e.target.value})}
className="w-full border rounded-xl px-4 py-3 mt-2"
/>

</div>

<div>

<label className="font-medium">
Product
</label>

<input
type="text"
value={newPO.product}
onChange={(e)=>setNewPO({...newPO,product:e.target.value})}
className="w-full border rounded-xl px-4 py-3 mt-2"
/>

</div>

<div>

<label className="font-medium">
Amount
</label>

<input
type="text"
value={newPO.amount}
onChange={(e)=>setNewPO({...newPO,amount:e.target.value})}
className="w-full border rounded-xl px-4 py-3 mt-2"
/>

</div>

<div>

<label className="font-medium">
Expected Date
</label>

<input
type="date"
value={newPO.date}
onChange={(e)=>setNewPO({...newPO,date:e.target.value})}
className="w-full border rounded-xl px-4 py-3 mt-2"
/>

</div>

<div>

<label className="font-medium">
Status
</label>

<select
value={newPO.status}
onChange={(e)=>setNewPO({...newPO,status:e.target.value})}
className="w-full border rounded-xl px-4 py-3 mt-2"
>

<option>Pending</option>
<option>Approved</option>
<option>Received</option>

</select>

</div>

</div>

<div className="border-t p-6 flex justify-end gap-3">

<button
onClick={()=>setShowCreatePOModal(false)}
className="px-6 py-2 border rounded-xl"
>

Cancel

</button>

<button
onClick={()=>{

setPurchaseOrders(prev=>[
...prev,
newPO
]);

setShowCreatePOModal(false);

setShowPOCreated(true);

setTimeout(()=>{
setShowPOCreated(false);
},2000);

setNewPO({
id:"",
supplier:"",
product:"",
amount:"",
date:"",
status:"Pending",
});

}}
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
>

Create Purchase Order

</button>

</div>

</motion.div>

</div>

)}
{showPOCreated && (

<motion.div
initial={{opacity:0,y:-30}}
animate={{opacity:1,y:0}}
className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
>

✅ Purchase Order created successfully

</motion.div>

)}
{/* ================= VIEW SUPPLIER MODAL ================= */}

{showViewSupplierModal && selectedSupplier && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Supplier Details
      </h2>

      <button
        onClick={() => setShowViewSupplierModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8 grid grid-cols-2 gap-6">

      <div>
        <p className="text-gray-500">Supplier Name</p>
        <h3 className="font-semibold">{selectedSupplier.name}</h3>
      </div>

      <div>
        <p className="text-gray-500">Contact Person</p>
        <h3 className="font-semibold">{selectedSupplier.contact}</h3>
      </div>

      <div>
        <p className="text-gray-500">Phone</p>
        <h3 className="font-semibold">{selectedSupplier.phone}</h3>
      </div>

      <div>
        <p className="text-gray-500">Products</p>
        <h3 className="font-semibold">{selectedSupplier.products}</h3>
      </div>

      <div>
        <p className="text-gray-500">Rating</p>
        <h3 className="font-semibold">{selectedSupplier.rating}</h3>
      </div>

      <div>
        <p className="text-gray-500">Status</p>

        <span
          className={`px-3 py-1 rounded-full text-sm ${
            selectedSupplier.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {selectedSupplier.status}
        </span>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-5 flex justify-end">

      <button
        onClick={() => setShowViewSupplierModal(false)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
      >
        Close
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= EDIT SUPPLIER MODAL ================= */}

{showEditSupplierModal && editedSupplier && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Edit Supplier
      </h2>

      <button
        onClick={() => setShowEditSupplierModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8 grid grid-cols-2 gap-6">

      <div>
        <label className="font-medium">Supplier Name</label>
        <input
          type="text"
          value={editedSupplier.name}
          onChange={(e) =>
            setEditedSupplier({
              ...editedSupplier,
              name: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Contact Person</label>
        <input
          type="text"
          value={editedSupplier.contact}
          onChange={(e) =>
            setEditedSupplier({
              ...editedSupplier,
              contact: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Phone</label>
        <input
          type="text"
          value={editedSupplier.phone}
          onChange={(e) =>
            setEditedSupplier({
              ...editedSupplier,
              phone: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Email</label>
        <input
          type="email"
          value={editedSupplier.email}
          onChange={(e) =>
            setEditedSupplier({
              ...editedSupplier,
              email: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Address</label>
        <input
          type="text"
          value={editedSupplier.address}
          onChange={(e) =>
            setEditedSupplier({
              ...editedSupplier,
              address: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Status</label>

        <select
          value={editedSupplier.status}
          onChange={(e) =>
            setEditedSupplier({
              ...editedSupplier,
              status: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        >
          <option>Active</option>
          <option>Pending</option>
          <option>Inactive</option>
        </select>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-6 flex justify-end gap-3">

      <button
        onClick={() => setShowEditSupplierModal(false)}
        className="px-6 py-2 border rounded-xl"
      >
        Cancel
      </button>

      <button
        onClick={() => {

          setSuppliers(prev =>
            prev.map(item =>
              item.id === editedSupplier.id
                ? editedSupplier
                : item
            )
          );

          setShowEditSupplierModal(false);

          setShowSupplierUpdated(true);

          setTimeout(() => {
            setShowSupplierUpdated(false);
          }, 2000);

        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl"
      >
        Update Supplier
      </button>

    </div>

  </motion.div>

</div>

)}
{/* ================= VIEW WAREHOUSE MODAL ================= */}

{showViewWarehouseModal && selectedWarehouse && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<motion.div
initial={{opacity:0,scale:0.95}}
animate={{opacity:1,scale:1}}
className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
>

<div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">

<h2 className="text-2xl font-bold">

Warehouse Details

</h2>

<button
onClick={()=>setShowViewWarehouseModal(false)}
className="text-2xl"
>

×

</button>

</div>

<div className="p-8 grid grid-cols-2 gap-6">

<div>

<p className="text-gray-500">Warehouse</p>

<h3 className="font-semibold">
{selectedWarehouse.name}
</h3>

</div>

<div>

<p className="text-gray-500">Location</p>

<h3 className="font-semibold">
{selectedWarehouse.location}
</h3>

</div>

<div>

<p className="text-gray-500">Manager</p>

<h3 className="font-semibold">
{selectedWarehouse.manager}
</h3>

</div>

<div>

<p className="text-gray-500">Capacity</p>

<h3 className="font-semibold">
{selectedWarehouse.capacity}
</h3>

</div>

<div>

<p className="text-gray-500">Current Stock</p>

<h3 className="font-semibold">
{selectedWarehouse.stock}
</h3>

</div>

<div>

<p className="text-gray-500">Status</p>

<span className={`px-3 py-1 rounded-full text-sm ${
selectedWarehouse.status==="Active"
?"bg-green-100 text-green-700"
:"bg-yellow-100 text-yellow-700"
}`}>

{selectedWarehouse.status}

</span>

</div>

</div>

<div className="border-t p-5 flex justify-end">

<button
onClick={()=>setShowViewWarehouseModal(false)}
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
>

Close

</button>

</div>

</motion.div>

</div>

)}
{/* ================= EDIT WAREHOUSE MODAL ================= */}

{showEditWarehouseModal && editedWarehouse && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
  >

    {/* Header */}

    <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">

      <h2 className="text-2xl font-bold">
        Edit Warehouse
      </h2>

      <button
        onClick={() => setShowEditWarehouseModal(false)}
        className="text-2xl"
      >
        ×
      </button>

    </div>

    {/* Body */}

    <div className="p-8 grid grid-cols-2 gap-6">

      <div>
        <label className="font-medium">Warehouse Name</label>
        <input
          type="text"
          value={editedWarehouse.name}
          onChange={(e) =>
            setEditedWarehouse({
              ...editedWarehouse,
              name: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Location</label>
        <input
          type="text"
          value={editedWarehouse.location}
          onChange={(e) =>
            setEditedWarehouse({
              ...editedWarehouse,
              location: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Manager</label>
        <input
          type="text"
          value={editedWarehouse.manager}
          onChange={(e) =>
            setEditedWarehouse({
              ...editedWarehouse,
              manager: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Capacity</label>
        <input
          type="text"
          value={editedWarehouse.capacity}
          onChange={(e) =>
            setEditedWarehouse({
              ...editedWarehouse,
              capacity: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Current Stock</label>
        <input
          type="text"
          value={editedWarehouse.stock}
          onChange={(e) =>
            setEditedWarehouse({
              ...editedWarehouse,
              stock: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        />
      </div>

      <div>
        <label className="font-medium">Status</label>

        <select
          value={editedWarehouse.status}
          onChange={(e) =>
            setEditedWarehouse({
              ...editedWarehouse,
              status: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 mt-2"
        >
          <option>Active</option>
          <option>Maintenance</option>
          <option>Inactive</option>
        </select>

      </div>

    </div>

    {/* Footer */}

    <div className="border-t p-6 flex justify-end gap-3">

      <button
        onClick={() => setShowEditWarehouseModal(false)}
        className="px-6 py-2 border rounded-xl"
      >
        Cancel
      </button>

      <button
        onClick={() => {

          setWarehouses(prev =>
            prev.map(item =>
              item.id === editedWarehouse.id
                ? editedWarehouse
                : item
            )
          );

          setShowEditWarehouseModal(false);

          setShowWarehouseUpdated(true);

          setTimeout(() => {
            setShowWarehouseUpdated(false);
          }, 2000);

        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl"
      >
        Update Warehouse
      </button>

    </div>

  </motion.div>

</div>

)}
      </main>
    </div>
  );
}