//Inventory.tsx
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "react-router-dom";
import MessageForm from "../../components/Businesses/MessageForm";
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
  Bell,
  CheckCircle,
  Activity,
  CalendarCheck,
  Wallet,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";

interface CompanyInventory {
  totalProducts: number;
  totalCategories: number;
  lowStock: number;
  inventoryValue: string;
  categories: string[];
  availableStock: number;
  incomingStock: number;
  outgoingStock: number;
  availablePct: number;
  reservedPct: number;
  damagedPct: number;
  inventoryAccuracy: number;
  stockAdded: number;
  stockSold: number;
  stockReturned: number;
  stockDamaged: number;
}

interface Product {
  id: string | number;
  name: string;
  category: string;
  sku: string;
  stock: number;
  price: string;
  status: "In Stock" | "Low Stock";
  image?: string;
  warehouseId?: number | null;
  warehouseName?: string | null;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  department: string;
  color: string;
  isRead?: boolean;
}

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
    image: "",
  });
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [editProductImageUploading, setEditProductImageUploading] = useState(false);

  const location = useLocation();
  const params = useParams<{ company: string }>();

  const businessId = params?.company || location.state?.company?.workspace || "";
  const companyName =
    location.state?.company?.name || businessId || "TechZone Store";

  const company = { name: companyName };

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [inventory, setInventory] = useState<CompanyInventory>({
    totalProducts: 0,
    totalCategories: 0,
    lowStock: 0,
    inventoryValue: "₹0",
    categories: [],
    availableStock: 0,
    incomingStock: 0,
    outgoingStock: 0,
    availablePct: 0,
    reservedPct: 0,
    damagedPct: 0,
    inventoryAccuracy: 0,
    stockAdded: 0,
    stockSold: 0,
    stockReturned: 0,
    stockDamaged: 0,
  });

  const API_BASE = "/api/inventory";
  const UPLOADS_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  // Shared query string so every request (GET/POST/PUT/DELETE) is scoped to this business
  const qs = useMemo(
    () => (businessId ? `?business_id=${encodeURIComponent(businessId)}` : ""),
    [businessId]
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showViewCategoryModal, setShowViewCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    status: "Active",
  });
  const [editedCategory, setEditedCategory] = useState("");
  const [showCategoryAdded, setShowCategoryAdded] = useState(false);
  const [showCategoryUpdated, setShowCategoryUpdated] = useState(false);
  const [showCategoryDeleted, setShowCategoryDeleted] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editedOrder, setEditedOrder] = useState<any>(null);
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showOrderUpdated, setShowOrderUpdated] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const totalNotifications = notifications.length;
  const todayNotifications = notifications.filter((notification) =>
    notification.time.toLowerCase().includes("ago") || notification.time.toLowerCase() === "today"
  ).length;

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
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
  const [showDeleteSupplierModal, setShowDeleteSupplierModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showSupplierUpdated, setShowSupplierUpdated] = useState(false);
  const [showSupplierDeleted, setShowSupplierDeleted] = useState(false);
  const [showSupplierAdded, setShowSupplierAdded] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    status: "Pending",
  });

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [editedWarehouse, setEditedWarehouse] = useState<any>(null);
  const [showViewWarehouseModal, setShowViewWarehouseModal] = useState(false);
  const [showEditWarehouseModal, setShowEditWarehouseModal] = useState(false);
  const [showDeleteWarehouseModal, setShowDeleteWarehouseModal] = useState(false);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showWarehouseUpdated, setShowWarehouseUpdated] = useState(false);
  const [showWarehouseDeleted, setShowWarehouseDeleted] = useState(false);
  const [showWarehouseAdded, setShowWarehouseAdded] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    manager: "",
    capacity: "",
    status: "Active",
  });

  // Generic "saving" flag so buttons can disable themselves mid-request
  const [isSaving, setIsSaving] = useState(false);

  // ================= AI Inventory Assistant chat state =================
  interface ChatMessage {
    role: "user" | "assistant";
    text: string;
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "👋 Hello! I'm your Inventory AI Assistant. Ask me anything about your stock, categories, or suppliers." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const warehouseTotals = useMemo(() => {
    const totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacityNum || 0), 0);
    const totalStock = warehouses.reduce((sum, w) => sum + (w.stockNum || 0), 0);
    const capacityUsedPct = totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;
    const availableSpacePct = totalCapacity > 0 ? 100 - capacityUsedPct : 0;
    return { totalCapacity, totalStock, capacityUsedPct, availableSpacePct };
  }, [warehouses]);

  // ================= Refetch helpers =================
  const refetchCategories = useCallback(async () => {
    const res = await fetch(`${API_BASE}/categories${qs}`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setCategories(data.categories.map((c: any) => c.name));
      setCategoryOptions(data.categories.map((c: any) => ({ id: c.id, name: c.name })));
    }
    return data;
  }, [qs]);

  const refetchProducts = useCallback(async () => {
    const res = await fetch(`${API_BASE}/products${qs}`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setProducts(
        data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          sku: p.sku,
          stock: p.stock,
          price: `₹${Number(p.price).toLocaleString("en-IN")}`,
          status: p.status,
          image: p.image_path || "",
          warehouseId: p.warehouse_id ?? null,
          warehouseName: p.warehouseName ?? null,
        }))
      );
    }
    return data;
  }, [qs]);

  const refetchStockSummary = useCallback(async () => {
    const res = await fetch(`${API_BASE}/stock-summary${qs}`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setInventory((prev) => ({
        ...prev,
        totalProducts: data.totals.totalProducts,
        totalCategories: data.totals.totalCategories,
        lowStock: data.totals.lowStockCount,
        inventoryValue: `₹${Number(data.totals.inventoryValue).toLocaleString("en-IN")}`,
        availableStock: Number(data.totals.availableStock) || 0,
        incomingStock: Number(data.totals.incomingStock) || 0,
        outgoingStock: Number(data.totals.outgoingStock) || 0,
        availablePct: Number(data.totals.availablePct) || 0,
        reservedPct: Number(data.totals.reservedPct) || 0,
        damagedPct: Number(data.totals.damagedPct) || 0,
        inventoryAccuracy: Number(data.totals.inventoryAccuracy) || 0,
        stockAdded: Number(data.totals.stockAdded) || 0,
        stockSold: Number(data.totals.stockSold) || 0,
        stockReturned: Number(data.totals.stockReturned) || 0,
        stockDamaged: Number(data.totals.stockDamaged) || 0,
      }));
    }
    return data;
  }, [qs]);

  const refetchSuppliers = useCallback(async () => {
    const res = await fetch(`${API_BASE}/suppliers${qs}`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setSuppliers(
        data.suppliers.map((s: any) => ({
          id: s.id,
          name: s.name,
          contact: s.contact_person,
          phone: s.phone,
          email: s.email,
          address: s.address,
          status: s.status,
        }))
      );
    }
    return data;
  }, [qs]);

  const refetchWarehouses = useCallback(async () => {
    const res = await fetch(`${API_BASE}/warehouses${qs}`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setWarehouses(
        data.warehouses.map((w: any) => {
          const capacityNum = Number(w.capacity) || 0;
          const stockNum = Number(w.current_stock) || 0;
          const occupancyPct =
            w.occupancyPct != null
              ? w.occupancyPct
              : capacityNum > 0
              ? Math.round((stockNum / capacityNum) * 100)
              : 0;

          return {
            id: w.id,
            name: w.name,
            location: w.location,
            manager: w.manager,
            capacityNum,
            stockNum,
            capacity: `${capacityNum.toLocaleString("en-IN")} Units`,
            stock: `${stockNum.toLocaleString("en-IN")} Units`,
            occupancy: `${occupancyPct}%`,
            status: w.status,
          };
        })
      );
    }
    return data;
  }, [qs]);

  const refetchPurchaseOrders = useCallback(async () => {
    const res = await fetch(`${API_BASE}/purchase-orders${qs}`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setPurchaseOrders(
        data.purchaseOrders.map((po: any) => ({
          id: po.po_number,
          supplier: po.supplier_name,
          product: po.product_name,
          amount: `₹${Number(po.amount).toLocaleString("en-IN")}`,
          date: po.expected_date ? new Date(po.expected_date).toLocaleDateString("en-IN") : "-",
          status: po.status,
        }))
      );

    }
    return data;
  }, [qs]);

  const refetchNotifications = useCallback(async () => {
    if (!businessId) return { success: false };
    const res = await fetch(
      `/api/messages?businessId=${encodeURIComponent(businessId)}&to=Inventory`,
      { credentials: "include" }
    );
    const data = await res.json();
    if (data.success) {
      setNotifications(
        data.messages.map((msg: any) => {
          const created = new Date(msg.created_at);
          const isToday = created.toDateString() === new Date().toDateString();
          return {
            id: msg.id,
            title: msg.subject,
            desc: msg.message,
            department: msg.from_department || "General",
            time: isToday ? "Today" : created.toLocaleDateString(),
            color: "bg-blue-500",
            isRead: false,
          };
        })
      );
    }
    return data;
  }, [businessId]);

  useEffect(() => {
    refetchCategories();
    refetchProducts();
    refetchStockSummary();
    refetchSuppliers();
    refetchWarehouses();
    refetchPurchaseOrders();
    refetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  useEffect(() => {
    if (activeMenu === "Notifications") {
      refetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, businessId]);

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Products", icon: Package },
    { name: "Categories", icon: Grid2X2 },
    { name: "Stock Management", icon: Boxes },
    { name: "Purchase Orders", icon: ShoppingCart },
    { name: "Suppliers", icon: Truck },
    { name: "Warehouses", icon: Warehouse },
    { name: "Reports", icon: BarChart3 },
    { name: "Messages", icon: MessageSquare },
    { name: "Notifications", icon: Bell },
    { name: "AI Inventory Assistant", icon: Brain },
  ];

  // ================= Mutation handlers =================

  const handleAddProduct = async () => {
    setIsSaving(true);
    try {
      const categoryId = categoryOptions.find((c) => c.name === newProduct.category)?.id;
      const res = await fetch(`${API_BASE}/products${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newProduct.name,
          categoryId,
          category: newProduct.category,
          sku: newProduct.sku,
          price: Number(String(newProduct.price).replace(/[^0-9.]/g, "")) || 0,
          stock: newProduct.stock,
          status: newProduct.status,
          imagePath: newProduct.image || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to add product");
        return;
      }

      await Promise.all([refetchProducts(), refetchStockSummary()]);

      setShowAddProductModal(false);
      setShowProductAdded(true);
      setTimeout(() => setShowProductAdded(false), 2000);
      setNewProduct({
        id: Date.now(),
        name: "",
        category: "",
        sku: "",
        price: "",
        stock: 0,
        status: "In Stock",
        image: "",
      });
    } catch (err: any) {
      alert("Error adding product: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editedProduct) return;
    setIsSaving(true);
    try {
      const categoryId = categoryOptions.find((c) => c.name === editedProduct.category)?.id;
      const res = await fetch(`${API_BASE}/products/${editedProduct.id}${qs}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editedProduct.name,
          categoryId,
          category: editedProduct.category,
          price: Number(String(editedProduct.price).replace(/[^0-9.]/g, "")) || 0,
          stock: editedProduct.stock,
          imagePath: editedProduct.image || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update product");
        return;
      }

      await Promise.all([refetchProducts(), refetchStockSummary()]);
      setShowEditModal(false);
    } catch (err: any) {
      alert("Error updating product: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/products/${selectedProduct.id}${qs}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to delete product");
        return;
      }

      await Promise.all([refetchProducts(), refetchStockSummary()]);

      setShowDeleteModal(false);
      setSelectedProduct(null);
      setShowProductDeleted(true);
      setTimeout(() => setShowProductDeleted(false), 2000);
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Uploads a single product photo file and returns the server-relative path
  // (e.g. "/uploads/products/169...-abc.jpg") to store on the product record.
  const uploadProductImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await fetch(`${API_BASE}/products/upload-image${qs}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to upload image");
        return null;
      }
      return data.imagePath;
    } catch (err: any) {
      alert("Error uploading image: " + err.message);
      return null;
    }
  };

  const handleAddProductImageSelect = async (file: File | null) => {
    if (!file) return;
    setProductImageUploading(true);
    try {
      const imagePath = await uploadProductImage(file);
      if (imagePath) setNewProduct((prev) => ({ ...prev, image: imagePath }));
    } finally {
      setProductImageUploading(false);
    }
  };

  const handleEditProductImageSelect = async (file: File | null) => {
    if (!file || !editedProduct) return;
    setEditProductImageUploading(true);
    try {
      const imagePath = await uploadProductImage(file);
      if (imagePath) setEditedProduct({ ...editedProduct, image: imagePath });
    } finally {
      setEditProductImageUploading(false);
    }
  };

  // Reassigns a product's warehouse directly from the Stock Management table.
  // Sends the product's existing fields along with the new warehouseId so the
  // backend's COALESCE(?, existing) update doesn't receive undefined params.
  const handleUpdateProductWarehouse = async (product: Product, warehouseId: number | null) => {
    setIsSaving(true);
    try {
      const categoryId = categoryOptions.find((c) => c.name === product.category)?.id;
      const res = await fetch(`${API_BASE}/products/${product.id}${qs}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: product.name,
          categoryId,
          price: Number(String(product.price).replace(/[^0-9.]/g, "")) || 0,
          stock: product.stock,
          warehouseId: warehouseId,
          imagePath: product.image || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update warehouse assignment");
        return;
      }

      await Promise.all([refetchProducts(), refetchWarehouses()]);
    } catch (err: any) {
      alert("Error updating warehouse assignment: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/categories${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          status: newCategory.status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to add category");
        return;
      }

      await Promise.all([refetchCategories(), refetchStockSummary()]);

      setShowAddCategoryModal(false);
      setShowCategoryAdded(true);
      setTimeout(() => setShowCategoryAdded(false), 2000);
      setNewCategory({ name: "", description: "", status: "Active" });
    } catch (err: any) {
      alert("Error adding category: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    setIsSaving(true);
    try {
      const categoryId =
        selectedCategoryId ?? categoryOptions.find((c) => c.name === selectedCategory)?.id;

      const res = await fetch(`${API_BASE}/categories/${categoryId}${qs}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editedCategory }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update category");
        return;
      }

      await Promise.all([refetchCategories(), refetchProducts()]);

      setShowEditCategoryModal(false);
      setShowCategoryUpdated(true);
      setTimeout(() => setShowCategoryUpdated(false), 2000);
    } catch (err: any) {
      alert("Error updating category: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setIsSaving(true);
    try {
      const categoryId =
        selectedCategoryId ?? categoryOptions.find((c) => c.name === selectedCategory)?.id;

      const res = await fetch(`${API_BASE}/categories/${categoryId}${qs}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to delete category");
        return;
      }

      await Promise.all([refetchCategories(), refetchStockSummary()]);

      setShowDeleteCategoryModal(false);
      setShowCategoryDeleted(true);
      setTimeout(() => setShowCategoryDeleted(false), 2000);
    } catch (err: any) {
      alert("Error deleting category: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

     const handleCreatePO = async () => {
    setIsSaving(true);
    try {
      const supplierId = suppliers.find((s) => s.name === newPO.supplier)?.id;
      const res = await fetch(`${API_BASE}/purchase-orders${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          poNumber: newPO.id,
          supplierId,
          product: newPO.product,
          amount: Number(String(newPO.amount).replace(/[^0-9.]/g, "")) || 0,
          expectedDate: newPO.date,
          status: newPO.status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to create purchase order");
        return;
      }

      await Promise.all([refetchPurchaseOrders(), refetchStockSummary()]);

      setShowCreatePOModal(false);
      setShowPOCreated(true);
      setTimeout(() => setShowPOCreated(false), 2000);
      setNewPO({ id: "", supplier: "", product: "", amount: "", date: "", status: "Pending" });
    } catch (err: any) {
      alert("Error creating purchase order: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePO = async () => {
    if (!editedOrder) return;
    setIsSaving(true);
    try {
      const supplierId = suppliers.find((s) => s.name === editedOrder.supplier)?.id;
      const res = await fetch(`${API_BASE}/purchase-orders/${editedOrder.id}${qs}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          supplierId,
          product: editedOrder.product,
          amount: Number(String(editedOrder.amount).replace(/[^0-9.]/g, "")) || 0,
          expectedDate: editedOrder.date,
          status: editedOrder.status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update purchase order");
        return;
      }

      await Promise.all([refetchPurchaseOrders(), refetchStockSummary()]);

      setShowEditOrderModal(false);
      setShowOrderUpdated(true);
      setTimeout(() => setShowOrderUpdated(false), 2000);
    } catch (err: any) {
      alert("Error updating purchase order: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSupplier = async () => {
    if (!editedSupplier) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers/${editedSupplier.id}${qs}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editedSupplier.name,
          contactPerson: editedSupplier.contact,
          phone: editedSupplier.phone,
          email: editedSupplier.email,
          address: editedSupplier.address,
          status: editedSupplier.status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update supplier");
        return;
      }

      await refetchSuppliers();

      setShowEditSupplierModal(false);
      setShowSupplierUpdated(true);
      setTimeout(() => setShowSupplierUpdated(false), 2000);
    } catch (err: any) {
      alert("Error updating supplier: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) {
      alert("Supplier name is required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newSupplier.name,
          contactPerson: newSupplier.contactPerson,
          phone: newSupplier.phone,
          email: newSupplier.email,
          address: newSupplier.address,
          status: newSupplier.status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to add supplier");
        return;
      }

      await refetchSuppliers();

      setShowAddSupplierModal(false);
      setShowSupplierAdded(true);
      setTimeout(() => setShowSupplierAdded(false), 2000);
      setNewSupplier({ name: "", contactPerson: "", phone: "", email: "", address: "", status: "Pending" });
    } catch (err: any) {
      alert("Error adding supplier: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers/${selectedSupplier.id}${qs}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to delete supplier");
        return;
      }

      await refetchSuppliers();

      setShowDeleteSupplierModal(false);
      setShowSupplierDeleted(true);
      setTimeout(() => setShowSupplierDeleted(false), 2000);
    } catch (err: any) {
      alert("Error deleting supplier: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateWarehouse = async () => {
    if (!editedWarehouse) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/warehouses/${editedWarehouse.id}${qs}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editedWarehouse.name,
          location: editedWarehouse.location,
          manager: editedWarehouse.manager,
          capacity: Number(String(editedWarehouse.capacity).replace(/[^0-9.]/g, "")) || 0,
          currentStock: Number(String(editedWarehouse.stock).replace(/[^0-9.]/g, "")) || 0,
          status: editedWarehouse.status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update warehouse");
        return;
      }

      await Promise.all([refetchWarehouses(), refetchStockSummary()]);

      setShowEditWarehouseModal(false);
      setShowWarehouseUpdated(true);
      setTimeout(() => setShowWarehouseUpdated(false), 2000);
    } catch (err: any) {
      alert("Error updating warehouse: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddWarehouse = async () => {
    if (!newWarehouse.name) {
      alert("Warehouse name is required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/warehouses${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newWarehouse.name,
          location: newWarehouse.location,
          manager: newWarehouse.manager,
          capacity: Number(String(newWarehouse.capacity).replace(/[^0-9.]/g, "")) || 0,
          status: newWarehouse.status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to add warehouse");
        return;
      }

      await Promise.all([refetchWarehouses(), refetchStockSummary()]);

      setShowAddWarehouseModal(false);
      setShowWarehouseAdded(true);
      setTimeout(() => setShowWarehouseAdded(false), 2000);
      setNewWarehouse({ name: "", location: "", manager: "", capacity: "", status: "Active" });
    } catch (err: any) {
      alert("Error adding warehouse: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWarehouse = async () => {
    if (!selectedWarehouse) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/warehouses/${selectedWarehouse.id}${qs}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to delete warehouse");
        return;
      }

      await Promise.all([refetchWarehouses(), refetchStockSummary()]);

      setShowDeleteWarehouseModal(false);
      setShowWarehouseDeleted(true);
      setTimeout(() => setShowWarehouseDeleted(false), 2000);
    } catch (err: any) {
      alert("Error deleting warehouse: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Builds a CSV file in-browser and triggers a download — no backend call needed.
  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

    const handleExportReport = () => {
    downloadCSV(`inventory-report-${Date.now()}.csv`, [
      ["Metric", "Value"],
      ["Total Products", inventory.totalProducts],
      ["Total Categories", inventory.totalCategories],
      ["Low Stock", inventory.lowStock],
      ["Inventory Value", inventory.inventoryValue],      ["Inventory Accuracy", `${inventory.inventoryAccuracy}%`],
    ]);
  };

  const handleDownloadReport = (reportName: string) => {
    switch (reportName) {
           case "Inventory Value Report":
        downloadCSV(`inventory-value-report-${Date.now()}.csv`, [
          ["Product", "SKU", "Category", "Stock", "Price"],
          ...products.map((p) => [p.name, p.sku, p.category, p.stock, p.price]),        ]);
        break;
      case "Stock Movement Report":
        downloadCSV(`stock-movement-report-${Date.now()}.csv`, [
          ["Type", "Quantity"],
          ["Added", inventory.stockAdded],
          ["Sold", inventory.stockSold],
          ["Returned", inventory.stockReturned],
          ["Damaged", inventory.stockDamaged],
        ]);
        break;
      case "Low Stock Report":
        downloadCSV(`low-stock-report-${Date.now()}.csv`, [
          ["Product", "SKU", "Stock", "Status"],
          ...products.filter((p) => p.status === "Low Stock").map((p) => [p.name, p.sku, p.stock, p.status]),
        ]);
        break;
        case "Purchase Order Report":
        downloadCSV(`purchase-order-report-${Date.now()}.csv`, [
          ["PO Number", "Supplier", "Product", "Amount", "Expected Date", "Status"],
          ...purchaseOrders.map((po) => [po.id, po.supplier, po.product, po.amount, po.date, po.status]),        ]);
        break;
      case "Warehouse Report":
        downloadCSV(`warehouse-report-${Date.now()}.csv`, [
          ["Warehouse", "Manager", "Location", "Capacity", "Occupancy", "Status"],
          ...warehouses.map((w) => [w.name, w.manager, w.location, w.capacity, w.occupancy, w.status]),
        ]);
        break;
      default:
        downloadCSV(`${reportName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.csv`, [
          ["Report"],
          [reportName],
        ]);
    }
  };

  const handleSendChatMessage = async (messageOverride?: string) => {    const messageText = (messageOverride ?? chatInput).trim();
    if (!messageText || aiLoading) return;

    const userMessage: ChatMessage = { role: "user", text: messageText };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setAiLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai-assistant${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          question: messageText,
          history: chatMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.message || "Sorry, I couldn't process that request." },
        ]);
        return;
      }

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer ?? data.reply ?? "I didn't get a response back." },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong reaching the assistant: " + err.message },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

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
              <h2 className="font-bold text-lg text-gray-900">{company.name}</h2>
              <p className="text-sm text-gray-500">Inventory Workspace</p>
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
                  <span className="font-medium">{item.name}</span>
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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage inventory, stock and warehouse operations.</p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">{company.name}</p>
              <p className="text-sm text-gray-500">Inventory Management</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Dashboard Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Products</p>
                  <h2 className="text-3xl font-bold mt-2">{inventory.totalProducts}</h2>
                </div>
                <Package className="text-blue-600" size={30} />
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Categories</p>
                  <h2 className="text-3xl font-bold mt-2">{inventory.totalCategories}</h2>
                </div>
                <Grid2X2 className="text-green-600" size={30} />
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Low Stock</p>
                  <h2 className="text-3xl font-bold mt-2 text-orange-600">{inventory.lowStock}</h2>
                </div>
                <AlertTriangle className="text-orange-500" size={30} />
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Inventory Value</p>
                  <h2 className="text-2xl font-bold mt-2">{inventory.inventoryValue}</h2>
                </div>
                <IndianRupee className="text-emerald-600" size={30} />
              </div>
            </motion.div>
          </div>

          {/* ================= Dashboard ================= */}

          {activeMenu === "Dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Inventory Overview</h2>
                    <TrendingUp className="text-blue-600" />
                  </div>

                  <div className="space-y-5">
                    {[
                      {
                        title: "Available Stock",
                        value: `${inventory.availablePct}%`,
                        width: `${inventory.availablePct}%`,
                        color: "bg-blue-600",
                      },
                      {
                        title: "Reserved Stock",
                        value: `${inventory.reservedPct}%`,
                        width: `${inventory.reservedPct}%`,
                        color: "bg-yellow-500",
                      },
                      {
                        title: "Damaged Stock",
                        value: `${inventory.damagedPct}%`,
                        width: `${inventory.damagedPct}%`,
                        color: "bg-red-500",
                      },
                    ].map((item) => (
                      <div key={item.title}>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">{item.title}</span>
                          <span className="font-medium">{item.value}</span>
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

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
                    <AlertTriangle className="text-orange-500" />
                  </div>

                  <div className="space-y-4">
                    {inventory.categories.slice(0, 5).map((item, index) => (
                      <div key={item} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <p className="font-medium">{item}</p>
                          <p className="text-sm text-gray-500">SKU-10{index + 1}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">Low</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-6">Recent Inventory Activity</h2>

                  <div className="space-y-5">
                    {[
                      "Stock Updated",
                      "Purchase Order Received",
                      "Warehouse Transfer",
                      "New Product Added",
                      "Low Stock Notification",
                    ].map((activity) => (
                      <div key={activity} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{activity}</p>
                          <p className="text-sm text-gray-500">Today</p>
                        </div>
                        <ArrowUpRight size={18} className="text-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Brain className="text-blue-600" />
                    <h2 className="text-xl font-semibold">AI Inventory Insights</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border">
                      📦 Demand for <strong>{inventory.categories[0]}</strong> is expected to increase next week.
                    </div>
                    <div className="bg-white rounded-xl p-4 border">⚠ Consider reordering products with low stock.</div>
                    <div className="bg-white rounded-xl p-4 border">
                      📈 Inventory turnover has increased by <strong>12%</strong> this month.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PRODUCTS ================= */}

          {activeMenu === "Products" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Products</h2>
                    <p className="text-gray-500 mt-1">Manage all products for {company.name}</p>
                  </div>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="px-6 py-4">Photo</th>
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
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                          No products yet. Click "+ Add Product" to create your first one.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="border-t hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            {product.image ? (
                              <img
                                src={`${UPLOADS_BASE}${product.image}`}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg border border-dashed flex items-center justify-center text-gray-300">
                                <Package size={18} />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium">{product.name}</td>
                          <td className="px-6 py-4">{product.category}</td>
                          <td className="px-6 py-4">{product.sku}</td>
                          <td className="px-6 py-4">{product.stock}</td>
                          <td className="px-6 py-4">{product.price}</td>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ================= CATEGORIES ================= */}

          {activeMenu === "Categories" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Categories</h2>
                    <p className="text-gray-500 mt-1">Product categories available for {company.name}</p>
                  </div>
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                  >
                    + Add Category
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {categories.length === 0 ? (
                  <div className="md:col-span-2 xl:col-span-4 bg-white border border-dashed rounded-2xl p-8 text-center text-gray-500">
                    No categories yet. Click "+ Add Category" to create one.
                  </div>
                ) : (
                  categories.map((category) => (
                    <motion.div
                      key={category}
                      whileHover={{ y: -4 }}
                      className="bg-white border rounded-2xl shadow-sm p-6"
                    >
                      <div className="flex justify-between items-center mb-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Grid2X2 className="text-blue-600" size={24} />
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Active</span>
                      </div>

                      <h3 className="font-semibold text-lg">{category}</h3>
                      <p className="text-gray-500 text-sm mt-2">
                        {products.filter((p) => p.category === category).length} Products
                      </p>

                      <div className="flex gap-2 mt-6">
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedCategoryId(
                              categoryOptions.find((c) => c.name === category)?.id ?? null
                            );
                            setShowViewCategoryModal(true);
                          }}
                          className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          View
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedCategoryId(
                              categoryOptions.find((c) => c.name === category)?.id ?? null
                            );
                            setEditedCategory(category);
                            setShowEditCategoryModal(true);
                          }}
                          className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedCategoryId(
                              categoryOptions.find((c) => c.name === category)?.id ?? null
                            );
                            setShowDeleteCategoryModal(true);
                          }}
                          className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ================= STOCK MANAGEMENT ================= */}

          {activeMenu === "Stock Management" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Available Stock</p>
                  <h2 className="text-3xl font-bold mt-2">{inventory.availableStock.toLocaleString("en-IN")}</h2>
                  <p className="text-green-600 text-sm mt-2">Across all products</p>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Incoming Stock</p>
                  <h2 className="text-3xl font-bold mt-2">{inventory.incomingStock.toLocaleString("en-IN")}</h2>
                  <p className="text-blue-600 text-sm mt-2">From pending purchase orders</p>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Outgoing Stock</p>
                  <h2 className="text-3xl font-bold mt-2">{inventory.outgoingStock.toLocaleString("en-IN")}</h2>
                  <p className="text-orange-600 text-sm mt-2">Reserved for delivery</p>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                  <h2 className="text-3xl font-bold mt-2">{inventory.lowStock}</h2>
                  <p className="text-red-600 text-sm mt-2">Requires replenishment</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b">
                  <h2 className="text-xl font-semibold">Current Stock</h2>
                </div>

                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4">Product</th>
                      <th className="text-left px-6 py-4">SKU</th>
                      <th className="text-left px-6 py-4">Available</th>
                      <th className="text-left px-6 py-4">Reserved</th>
                      <th className="text-left px-6 py-4">Warehouse</th>
                      <th className="text-left px-6 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{product.name}</td>
                        <td className="px-6 py-4">{product.sku}</td>
                        <td className="px-6 py-4">{product.stock}</td>
                        <td className="px-6 py-4">0</td>
                        <td className="px-6 py-4">
                          <select
                            value={product.warehouseId ?? ""}
                            onChange={(e) =>
                              handleUpdateProductWarehouse(
                                product,
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            disabled={isSaving}
                            className="border rounded-lg px-2 py-1 text-sm bg-white"
                          >
                            <option value="">Unassigned</option>
                            {warehouses.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>
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

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-5">Stock Movement</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Products Added</span>
                      <span className="font-semibold text-green-600">
                        +{inventory.stockAdded.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products Sold</span>
                      <span className="font-semibold text-blue-600">
                        -{inventory.stockSold.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Returned</span>
                      <span className="font-semibold text-orange-600">
                        +{inventory.stockReturned.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Damaged</span>
                      <span className="font-semibold text-red-600">
                        -{inventory.stockDamaged.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-5">AI Stock Suggestions</h2>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border">
                      📦 Restock <strong>{inventory.categories[0]}</strong> before next week.
                    </div>
                    <div className="bg-white rounded-xl p-4 border">📈 Sales trend indicates higher demand this month.</div>
                    <div className="bg-white rounded-xl p-4 border">💰 Maintain at least 20 units for fast-moving products.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PURCHASE ORDERS ================= */}

          {activeMenu === "Purchase Orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Purchase Orders</h2>
                    <p className="text-gray-500 mt-1">Manage supplier purchase orders for {company.name}</p>
                  </div>

                  <button
                    onClick={() => setShowCreatePOModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                  >
                    + Create PO
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Pending</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {purchaseOrders.filter((o) => o.status === "Pending").length}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Approved</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {purchaseOrders.filter((o) => o.status === "Approved").length}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Received</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {purchaseOrders.filter((o) => o.status === "Received").length}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Cancelled</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {purchaseOrders.filter((o) => o.status === "Cancelled").length}
                  </h2>
                </div>
              </div>

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
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{order.id}</td>
                        <td className="px-6 py-4">{order.supplier}</td>
                        <td className="px-6 py-4">{order.product}</td>
                        <td className="px-6 py-4">{order.amount}</td>
                        <td className="px-6 py-4">{order.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium
                              ${
                                order.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : order.status === "Approved"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Suppliers</h2>
                    <p className="text-gray-500 mt-1">Manage suppliers for {company.name}</p>
                  </div>

                  <button
                    onClick={() => setShowAddSupplierModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                  >
                    + Add Supplier
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Total Suppliers</p>
                  <h2 className="text-3xl font-bold mt-2">{suppliers.length}</h2>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Active</p>
                  <h2 className="text-3xl font-bold mt-2 text-green-600">
                    {suppliers.filter((s) => s.status === "Active").length}
                  </h2>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Pending Approval</p>
                  <h2 className="text-3xl font-bold mt-2 text-orange-600">
                    {suppliers.filter((s) => s.status === "Pending").length}
                  </h2>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Inactive</p>
                  <h2 className="text-3xl font-bold mt-2 text-red-600">
                    {suppliers.filter((s) => s.status === "Inactive").length}
                  </h2>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4">Supplier</th>
                      <th className="text-left px-6 py-4">Contact</th>
                      <th className="text-left px-6 py-4">Phone</th>
                      <th className="text-left px-6 py-4">Status</th>
                      <th className="text-center px-6 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id ?? supplier.name} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{supplier.name}</td>
                        <td className="px-6 py-4">{supplier.contact}</td>
                        <td className="px-6 py-4">{supplier.phone}</td>
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

                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowDeleteSupplierModal(true);
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

          {/* ================= WAREHOUSES ================= */}

          {activeMenu === "Warehouses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Warehouses</h2>
                    <p className="text-gray-500 mt-1">Warehouse management for {company.name}</p>
                  </div>

                  <button
                    onClick={() => setShowAddWarehouseModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                  >
                    + Add Warehouse
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Warehouses</p>
                  <h2 className="text-3xl font-bold mt-2">{warehouses.length}</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Capacity Used</p>
                  <h2 className="text-3xl font-bold mt-2">{warehouseTotals.capacityUsedPct}%</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Available Space</p>
                  <h2 className="text-3xl font-bold mt-2">{warehouseTotals.availableSpacePct}%</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-sm text-gray-500">Total Stock Value</p>
                  <h2 className="text-2xl font-bold mt-2">{inventory.inventoryValue}</h2>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4">Warehouse</th>
                      <th className="text-left px-6 py-4">Manager</th>
                      <th className="text-left px-6 py-4">Location</th>
                      <th className="text-left px-6 py-4">Capacity</th>
                      <th className="text-left px-6 py-4">Occupancy</th>
                      <th className="text-left px-6 py-4">Status</th>
                      <th className="text-center px-6 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {warehouses.map((warehouse) => (
                      <tr key={warehouse.id ?? warehouse.name} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{warehouse.name}</td>
                        <td className="px-6 py-4">{warehouse.manager}</td>
                        <td className="px-6 py-4">{warehouse.location}</td>
                        <td className="px-6 py-4">{warehouse.capacity}</td>
                        <td className="px-6 py-4">{warehouse.occupancy}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              warehouse.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {warehouse.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedWarehouse(warehouse);
                                setShowViewWarehouseModal(true);
                              }}
                              className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              View
                            </button>

                            <button
                              onClick={() => {
                                setSelectedWarehouse(warehouse);
                                setEditedWarehouse({ ...warehouse });
                                setShowEditWarehouseModal(true);
                              }}
                              className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => {
                                setSelectedWarehouse(warehouse);
                                setShowDeleteWarehouseModal(true);
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

          {/* ================= REPORTS ================= */}

          {activeMenu === "Reports" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Inventory Reports</h2>
                    <p className="text-gray-500 mt-1">Inventory analytics for {company.name}</p>
                  </div>

                  <button
                    onClick={handleExportReport}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Export Report
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Inventory Value</p>
                  <h2 className="text-2xl font-bold mt-2">{inventory.inventoryValue}</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Total Products</p>
                  <h2 className="text-3xl font-bold mt-2">{inventory.totalProducts}</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Low Stock</p>
                  <h2 className="text-3xl font-bold mt-2 text-orange-600">{inventory.lowStock}</h2>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <p className="text-gray-500 text-sm">Inventory Accuracy</p>
                  <h2 className="text-3xl font-bold mt-2 text-green-600">{inventory.inventoryAccuracy}%</h2>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4">Report</th>
                      <th className="text-left px-6 py-4">Generated On</th>
                      <th className="text-left px-6 py-4">Status</th>
                      <th className="text-center px-6 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      "Inventory Value Report",
                      "Stock Movement Report",
                      "Low Stock Report",
                      "Purchase Order Report",
                      "Warehouse Report",
                    ].map((report) => (
                      <tr key={report} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{report}</td>
                        <td className="px-6 py-4">13 Jul 2026</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">Ready</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                                                        <button
                              onClick={() => handleDownloadReport(report)}
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

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-5">Report Insights</h2>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl border p-4">
                    📈 Inventory value has increased by <strong>11%</strong> compared to last month.
                  </div>
                  <div className="bg-white rounded-xl border p-4">
                    📦 Fast-moving products belong to <strong>{inventory.categories[0]}</strong>.
                  </div>
                  <div className="bg-white rounded-xl border p-4">⚠ {inventory.lowStock} products require restocking.</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= AI INVENTORY ASSISTANT ================= */}

          {activeMenu === "AI Inventory Assistant" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Brain className="text-white" size={30} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold">AI Inventory Assistant</h2>
                    <p className="text-gray-500">Smart inventory recommendations powered by AI.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-xl p-4 ml-20"
                          : "bg-gray-100 rounded-xl p-4 mr-20 whitespace-pre-wrap"
                      }
                    >
                      {msg.text}
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="bg-gray-100 rounded-xl p-4 mr-20 text-gray-500 italic">Thinking...</div>
                  )}
                </div>


              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {["Restock Low Inventory", "Predict Demand", "Best Selling Products", "Inventory Summary"].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => handleSendChatMessage(item)}
                      disabled={aiLoading}
                      className="bg-white border rounded-xl p-5 hover:border-blue-600 hover:bg-blue-50 transition disabled:opacity-60"
                    >
                      <Brain className="text-blue-600 mb-3" size={24} />
                      <p className="font-medium">{item}</p>
                    </button>
                  )
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-5">AI Recommendations</h2>

                <div className="space-y-4">
                  <div className="bg-white border rounded-xl p-4">
                    📈 Demand for <strong>{inventory.categories[0]}</strong> is expected to increase next week.
                  </div>

                  <div className="bg-white border rounded-xl p-4">
                    📦 Consider ordering <strong>150 more units</strong> to avoid stock shortages.
                  </div>

                  <div className="bg-white border rounded-xl p-4">
                    💰 Estimated inventory savings: <strong>₹42,000</strong> this month.
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Product Details</h2>
                <button onClick={() => setShowViewModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  {selectedProduct.image ? (
                    <img
                      src={`${UPLOADS_BASE}${selectedProduct.image}`}
                      alt={selectedProduct.name}
                      className="w-32 h-32 object-cover rounded-2xl border"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl border border-dashed flex items-center justify-center text-gray-400 text-sm">
                      No photo
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500">Product Name</p>
                    <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  </div>

                  <div>
                    <p className="text-gray-500">Category</p>
                    <h3 className="font-semibold text-lg">{selectedProduct.category}</h3>
                  </div>

                  <div>
                    <p className="text-gray-500">SKU</p>
                    <h3 className="font-semibold">{selectedProduct.sku}</h3>
                  </div>

                  <div>
                    <p className="text-gray-500">Price</p>
                    <h3 className="font-semibold">{selectedProduct.price}</h3>
                  </div>

                  <div>
                    <p className="text-gray-500">Stock</p>
                    <h3 className="font-semibold">{selectedProduct.stock}</h3>
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
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">
                    This is one of the products available in {` ${company.name}`} inventory.
                  </p>
                </div>
              </div>

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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <button onClick={() => setShowEditModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">Product Name</label>
                  <input
                    value={editedProduct.name}
                    onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                    className="w-full mt-2 border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <input
                    value={editedProduct.category}
                    onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
                    className="w-full mt-2 border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Price</label>
                  <input
                    value={editedProduct.price}
                    onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
                    className="w-full mt-2 border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Stock</label>
                  <input
                    type="number"
                    value={editedProduct.stock}
                    onChange={(e) => setEditedProduct({ ...editedProduct, stock: Number(e.target.value) })}
                    className="w-full mt-2 border rounded-xl px-4 py-3"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Product Photo</label>
                  <div className="flex items-center gap-4 mt-2">
                    {editedProduct.image ? (
                      <img
                        src={`${UPLOADS_BASE}${editedProduct.image}`}
                        alt="Product preview"
                        className="w-20 h-20 object-cover rounded-xl border"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-dashed flex items-center justify-center text-gray-400 text-xs text-center px-1">
                        No photo
                      </div>
                    )}

                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">
                      {editProductImageUploading ? "Uploading..." : "Take / Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        disabled={editProductImageUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          handleEditProductImageSelect(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowEditModal(false)} className="px-6 py-2 rounded-xl border">
                  Cancel
                </button>

                <button
                  onClick={handleUpdateProduct}
                  disabled={isSaving || editProductImageUploading}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Updating..." : "Update Product"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= ADD PRODUCT MODAL ================= */}

        {showAddProductModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add Product</h2>
                <button onClick={() => setShowAddProductModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Price</label>
                  <input
                    type="text"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={newProduct.status}
                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as Product["status"] })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  >
                    <option>In Stock</option>
                    <option>Low Stock</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Product Photo</label>
                  <div className="flex items-center gap-4 mt-2">
                    {newProduct.image ? (
                      <img
                        src={`${UPLOADS_BASE}${newProduct.image}`}
                        alt="Product preview"
                        className="w-20 h-20 object-cover rounded-xl border"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-dashed flex items-center justify-center text-gray-400 text-xs text-center px-1">
                        No photo
                      </div>
                    )}

                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">
                      {productImageUploading ? "Uploading..." : "Take / Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        disabled={productImageUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          handleAddProductImageSelect(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowAddProductModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleAddProduct}
                  disabled={isSaving || productImageUploading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Adding..." : "Add Product"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= DELETE PRODUCT MODAL ================= */}

        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-red-600 text-white px-6 py-5">
                <h2 className="text-xl font-bold">Delete Product</h2>
              </div>

              <div className="p-6">
                <p className="text-gray-700 text-lg">
                  Are you sure you want to delete <span className="font-bold"> {selectedProduct.name}</span>?
                </p>
                <p className="text-gray-500 mt-3">This action cannot be undone.</p>
              </div>

              <div className="border-t p-5 flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleDeleteProduct}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl"
                >
                  {isSaving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= ADD CATEGORY MODAL ================= */}

        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add Category</h2>
                <button onClick={() => setShowAddCategoryModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="text-sm font-medium">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full mt-2 border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={4}
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full mt-2 border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={newCategory.status}
                    onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                    className="w-full mt-2 border rounded-xl px-4 py-3"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowAddCategoryModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleAddCategory}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Creating..." : "Create Category"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= VIEW CATEGORY MODAL ================= */}

        {showViewCategoryModal && selectedCategory && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Category Details</h2>
                <button onClick={() => setShowViewCategoryModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <p className="text-gray-500">Category Name</p>
                  <h3 className="text-xl font-semibold">{selectedCategory}</h3>
                </div>

                <div>
                  <p className="text-gray-500">Company</p>
                  <h3 className="font-semibold">{company.name}</h3>
                </div>

                <div>
                  <p className="text-gray-500">Status</p>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Active</span>
                </div>

                <div>
                  <p className="text-gray-500">Description</p>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit Category</h2>
                <button onClick={() => setShowEditCategoryModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8">
                <label className="text-sm font-medium">Category Name</label>
                <input
                  type="text"
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="w-full mt-2 border rounded-xl px-4 py-3"
                />
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowEditCategoryModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleUpdateCategory}
                  disabled={isSaving}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Updating..." : "Update Category"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= DELETE CATEGORY MODAL ================= */}

        {showDeleteCategoryModal && selectedCategory && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-red-600 text-white px-6 py-5">
                <h2 className="text-xl font-bold">Delete Category</h2>
              </div>

              <div className="p-6">
                <p className="text-gray-700 text-lg">
                  Are you sure you want to delete <span className="font-bold">{selectedCategory}</span>?
                </p>
                <p className="text-gray-500 mt-3">
                  This will only succeed if no products still belong to this category.
                </p>
              </div>

              <div className="border-t p-5 flex justify-end gap-3">
                <button onClick={() => setShowDeleteCategoryModal(false)} className="px-5 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleDeleteCategory}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl"
                >
                  {isSaving ? "Deleting..." : "Delete"}
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
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Purchase Order Details</h2>
                <button onClick={() => setShowViewOrderModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

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
                        : selectedOrder.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

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

        {/* ================= EDIT PURCHASE ORDER MODAL ================= */}

        {showEditOrderModal && editedOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit Purchase Order</h2>
                <button onClick={() => setShowEditOrderModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Supplier</label>
                  <input
                    type="text"
                    value={editedOrder.supplier}
                    onChange={(e) => setEditedOrder({ ...editedOrder, supplier: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Product</label>
                  <input
                    type="text"
                    value={editedOrder.product}
                    onChange={(e) => setEditedOrder({ ...editedOrder, product: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Amount</label>
                  <input
                    type="text"
                    value={editedOrder.amount}
                    onChange={(e) => setEditedOrder({ ...editedOrder, amount: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Expected Date</label>
                  <input
                    type="text"
                    value={editedOrder.date}
                    onChange={(e) => setEditedOrder({ ...editedOrder, date: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 font-medium">Status</label>
                  <select
                    value={editedOrder.status}
                    onChange={(e) => setEditedOrder({ ...editedOrder, status: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Received</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowEditOrderModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleUpdatePO}
                  disabled={isSaving}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Updating..." : "Update Purchase Order"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= CREATE PURCHASE ORDER MODAL ================= */}

        {showCreatePOModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Create Purchase Order</h2>
                <button onClick={() => setShowCreatePOModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <label className="font-medium">PO Number</label>
                  <input
                    type="text"
                    value={newPO.id}
                    onChange={(e) => setNewPO({ ...newPO, id: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                                <div>
                  <label className="font-medium">Supplier</label>
                  <select
                    value={newPO.supplier}
                    onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium">Product</label>
                  <select
                    value={newPO.product}
                    onChange={(e) => setNewPO({ ...newPO, product: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium">Amount</label>
                  <input
                    type="text"
                    value={newPO.amount}
                    onChange={(e) => setNewPO({ ...newPO, amount: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Expected Date</label>
                  <input
                    type="date"
                    value={newPO.date}
                    onChange={(e) => setNewPO({ ...newPO, date: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Status</label>
                  <select
                    value={newPO.status}
                    onChange={(e) => setNewPO({ ...newPO, status: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  >
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Received</option>
                  </select>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowCreatePOModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleCreatePO}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Creating..." : "Create Purchase Order"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= ADD SUPPLIER MODAL ================= */}

        {showAddSupplierModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add Supplier</h2>
                <button onClick={() => setShowAddSupplierModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Supplier Name</label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Contact Person</label>
                  <input
                    type="text"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    type="text"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <input
                    type="text"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={newSupplier.status}
                    onChange={(e) => setNewSupplier({ ...newSupplier, status: e.target.value })}
                    className="w-full border rounded-xl mt-2 px-4 py-3"
                  >
                    <option>Pending</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowAddSupplierModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleAddSupplier}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Adding..." : "Add Supplier"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= VIEW SUPPLIER MODAL ================= */}

        {showViewSupplierModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Supplier Details</h2>
                <button onClick={() => setShowViewSupplierModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

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
              <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit Supplier</h2>
                <button onClick={() => setShowEditSupplierModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <label className="font-medium">Supplier Name</label>
                  <input
                    type="text"
                    value={editedSupplier.name}
                    onChange={(e) => setEditedSupplier({ ...editedSupplier, name: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Contact Person</label>
                  <input
                    type="text"
                    value={editedSupplier.contact}
                    onChange={(e) => setEditedSupplier({ ...editedSupplier, contact: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Phone</label>
                  <input
                    type="text"
                    value={editedSupplier.phone}
                    onChange={(e) => setEditedSupplier({ ...editedSupplier, phone: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Email</label>
                  <input
                    type="email"
                    value={editedSupplier.email}
                    onChange={(e) => setEditedSupplier({ ...editedSupplier, email: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Address</label>
                  <input
                    type="text"
                    value={editedSupplier.address}
                    onChange={(e) => setEditedSupplier({ ...editedSupplier, address: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Status</label>
                  <select
                    value={editedSupplier.status}
                    onChange={(e) => setEditedSupplier({ ...editedSupplier, status: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowEditSupplierModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleUpdateSupplier}
                  disabled={isSaving}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Updating..." : "Update Supplier"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= DELETE SUPPLIER MODAL ================= */}

        {showDeleteSupplierModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-red-600 text-white px-6 py-5">
                <h2 className="text-xl font-bold">Delete Supplier</h2>
              </div>

              <div className="p-6">
                <p className="text-gray-700 text-lg">
                  Are you sure you want to delete <span className="font-bold">{selectedSupplier.name}</span>?
                </p>
                <p className="text-gray-500 mt-3">
                  This will only succeed if no purchase orders still reference this supplier.
                </p>
              </div>

              <div className="border-t p-5 flex justify-end gap-3">
                <button onClick={() => setShowDeleteSupplierModal(false)} className="px-5 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleDeleteSupplier}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl"
                >
                  {isSaving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= ADD WAREHOUSE MODAL ================= */}

        {showAddWarehouseModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add Warehouse</h2>
                <button onClick={() => setShowAddWarehouseModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <label className="font-medium">Warehouse Name</label>
                  <input
                    type="text"
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Location</label>
                  <input
                    type="text"
                    value={newWarehouse.location}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Manager</label>
                  <input
                    type="text"
                    value={newWarehouse.manager}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, manager: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Capacity</label>
                  <input
                    type="text"
                    value={newWarehouse.capacity}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Status</label>
                  <select
                    value={newWarehouse.status}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, status: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  >
                    <option>Active</option>
                    <option>Maintenance</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowAddWarehouseModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleAddWarehouse}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Adding..." : "Add Warehouse"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= VIEW WAREHOUSE MODAL ================= */}

        {showViewWarehouseModal && selectedWarehouse && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Warehouse Details</h2>
                <button onClick={() => setShowViewWarehouseModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500">Warehouse</p>
                  <h3 className="font-semibold">{selectedWarehouse.name}</h3>
                </div>

                <div>
                  <p className="text-gray-500">Location</p>
                  <h3 className="font-semibold">{selectedWarehouse.location}</h3>
                </div>

                <div>
                  <p className="text-gray-500">Manager</p>
                  <h3 className="font-semibold">{selectedWarehouse.manager}</h3>
                </div>

                <div>
                  <p className="text-gray-500">Capacity</p>
                  <h3 className="font-semibold">{selectedWarehouse.capacity}</h3>
                </div>

                <div>
                  <p className="text-gray-500">Current Stock</p>
                  <h3 className="font-semibold">{selectedWarehouse.stock}</h3>
                </div>

                <div>
                  <p className="text-gray-500">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedWarehouse.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedWarehouse.status}
                  </span>
                </div>
              </div>

              <div className="border-t p-5 flex justify-end">
                <button
                  onClick={() => setShowViewWarehouseModal(false)}
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
              <div className="bg-yellow-500 text-white px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit Warehouse</h2>
                <button onClick={() => setShowEditWarehouseModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div>
                  <label className="font-medium">Warehouse Name</label>
                  <input
                    type="text"
                    value={editedWarehouse.name}
                    onChange={(e) => setEditedWarehouse({ ...editedWarehouse, name: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Location</label>
                  <input
                    type="text"
                    value={editedWarehouse.location}
                    onChange={(e) => setEditedWarehouse({ ...editedWarehouse, location: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Manager</label>
                  <input
                    type="text"
                    value={editedWarehouse.manager}
                    onChange={(e) => setEditedWarehouse({ ...editedWarehouse, manager: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Capacity</label>
                  <input
                    type="text"
                    value={editedWarehouse.capacity}
                    onChange={(e) => setEditedWarehouse({ ...editedWarehouse, capacity: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Current Stock</label>
                  <input
                    type="text"
                    value={editedWarehouse.stock}
                    onChange={(e) => setEditedWarehouse({ ...editedWarehouse, stock: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Status</label>
                  <select
                    value={editedWarehouse.status}
                    onChange={(e) => setEditedWarehouse({ ...editedWarehouse, status: e.target.value })}
                    className="w-full border rounded-xl px-4 py-3 mt-2"
                  >
                    <option>Active</option>
                    <option>Maintenance</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="border-t p-6 flex justify-end gap-3">
                <button onClick={() => setShowEditWarehouseModal(false)} className="px-6 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleUpdateWarehouse}
                  disabled={isSaving}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white px-6 py-2 rounded-xl"
                >
                  {isSaving ? "Updating..." : "Update Warehouse"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= DELETE WAREHOUSE MODAL ================= */}

        {showDeleteWarehouseModal && selectedWarehouse && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-red-600 text-white px-6 py-5">
                <h2 className="text-xl font-bold">Delete Warehouse</h2>
              </div>

              <div className="p-6">
                <p className="text-gray-700 text-lg">
                  Are you sure you want to delete <span className="font-bold">{selectedWarehouse.name}</span>?
                </p>
                <p className="text-gray-500 mt-3">
                  This will only succeed if no products are still assigned to this warehouse.
                </p>
              </div>

              <div className="border-t p-5 flex justify-end gap-3">
                <button onClick={() => setShowDeleteWarehouseModal(false)} className="px-5 py-2 border rounded-xl">
                  Cancel
                </button>

                <button
                  onClick={handleDeleteWarehouse}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl"
                >
                  {isSaving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
           {/* ================= NOTIFICATIONS ================= */}

          {activeMenu === "Notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Notification Summary */}
              <div className="grid md:grid-cols-4 gap-6">

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Bell size={32} />
                  <p className="mt-4 text-white/80">Total Notifications</p>
                  <h2 className="text-4xl font-bold mt-2">{totalNotifications}</h2>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Activity size={32} />
                  <p className="mt-4 text-white/80">Today</p>
                  <h2 className="text-4xl font-bold mt-2">{todayNotifications}</h2>
                </motion.div>

              </div>

              {/* Notifications List */}
              <div className="bg-white rounded-3xl shadow-xl p-6">

                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Recent Notifications
                  </h2>


                </div>

                <div className="space-y-4">

                  {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ x: 6 }}
                        onClick={() => {
                          setSelectedNotification(item);
                          setShowNotificationModal(true);
                        }}
                        className="flex items-start gap-4 p-5 rounded-2xl border hover:shadow-lg transition cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 mt-2 rounded-full ${item.color}`}
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {item.title}
                            </h3>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {item.department}
                            </span>
                          </div>

                          <p className="text-gray-500 mt-1">
                            {item.desc}
                          </p>
                        </div>

                        <span className="text-sm text-gray-400">
                          {item.time}
                        </span>
                      </motion.div>
                    ))
                  )}

                </div>

              </div>

              {/* Quick Actions */}

              <div className="grid md:grid-cols-3 gap-6">

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Bell size={28} />

                  <h3 className="mt-5 text-xl font-bold">
                    HR Updates
                  </h3>

                  <p className="text-white/80 mt-2">
                    View latest HR policies and announcements.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <CalendarCheck size={28} />

                  <h3 className="mt-5 text-xl font-bold">
                    Attendance Alerts
                  </h3>

                  <p className="text-white/80 mt-2">
                    Never miss attendance reminders.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl"
                >
                  <Wallet size={28} />

                  <h3 className="mt-5 text-xl font-bold">
                    Payroll Alerts
                  </h3>

                  <p className="text-white/80 mt-2">
                    Salary and payslip notifications.
                  </p>
                </motion.div>

              </div>

            </motion.div>
          )}

        {showNotificationModal && selectedNotification && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-8 py-5 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Notification Details</h2>
                  <p className="text-sm text-blue-100 mt-1">{selectedNotification.time}</p>
                </div>
                <button onClick={() => setShowNotificationModal(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-3 h-3 rounded-full ${selectedNotification.color}`} />
                  <h3 className="text-xl font-semibold">{selectedNotification.title}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">From: {selectedNotification.department}</p>
                <p className="text-gray-600">{selectedNotification.desc}</p>
              </div>

              <div className="border-t p-5 flex justify-end">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= TOASTS ================= */}

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
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Product deleted successfully
          </motion.div>
        )}

        {showCategoryAdded && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Category added successfully
          </motion.div>
        )}

        {showCategoryUpdated && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Category updated successfully
          </motion.div>
        )}

        {showCategoryDeleted && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Category deleted successfully
          </motion.div>
        )}

        {showPOCreated && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Purchase Order created successfully
          </motion.div>
        )}

        {showOrderUpdated && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-32 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Purchase Order updated successfully
          </motion.div>
        )}

        {showSupplierUpdated && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-32 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Supplier updated successfully
          </motion.div>
        )}

        {showSupplierAdded && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-32 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Supplier added successfully
          </motion.div>
        )}

        {showSupplierDeleted && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-32 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Supplier deleted successfully
          </motion.div>
        )}

        {showWarehouseUpdated && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-44 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Warehouse updated successfully
          </motion.div>
        )}

        {showWarehouseAdded && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-44 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Warehouse added successfully
          </motion.div>
        )}

        {showWarehouseDeleted && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-44 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            ✅ Warehouse deleted successfully
          </motion.div>
        )}

   {activeMenu === "Messages" && <MessageForm sender="Inventory" businessId={businessId || ""} />}      </main>
    </div>
  );
}