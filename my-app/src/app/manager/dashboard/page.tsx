"use client";

// RESPONSIBILITY: Manager Tenant Dashboard (`/manager/dashboard`).
// Displays "Create Your Restaurant" button when no hotel exists.
// Hosts Create Hotel Modal, Approval Pending Tracker, Pay Subscription Button,
// and Active POS Tenant Tools (Staff Creator, Menu Creator, Table Creator).
// DATA FLOW: tenantService -> STORAGE_KEYS.SAAS_TENANTS -> owner/dashboard/page.tsx -> UI

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  UtensilsCrossed,
  ChefHat,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Landmark,
  X,
  Users,
  Utensils,
  Grid3x3,
  Search,
  CalendarCheck,
} from "lucide-react";
import { getStoredTenants, getTenantsByOwner, registerNewTenant, updateTenantStatus } from "@/lib/tenantService";
import { dispatchNotification } from "@/lib/notificationService";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AppTenant, AppUser, AppMenuItem, AppTable, UserRole } from "@/types/appTypes";

export default function OwnerDashboardPage() {
  const [tenants, setTenants] = useState<AppTenant[]>([]);
  const [activeTenant, setActiveTenant] = useState<AppTenant | null>(null);

  // LocalStorage state for Staff, Menu, and Tables
  const [users, setUsers] = useLocalStorage<AppUser[]>(STORAGE_KEYS.USERS, []);
  const [menuItems, setMenuItems] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);
  const [tables, setTables] = useLocalStorage<AppTable[]>(STORAGE_KEYS.TABLES, []);

  // Modals state
  const [isCreateHotelOpen, setIsCreateHotelOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"LAUNCHPAD" | "STAFF" | "MENU" | "TABLES">("LAUNCHPAD");

  // Form states
  const [hotelForm, setHotelForm] = useState({
    restaurantName: "",
    tagline: "Authentic Fine Dining",
    city: "Bengaluru",
    address: "",
    landmark: "",
    pincode: "560038",
    cuisineTypes: "North Indian, Biryani, Mughlai",
    costForTwo: 1000,
    fssaiNumber: "",
    gstinNumber: "",
    upiVpa: "restaurant@upi",
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "CASHIER" as UserRole,
    phone: "",
    password: "",
  });

  const [menuForm, setMenuForm] = useState({
    name: "",
    price: 240,
    category: "Main Course",
    station: "Kitchen" as AppMenuItem["station"],
  });

  const [tableForm, setTableForm] = useState({
    tableNumber: "T-05",
    section: "Dining" as AppTable["section"],
  });

  const [txnRefInput, setTxnRefInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useAuth();

  const refreshTenants = React.useCallback(() => {
    if (!currentUser) {
      setTenants([]);
      setActiveTenant(null);
      return;
    }
    const ownerTenants = getTenantsByOwner(currentUser.id, currentUser.phone || undefined);
    setTenants(ownerTenants);
    if (ownerTenants.length > 0) {
      setActiveTenant(ownerTenants[0]);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshTenants();
    
    // Auto-refresh when tab is focused (e.g. switching back from Super Admin)
    const handleFocus = () => refreshTenants();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshTenants]);

  // Redirect to admin dashboard if ACTIVE
  useEffect(() => {
    if (activeTenant?.status === "ACTIVE") {
      window.location.href = "/admin/dashboard";
    }
  }, [activeTenant]);

  // 1. Submit "Create Hotel" Request
  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cuisinesArray = hotelForm.cuisineTypes.split(",").map((c) => c.trim());

    setTimeout(() => {
      const created = registerNewTenant({
        restaurantName: hotelForm.restaurantName,
        tagline: hotelForm.tagline,
        city: hotelForm.city,
        address: hotelForm.address,
        landmark: hotelForm.landmark,
        pincode: hotelForm.pincode,
        cuisineTypes: cuisinesArray,
        costForTwo: Number(hotelForm.costForTwo),
        fssaiNumber: hotelForm.fssaiNumber,
        gstinNumber: hotelForm.gstinNumber,
        upiVpa: hotelForm.upiVpa,
        logoUrl: hotelForm.logoUrl,
        bannerUrl: hotelForm.bannerUrl,
        ownerId: currentUser?.id,
        ownerPhone: currentUser?.phone || undefined,
        ownerName: currentUser?.name || "Manager",
      });

      // Dispatch Notification to Super Admin
      dispatchNotification({
        role: "SUPER_ADMIN",
        type: "HOTEL_REGISTRATION_NEW",
        title: "New Hotel Registration Request 🏨",
        message: `Hotel "${created.restaurantName}" (${created.city}) submitted by Owner. Please review FSSAI & GSTIN.`,
        route: "/super-admin/requests",
        playSound: true,
        soundType: "BELL",
      });

      setActiveTenant(created);
      refreshTenants();
      setIsSubmitting(false);
      setIsCreateHotelOpen(false);
    }, 600);
  };

  // 2. Submit Subscription Payment
  const handlePaySubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;

    setIsSubmitting(true);
    const txnId = txnRefInput || `TXN_${Date.now().toString().slice(-6)}`;

    setTimeout(() => {
      const updated = updateTenantStatus(activeTenant.tenantId, "PAYMENT_SUBMITTED", txnId);
      if (updated) {
        setActiveTenant(updated);
      }

      dispatchNotification({
        role: "SUPER_ADMIN",
        type: "PAYMENT_SUBMITTED",
        title: "Subscription Fee Payment Submitted 💳",
        message: `Hotel "${activeTenant.restaurantName}" submitted advance subscription payment (Txn ID: ${txnId}).`,
        route: "/super-admin/payments",
        playSound: true,
        soundType: "READY",
      });

      setIsSubmitting(false);
      setIsPaymentModalOpen(false);
    }, 600);
  };

  // 3. Create Staff Account
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.phone) return;

    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      username: staffForm.phone,
      passwordHash: staffForm.password || "123456",
      role: staffForm.role,
      name: staffForm.name,
      phone: staffForm.phone,
      createdByAdmin: true,
      createdAt: Date.now(),
      isActive: true,
    };

    setUsers([...users, newUser]);
    setStaffForm({ name: "", role: "CASHIER", phone: "", password: "" });
  };

  // 4. Create Menu Item
  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name) return;

    const newItem: AppMenuItem = {
      id: `item_${Date.now()}`,
      name: menuForm.name,
      price: Number(menuForm.price),
      category: menuForm.category,
      station: menuForm.station,
      isAvailable: true,
      variants: [],
      recipe: [],
      isSpecial: false,
    };

    setMenuItems([...menuItems, newItem]);
    setMenuForm({ name: "", price: 240, category: "Main Course", station: "Kitchen" });
  };

  // 5. Create Table
  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.tableNumber) return;

    const newTable: AppTable = {
      id: `tbl_${Date.now()}`,
      tableNumber: tableForm.tableNumber,
      section: tableForm.section,
      status: "AVAILABLE",
      currentOrderId: null,
      mergedTables: [],
    };

    setTables([...tables, newTable]);
    setTableForm({ tableNumber: "", section: "Dining" });
  };

  return (
    <div className="min-h-screen bg-page p-4 sm:p-6 lg:p-8 text-text-primary">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 text-white shadow-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-text-primary">
                Manager Control Center
              </h1>
              <p className="text-xs text-text-secondary">
                Manage restaurant profile, subscription payments, staff, menu items & dining tables
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateHotelOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>Create Your Restaurant</span>
          </button>
        </div>

        {/* ── NO HOTEL CREATED YET ────────────────────────────────────────────── */}
        {!activeTenant ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border rounded-3xl bg-card">
            <Building2 size={56} className="text-primary mb-4 opacity-80" />
            <h2 className="text-2xl font-black text-text-primary">No Restaurant Profile Created</h2>
            <p className="text-xs text-text-secondary mt-1.5 max-w-md">
              Welcome to Smart POS 360! Click the button below to fill in your restaurant details and submit your application for Super Admin approval.
            </p>
            <button
              onClick={() => setIsCreateHotelOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-black text-xs text-white shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
            >
              <Plus size={18} />
              <span>➕ Create Your Restaurant Now</span>
            </button>
          </div>
        ) : (
          /* ── ACTIVE OR PENDING HOTEL STATE ────────────────────────────────── */
          <div className="flex flex-col gap-6">
            {/* Active Hotel Details Card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeTenant.logoUrl}
                  alt={activeTenant.restaurantName}
                  className="h-16 w-16 rounded-2xl object-cover border border-border shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-xl text-text-primary">
                      {activeTenant.restaurantName}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-0.5 text-[10px] font-extrabold border ${
                        activeTenant.status === "ACTIVE"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : activeTenant.status === "PAYMENT_PENDING"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse"
                          : activeTenant.status === "PAYMENT_SUBMITTED"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                          : "bg-surface border-border text-text-secondary"
                      }`}
                    >
                      Status: {activeTenant.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    📍 {activeTenant.address} · {activeTenant.city}
                  </p>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeTenant.status === "APPROVAL_PENDING" && (
                  <div className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-500">
                    <Clock size={18} className="animate-spin" />
                    <span>Waiting for Super Admin Approval…</span>
                  </div>
                )}

                {activeTenant.status === "PAYMENT_PENDING" && (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-xs font-black text-black shadow-xl hover:bg-amber-400 active:scale-95 transition-all animate-pulse"
                  >
                    <CreditCard size={18} />
                    <span>💳 Pay Advance Subscription Fee (₹2,999 / Year)</span>
                  </button>
                )}

                {activeTenant.status === "PAYMENT_SUBMITTED" && (
                  <div className="flex items-center gap-2 rounded-2xl border border-blue-500/40 bg-blue-500/10 p-3 text-xs font-bold text-blue-500">
                    <CheckCircle2 size={18} />
                    <span>Payment Submitted · Verifying Activation…</span>
                  </div>
                )}
              </div>
            </div>

            {/* Management Tabs Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {[
                { id: "LAUNCHPAD", label: "Launchpad", icon: Grid3x3 },
                { id: "MENU", label: "Menu Creator", icon: Utensils },
                { id: "TABLES", label: "Table Setup", icon: Grid3x3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-md"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  }`}
                >
                  <tab.icon size={15} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: LAUNCHPAD */}
            {activeTab === "LAUNCHPAD" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/admin/dashboard"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary group-hover:text-primary">
                      Admin Command Center
                    </h3>
                    <p className="text-xs text-text-secondary">Analytics & management</p>
                  </div>
                </Link>

                <Link
                  href="/billing"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary group-hover:text-emerald-500">
                      Cashier Billing POS
                    </h3>
                    <p className="text-xs text-text-secondary">Bills & thermal print</p>
                  </div>
                </Link>

                <Link
                  href="/waiter"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-amber-500 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary group-hover:text-amber-500">
                      Waiter Floor Captain
                    </h3>
                    <p className="text-xs text-text-secondary">KOTs & floor service</p>
                  </div>
                </Link>

                <Link
                  href="/kitchen"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-red-500 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                    <ChefHat size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary group-hover:text-red-500">
                      Kitchen KDS Terminal
                    </h3>
                    <p className="text-xs text-text-secondary">Station tickets</p>
                  </div>
                </Link>

                <Link
                  href="/manager/reservations"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <CalendarCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary group-hover:text-blue-500">
                      Advance Reservations
                    </h3>
                    <p className="text-xs text-text-secondary">View table bookings</p>
                  </div>
                </Link>

                <Link
                  href={`/customer?table=T-01&tenant=${activeTenant.tenantId}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-purple-500 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary group-hover:text-purple-500">
                      Customer QR Menu
                    </h3>
                    <p className="text-xs text-text-secondary">Zero friction self-order</p>
                  </div>
                </Link>

                <Link
                  href="/manager/staff-credentials"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-500">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-text-primary group-hover:text-emerald-500">
                      Staff Credentials
                    </h3>
                    <p className="text-xs text-text-secondary">Generate logins</p>
                  </div>
                </Link>
              </div>
            )}


            {/* TAB 3: MENU CREATOR */}
            {activeTab === "MENU" && (
              <div className="flex flex-col gap-6">
                <form onSubmit={handleCreateMenuItem} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                  <h3 className="font-black text-sm text-text-primary flex items-center gap-2">
                    <Utensils size={18} className="text-emerald-500" />
                    <span>Create New Menu Dish Item</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">Dish Name</label>
                      <input
                        type="text"
                        required
                        value={menuForm.name}
                        onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                        placeholder="e.g. Paneer Butter Masala"
                        className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) })}
                        placeholder="240"
                        className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">Category</label>
                      <input
                        type="text"
                        value={menuForm.category}
                        onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                        placeholder="Main Course"
                        className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">Kitchen Station</label>
                      <select
                        value={menuForm.station}
                        onChange={(e) => setMenuForm({ ...menuForm, station: e.target.value as any })}
                        className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                      >
                        <option value="Kitchen">Kitchen</option>
                        <option value="Bar">Bar</option>
                        <option value="Bakery">Bakery</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="self-end rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-600"
                  >
                    Add Menu Dish
                  </button>
                </form>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h4 className="font-bold text-xs text-text-primary mb-3">Menu Master Items ({menuItems.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {menuItems.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl border border-border bg-surface flex flex-col justify-between">
                        <p className="font-bold text-xs text-text-primary">{m.name}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
                          <span className="text-text-muted">{m.category}</span>
                          <span className="font-black text-emerald-500">₹{m.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TABLES CREATOR */}
            {activeTab === "TABLES" && (
              <div className="flex flex-col gap-6">
                <form onSubmit={handleCreateTable} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                  <h3 className="font-black text-sm text-text-primary flex items-center gap-2">
                    <Grid3x3 size={18} className="text-amber-500" />
                    <span>Create New Dining Table</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">Table Number</label>
                      <input
                        type="text"
                        required
                        value={tableForm.tableNumber}
                        onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                        placeholder="e.g. T-05"
                        className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-secondary block mb-1">Floor Section</label>
                      <select
                        value={tableForm.section}
                        onChange={(e) => setTableForm({ ...tableForm, section: e.target.value as any })}
                        className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                      >
                        <option value="Dining">Dining</option>
                        <option value="AC">AC</option>
                        <option value="Outdoor">Outdoor</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="self-end rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-black shadow-md hover:bg-amber-400"
                  >
                    Add Dining Table
                  </button>
                </form>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h4 className="font-bold text-xs text-text-primary mb-3">Configured Dining Tables ({tables.length})</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {tables.map((t) => (
                      <div key={t.id} className="p-3 rounded-xl border border-border bg-surface text-center">
                        <p className="font-black text-sm text-text-primary">{t.tableNumber}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{t.section}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CREATE HOTEL FORM MODAL ────────────────────────────────────────── */}
      {isCreateHotelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <div className="flex items-center gap-2 text-primary font-black text-lg">
                <Building2 size={22} />
                <span>Create Your Restaurant Profile</span>
              </div>
              <button
                onClick={() => setIsCreateHotelOpen(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={hotelForm.restaurantName}
                    onChange={(e) => setHotelForm({ ...hotelForm, restaurantName: e.target.value })}
                    placeholder="e.g. Royal Spice Bistro"
                    className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={hotelForm.tagline}
                    onChange={(e) => setHotelForm({ ...hotelForm, tagline: e.target.value })}
                    placeholder="Authentic Fine Dining"
                    className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">City *</label>
                  <select
                    value={hotelForm.city}
                    onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Goa">Goa</option>
                    <option value="Jaipur">Jaipur</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Cuisines Offered</label>
                  <input
                    type="text"
                    value={hotelForm.cuisineTypes}
                    onChange={(e) => setHotelForm({ ...hotelForm, cuisineTypes: e.target.value })}
                    placeholder="North Indian, Chinese, Biryani"
                    className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">FSSAI License Number</label>
                  <input
                    type="text"
                    value={hotelForm.fssaiNumber}
                    onChange={(e) => setHotelForm({ ...hotelForm, fssaiNumber: e.target.value })}
                    placeholder="11223344556677"
                    className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={hotelForm.gstinNumber}
                    onChange={(e) => setHotelForm({ ...hotelForm, gstinNumber: e.target.value })}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Full Physical Address *</label>
                <textarea
                  required
                  rows={2}
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  placeholder="100 Feet Road, Indiranagar, Bengaluru"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-black text-xs text-white shadow-xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting to Super Admin…</span>
                ) : (
                  <>
                    <span>Submit Restaurant Profile for Super Admin Approval</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTION PAYMENT MODAL ────────────────────────────────────── */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CreditCard size={20} />
                <span>Subscription Payment Gateway</span>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 mb-4">
              <p className="text-xs text-text-muted">Approved SaaS POS License</p>
              <p className="font-black text-xl text-emerald-500">₹2,999 / Year</p>
            </div>

            <form onSubmit={handlePaySubscription} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-text-secondary">
                  Transaction Reference / UTR Number
                </label>
                <input
                  type="text"
                  value={txnRefInput}
                  onChange={(e) => setTxnRefInput(e.target.value)}
                  placeholder="e.g. TXN987654321"
                  className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-black text-xs text-white shadow-lg hover:bg-emerald-600 active:scale-95 transition-all"
              >
                <span>Submit Subscription Payment (₹2,999)</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
