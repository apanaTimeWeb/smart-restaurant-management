"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStoredTenants } from "@/lib/tenantService";
import type { AppTenant, AppMenuItem } from "@/types/appTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/localStorageSeeder";
import Link from "next/link";
import { 
  MapPin, 
  Star, 
  Utensils, 
  Info, 
  Tag, 
  Image as ImageIcon,
  Calendar,
  ClipboardList
} from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter/PublicFooter";

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;

  const [tenant, setTenant] = useState<AppTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuItems] = useLocalStorage<AppMenuItem[]>(STORAGE_KEYS.MENU, []);

  // Filter available items only
  const availableMenu = menuItems.filter(item => item.isAvailable);

  useEffect(() => {
    if (tenantId) {
      const tenants = getStoredTenants();
      const found = tenants.find(t => t.tenantId === tenantId);
      setTenant(found || null);
      setLoading(false);
    }
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-page text-text-primary flex-col gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
        <p className="font-semibold text-text-secondary">Loading restaurant experience...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex h-screen items-center justify-center bg-page text-text-primary flex-col gap-4">
        <h2 className="text-2xl font-bold text-red-500">Restaurant Not Found</h2>
        <p className="text-text-secondary">We could not find the restaurant you are looking for.</p>
        <button 
          onClick={() => router.push('/')}
          className="rounded-xl bg-primary px-6 py-2.5 font-bold text-white hover:bg-primary/90 transition-all active:scale-95"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const heroImage = tenant.bannerUrl || tenant.logoUrl || (tenant.galleryUrls?.[0]) || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen bg-page text-text-primary pb-32">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full flex items-end">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Gradient Overlay matching bg-page */}
        <div className="absolute inset-0 bg-gradient-to-t from-page via-page/60 to-transparent z-10" />
        
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4 backdrop-blur-sm">
            Premium Experience
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight mb-2 drop-shadow-lg">
            {tenant.restaurantName}
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-6 font-medium">
            {tenant.tagline || "Experience the finest dining in town"}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2 backdrop-blur-md shadow-sm">
              <MapPin size={18} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary">{tenant.city}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2 backdrop-blur-md shadow-sm">
              <Star size={18} className="fill-amber-500 text-amber-500" />
              <span className="text-sm font-semibold text-text-primary">{tenant.rating} / 5</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2 backdrop-blur-md shadow-sm">
              <Utensils size={18} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary">₹{tenant.costForTwo} for two</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-16">
        
        {/* Description */}
        {tenant.description && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <h2 className="mb-6 flex items-center gap-3 border-b border-border pb-3 text-2xl font-bold text-text-primary">
              <Info className="text-primary" size={24} /> About Us
            </h2>
            <p className="text-lg leading-relaxed text-text-secondary max-w-4xl">
              {tenant.description}
            </p>
          </section>
        )}

        {/* Special Offers */}
        {tenant.offers && tenant.offers.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <h2 className="mb-6 flex items-center gap-3 border-b border-border pb-3 text-2xl font-bold text-text-primary">
              <Tag className="text-primary" size={24} /> Special Offers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenant.offers.map((offer, idx) => (
                <div key={idx} className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xl font-black text-primary">
                    %
                  </div>
                  <div className="font-semibold text-text-primary text-lg leading-tight">
                    {offer}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Menu Section */}
        {availableMenu && availableMenu.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 mb-12">
            <h2 className="mb-6 flex items-center gap-3 border-b border-border pb-3 text-2xl font-bold text-text-primary">
              <ClipboardList className="text-primary" size={24} /> Our Menu
            </h2>
            <div className="flex flex-wrap gap-3">
              {availableMenu.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <span className="font-semibold text-text-primary">{item.name}</span>
                  <span className="text-sm font-bold text-primary">₹{item.price}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Items */}
        {tenant.featuredItems && tenant.featuredItems.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <h2 className="mb-6 flex items-center gap-3 border-b border-border pb-3 text-2xl font-bold text-text-primary">
              <Star className="text-primary" size={24} /> Featured Delicacies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tenant.featuredItems.map((item, idx) => (
                <div key={idx} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 text-xl font-bold text-text-primary">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-text-secondary line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {tenant.galleryUrls && tenant.galleryUrls.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
            <h2 className="mb-6 flex items-center gap-3 border-b border-border pb-3 text-2xl font-bold text-text-primary">
              <ImageIcon className="text-primary" size={24} /> Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tenant.galleryUrls.map((url, idx) => (
                <div key={idx} className="group aspect-square overflow-hidden rounded-xl border border-border bg-card">
                  <img 
                    src={url} 
                    alt={`Gallery ${idx}`} 
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 cursor-pointer" 
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <PublicFooter />

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-header/90 backdrop-blur-xl p-4 sm:p-6 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => router.push(`/reservations/book?tenant=${tenantId}`)}
          className="flex w-full sm:w-[320px] items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-black text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-1 hover:bg-primary-hover hover:shadow-[0_12px_25px_rgba(99,102,241,0.4)] active:translate-y-0"
        >
          <Calendar size={22} />
          <span>Book a Table</span>
        </button>
      </div>
    </div>
  );
}
