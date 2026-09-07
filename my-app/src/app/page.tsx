"use client";

// RESPONSIBILITY: Public City Marketplace & Multi-Tenant SaaS Landing Portal (`/`).
// Allows customers to browse, search, and discover top restaurants by city & cuisine,
// scan walk-in QR menus, or book advance tables with zero-wait pre-ordering.
// Provides Managers direct CTA to register and onboard their restaurant.
// DATA FLOW: tenantService -> localStorage (SAAS_TENANTS) -> City Marketplace -> UI

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  QrCode,
  Calendar,
  Building2,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  UserCheck,
  CreditCard,
  ChefHat,
  Bell,
  LogOut,
} from "lucide-react";

import { initializeLocalStorageSeeds } from "@/lib/localStorageSeeder";
import { getStoredTenants, getActiveTenants } from "@/lib/tenantService";
import type { AppTenant, UserRole } from "@/types/appTypes";
import { HomeRoleAccessPanel } from "@/app/customer/customer_home_components/HomeRoleAccessPanel";
import { PublicNavbar } from "@/components/PublicNavbar/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter/PublicFooter";

const CITIES = [
  "All Cities",
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Goa",
  "Jaipur",
] as const;

const CUISINES = [
  "All Cuisines",
  "North Indian",
  "Chinese",
  "South Indian",
  "Biryani",
  "Tandoori",
  "Mughlai",
  "Asian",
  "Cafes",
] as const;

