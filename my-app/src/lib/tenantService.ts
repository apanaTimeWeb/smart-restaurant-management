// RESPONSIBILITY: Service logic for SaaS Multi-Tenant management, city discovery,
// tenant provisioning, advance subscription status transitions, and advance table reservations.
// DATA FLOW: localStorage (STORAGE_KEYS.SAAS_TENANTS, STORAGE_KEYS.ADVANCE_RESERVATIONS) -> tenantService.ts -> Components

import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import type { AppTenant, AppAdvanceReservation, TenantStatus } from "@/types/appTypes";

// ─── Initial Seed Tenants ─────────────────────────────────────────────────────

export const DEFAULT_TENANTS: AppTenant[] = [
  {
    tenantId: "tenant-royal-spice-01",
    restaurantName: "Royal Spice Bistro",
    tagline: "Authentic Fine Dining & Royal Mughlai Cuisine",
    city: "Bengaluru",
    address: "100 Feet Road, Indiranagar, Bengaluru - 560038",
    landmark: "Near Metro Station",
    pincode: "560038",
    cuisineTypes: ["North Indian", "Mughlai", "Biryani"],
    fssaiNumber: "11223344556677",
    gstinNumber: "29AAAAA0000A1Z5",
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    upiVpa: "royalspice@upi",
    openingTime: "11:00 AM",
    closingTime: "11:00 PM",
    rating: 4.8,
    costForTwo: 1200,
    status: "ACTIVE",
    subscriptionPlan: "PRO",
    advanceFeePaid: 2999,
    ownerId: "usr_owner_01",
    ownerName: "Rajesh Sharma",
    ownerPhone: "9876543210",
    ownerEmail: "owner@royalspice.com",
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    tenantId: "tenant-flavors-punjab-02",
    restaurantName: "Flavors of Punjab",
    tagline: "Rich Butter Chicken, Dal Makhani & Tandoori Delights",
    city: "Mumbai",
    address: "Bandra Kurla Complex, Bandra West, Mumbai - 400051",
    landmark: "Opposite Diamond Market",
    pincode: "400051",
    cuisineTypes: ["North Indian", "Punjabi", "Tandoori"],
    fssaiNumber: "22334455667788",
    gstinNumber: "27BBBBB1111B1Z2",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    upiVpa: "punjabflavors@upi",
    openingTime: "12:00 PM",
    closingTime: "11:30 PM",
    rating: 4.7,
    costForTwo: 950,
    status: "ACTIVE",
    subscriptionPlan: "PRO",
    advanceFeePaid: 2999,
    ownerId: "usr_owner_02",
    ownerName: "Harpreet Singh",
    ownerPhone: "9820011223",
    ownerEmail: "harpreet@flavorsofpunjab.com",
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    tenantId: "tenant-dragon-house-03",
    restaurantName: "The Grand Dragon Cafe",
    tagline: "Pan-Asian Delicacies, Dim Sums & Craft Teas",
    city: "Delhi NCR",
    address: "Connaught Place, Inner Circle, New Delhi - 110001",
    landmark: "Block F",
    pincode: "110001",
    cuisineTypes: ["Chinese", "Asian", "Cafes"],
    fssaiNumber: "33445566778899",
    gstinNumber: "07CCCCC2222C1Z9",
    logoUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
    upiVpa: "granddragon@upi",
    openingTime: "10:00 AM",
    closingTime: "10:30 PM",
    rating: 4.6,
    costForTwo: 800,
    status: "ACTIVE",
    subscriptionPlan: "STARTER",
    advanceFeePaid: 2999,
    ownerId: "usr_owner_03",
    ownerName: "Ananya Roy",
    ownerPhone: "9811009988",
    ownerEmail: "ananya@granddragon.com",
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    tenantId: "tenant-hyderabad-biryani-04",
    restaurantName: "Paradise Nizam Biryani",
    tagline: "Authentic Dum Biryani & Kebabs",
    city: "Hyderabad",
    address: "Jubilee Hills, Road No. 36, Hyderabad - 500033",
    landmark: "Near Check Post",
    pincode: "500033",
    cuisineTypes: ["Biryani", "South Indian", "Hyderabadi"],
    fssaiNumber: "44556677889900",
    gstinNumber: "36DDDDD3333D1Z4",
    logoUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
    upiVpa: "paradisebiryani@upi",
    openingTime: "11:30 AM",
    closingTime: "11:59 PM",
    rating: 4.9,
    costForTwo: 1100,
    status: "ACTIVE",
    subscriptionPlan: "ENTERPRISE",
    advanceFeePaid: 4999,
    ownerId: "usr_owner_04",
    ownerName: "Tariq Ali",
    ownerPhone: "9849012345",
    ownerEmail: "tariq@paradisebiryani.com",
    createdAt: Date.now() - 20 * 86400000,
  },
];

// ─── Tenant Data Helpers ──────────────────────────────────────────────────────

export function getStoredTenants(): AppTenant[] {
  if (typeof window === "undefined") return DEFAULT_TENANTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAAS_TENANTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SAAS_TENANTS, JSON.stringify(DEFAULT_TENANTS));
      return DEFAULT_TENANTS;
    }
    return JSON.parse(raw) as AppTenant[];
  } catch (e) {
    console.error("Failed to read stored tenants:", e);
    return DEFAULT_TENANTS;
  }
}