export default function SaaSMarketplaceLandingPage(): React.JSX.Element {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("All Cuisines");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    initializeLocalStorageSeeds();
    setIsMounted(true);
  }, []);

  const tenants = useMemo(() => {
    if (!isMounted) return [];
    return getActiveTenants();
  }, [isMounted]);

  // Filtered Restaurants
  const filteredTenants = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return tenants.filter((t) => {
      const matchesCity = selectedCity === "All Cities" || t.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesCuisine =
        selectedCuisine === "All Cuisines" ||
        t.cuisineTypes.some((c) => c.toLowerCase() === selectedCuisine.toLowerCase());
      const matchesSearch =
        query === "" ||
        t.restaurantName.toLowerCase().includes(query) ||
        t.city.toLowerCase().includes(query) ||
        t.address.toLowerCase().includes(query);

      const isListed = t.isListed !== false; // undefined means it's a legacy seed and should be shown
      return isListed && matchesCity && matchesCuisine && matchesSearch;
    });
  }, [tenants, selectedCity, selectedCuisine, searchQuery]);

  return (
    <div className="min-h-screen w-full bg-page text-text-primary flex flex-col">
      <PublicNavbar />

      {/* â”€â”€ Hero Search & Discovery Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-page to-page py-12 px-4 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-extrabold text-amber-500 mb-4 shadow-xs">
            <Sparkles size={14} className="fill-amber-500 animate-pulse" />
            Discover & Book Top Restaurants Across India
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-tight">
            Find the Best Dining Experience <br />
            <span className="bg-gradient-to-r from-primary via-amber-500 to-emerald-500 bg-clip-text text-transparent">
              In Your City
            </span>
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-text-secondary max-w-2xl mx-auto">
            Browse verified top-rated restaurants, view digital QR menus instantly with zero friction, or pre-book tables with zero waiting time!
          </p>

          {/* Search Bar Container */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-2.5 rounded-2xl border border-border/80 bg-card p-2.5 shadow-2xl max-w-3xl mx-auto">
            {/* City Selector */}
            <div className="flex items-center gap-2 w-full sm:w-48 px-3 py-2 border-b sm:border-b-0 sm:border-r border-border/60">
              <MapPin size={18} className="text-primary shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent font-bold text-xs text-text-primary focus:outline-none cursor-pointer"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city} className="bg-card text-text-primary">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex flex-1 items-center gap-2.5 w-full px-3 py-1">
              <Search size={18} className="text-text-muted shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurant name, landmark, biryani, dim sumsâ€¦"
                className="w-full bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
          </div>

          {/* Cuisine Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none mt-6 pb-2">
            {CUISINES.map((cuisine) => {
              const isSelected = selectedCuisine === cuisine;
              return (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                    isSelected
                      ? "bg-primary text-white shadow-md"
                      : "border border-border/70 bg-card text-text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  {cuisine}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* â”€â”€ Featured Restaurants Grid Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary">
              Featured Restaurants in {selectedCity}
            </h2>
            <p className="text-xs text-text-secondary">
              Verified dining partners offering Walk-in QR ordering & Advance Bookings
            </p>
          </div>
          <span className="rounded-xl border border-border bg-card px-3 py-1 text-xs font-bold text-text-muted">
            {filteredTenants.length} Partner{filteredTenants.length !== 1 ? "s" : ""} Available
          </span>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted border border-dashed border-border rounded-2xl bg-card/50">
            <UtensilsCrossed size={48} className="mb-3 opacity-40 text-primary" />
            <h3 className="font-bold text-base text-text-primary">No Restaurants Found</h3>
            <p className="text-xs text-text-muted mt-1">
              Try selecting a different city or resetting your cuisine filters.
            </p>
            <button
              onClick={() => {
                setSelectedCity("All Cities");
                setSelectedCuisine("All Cuisines");
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.tenantId}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl"
              >
                {/* Banner & Badge (Clickable to Details Page) */}
                <Link href={`/customer/hotel/${tenant.tenantId}`} className="relative h-44 w-full bg-surface overflow-hidden block">
                  <img
                    src={(tenant.galleryUrls && tenant.galleryUrls.length > 0) ? tenant.galleryUrls[0] : tenant.bannerUrl}
                    alt={tenant.restaurantName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Rating Tag */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-xl bg-emerald-500 px-2.5 py-1 text-xs font-black text-white shadow-md">
                    <Star size={12} className="fill-white" />
                    <span>{tenant.rating}</span>
                  </div>

                  {/* City Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-xl bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
                    <MapPin size={11} className="text-amber-400" />
                    <span>{tenant.city}</span>
                  </div>

                  {/* Restaurant Title inside Banner */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-lg leading-snug drop-shadow-md group-hover:text-primary transition-colors">
                      {tenant.restaurantName}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1 font-medium">
                      {tenant.tagline}
                    </p>
                  </div>
                </Link>

                {/* Details Section */}
                <div className="p-4 flex flex-col gap-3">
                  {/* Address & Cuisines */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-text-muted line-clamp-1">
                      ðŸ“ {tenant.address}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tenant.cuisineTypes.map((c) => (
                        <span
                          key={c}
                          className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-bold text-text-secondary border border-border/50"
                        >
                          {c}
                        </span>
                      ))}
                      <span className="ml-auto text-xs font-extrabold text-text-primary">
                        â‚¹{tenant.costForTwo} for two
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Dual Pathways */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 mt-1">
                    {/* Pathway 1: Walk-In QR Menu (Zero Friction) */}
                    <Link
                      href={`/customer?table=T-01&tenant=${tenant.tenantId}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-extrabold text-emerald-500 hover:bg-emerald-500 hover:text-white active:scale-95 transition-all shadow-xs"
                    >
                      <QrCode size={14} />
                      <span>QR Menu</span>
                    </Link>

                    {/* Pathway 2: Online Advance Booking & Zero-Wait Pre-Ordering */}
                    <Link
                      href={`/reservations/book?tenant=${tenant.tenantId}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-extrabold text-white hover:bg-primary/90 active:scale-95 transition-all shadow-md"
                    >
                      <Calendar size={14} />
                      <span>Book Table</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* â”€â”€ Partner With Us CTA Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/20 via-surface to-amber-500/20 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-black text-primary uppercase tracking-wider">
                Hotel & Restaurant Partners
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text-primary tracking-tight">
                Are You a Restaurant Owner? <br />
                Launch Your Cloud POS Terminal Today!
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-text-secondary">
                Join hundreds of restaurants streamlining billing, kitchen KDS tickets, waiter floor calls, and QR customer ordering on a single SaaS platform.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-extrabold text-text-primary">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={15} className="text-emerald-500" /> FSSAI & GSTIN Compliant
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={15} className="text-emerald-500" /> Multi-Gateway Subscriptions
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={15} className="text-emerald-500" /> Super Admin Instant Provisioning
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-3 w-full sm:w-auto">
              <Link
                href="/manager/register"
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-black text-sm text-white shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
              >
                <span>Register Your Restaurant</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/super-admin/dashboard"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-extrabold text-text-secondary hover:text-text-primary"
              >
                <ShieldCheck size={15} className="text-amber-500" />
                <span>Super Admin Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Interactive 5 Role Operating POS Terminals Access Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <HomeRoleAccessPanel />

      <PublicFooter />
    </div>
  );
}