export function saveTenants(tenants: AppTenant[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SAAS_TENANTS, JSON.stringify(tenants));
  } catch (e) {
    console.error("Failed to save tenants:", e);
  }
}

export function getActiveTenants(): AppTenant[] {
  return getStoredTenants().filter((t) => t.status === "ACTIVE");
}

export function getTenantById(tenantId: string): AppTenant | null {
  const tenants = getStoredTenants();
  return tenants.find((t) => t.tenantId === tenantId) || null;
}

export function getTenantsByOwner(ownerId?: string, ownerPhone?: string): AppTenant[] {
  const tenants = getStoredTenants();
  if (!ownerId && !ownerPhone) return [];
  return tenants.filter(
    (t) => (ownerId && t.ownerId === ownerId) || (ownerPhone && t.ownerPhone === ownerPhone)
  );
}

export function updateTenantStatus(tenantId: string, status: TenantStatus, txnRefId?: string): AppTenant | null {
  const tenants = getStoredTenants();
  let updatedTenant: AppTenant | null = null;

  const next = tenants.map((t) => {
    if (t.tenantId === tenantId) {
      updatedTenant = {
        ...t,
        status,
        txnRefId: txnRefId || t.txnRefId,
        updatedAt: Date.now(),
      };
      return updatedTenant;
    }
    return t;
  });

  saveTenants(next);
  return updatedTenant;
}

export function registerNewTenant(tenantData: Partial<AppTenant>): AppTenant {
  const tenants = getStoredTenants();
  const newTenantId = `tenant-${Date.now()}`;

  const newTenant: AppTenant = {
    tenantId: newTenantId,
    restaurantName: tenantData.restaurantName || "New Restaurant",
    tagline: tenantData.tagline || "Delicious Dining Experience",
    city: tenantData.city || "Bengaluru",
    address: tenantData.address || "Main Market",
    landmark: tenantData.landmark || "",
    pincode: tenantData.pincode || "560001",
    cuisineTypes: tenantData.cuisineTypes || ["North Indian"],
    fssaiNumber: tenantData.fssaiNumber || "",
    gstinNumber: tenantData.gstinNumber || "",
    logoUrl: tenantData.logoUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
    bannerUrl: tenantData.bannerUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    upiVpa: tenantData.upiVpa || "restaurant@upi",
    openingTime: tenantData.openingTime || "11:00 AM",
    closingTime: tenantData.closingTime || "11:00 PM",
    rating: 4.5,
    costForTwo: tenantData.costForTwo || 800,
    status: "APPROVAL_PENDING",
    subscriptionPlan: "PRO",
    advanceFeePaid: 2999,
    ownerId: tenantData.ownerId || `owner_${Date.now()}`,
    ownerName: tenantData.ownerName || "Partner Owner",
    ownerPhone: tenantData.ownerPhone || "9900112233",
    ownerEmail: tenantData.ownerEmail || "owner@example.com",
    isListed: false,
    createdAt: Date.now(),
  };

  saveTenants([...tenants, newTenant]);

  // Immediately initialize the master DB block for the new tenant
  if (typeof window !== "undefined") {
    try {
      const MASTER_DB_KEY = "smart_pos_master_db";
      const rawMaster = window.localStorage.getItem(MASTER_DB_KEY);
      const db = rawMaster ? JSON.parse(rawMaster) : { tenants_data: {} };
      if (!db.tenants_data) db.tenants_data = {};
      
      // Inject empty structure for all known arrays
      db.tenants_data[newTenantId] = {
        app_menu: [],
        app_tables: [],
        app_orders: [],
        app_admin_staff: [],
        app_inventory: [],
        app_sales_history: [],
        app_stock_alerts: [],
        app_crm_customers: [],
        app_combos: [],
        app_shift_register: null,
        app_salary_records: [],
        app_staff_attendance: [],
        app_notifications: []
      };
      window.localStorage.setItem(MASTER_DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.error("Failed to initialize master db for new tenant", e);
    }
  }

  return newTenant;
}

// ─── Advance Reservations Helpers ───────────────────────────────────────────

export function getStoredAdvanceReservations(): AppAdvanceReservation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADVANCE_RESERVATIONS);
    if (!raw) return [];
    return JSON.parse(raw) as AppAdvanceReservation[];
  } catch (e) {
    console.error("Failed to read advance reservations:", e);
    return [];
  }
}

export function saveAdvanceReservations(reservations: AppAdvanceReservation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ADVANCE_RESERVATIONS, JSON.stringify(reservations));
  } catch (e) {
    console.error("Failed to save advance reservations:", e);
  }
}

export function createAdvanceReservation(resData: Omit<AppAdvanceReservation, "id" | "createdAt">): AppAdvanceReservation {
  const current = getStoredAdvanceReservations();
  const newRes: AppAdvanceReservation = {
    ...resData,
    id: `res_${Date.now()}`,
    createdAt: Date.now(),
  };
  saveAdvanceReservations([newRes, ...current]);
  return newRes;
}
