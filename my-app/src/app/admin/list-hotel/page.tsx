"use client";

import React, { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Star, ShieldCheck, MapPin, Tag, Plus, Trash2, Camera } from "lucide-react";
import { getStoredTenants, saveTenants } from "@/lib/tenantService";
import { useAuth } from "@/app/auth/auth_hooks/useAuth";
import { dispatchNotification } from "@/lib/notificationService";
import type { AppTenant, AppTenantSpecialItem } from "@/types/appTypes";

export default function ListHotelPage() {
  const { currentUser } = useAuth();
  const [activeTenant, setActiveTenant] = useState<AppTenant | null>(null);
  
  const [descriptionInput, setDescriptionInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [specialtiesInput, setSpecialtiesInput] = useState("");
  const [offersInput, setOffersInput] = useState("");
  const [featuredItems, setFeaturedItems] = useState<AppTenantSpecialItem[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const all = getStoredTenants();
    const myTenant = all.find(t => t.ownerId === currentUser.id);
    if (myTenant) {
      setActiveTenant(myTenant);
      setDescriptionInput(myTenant.description || "");
      const defaultGalleryArray = [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80"
      ];
      
      const existingGallery = myTenant.galleryUrls || [];
      const combinedGallery = Array.from(new Set([...existingGallery, ...defaultGalleryArray]));
      
      setGalleryInput(combinedGallery.join(",\n"));
      setAmenitiesInput(myTenant.amenities?.join(", ") || "Free WiFi, AC, Parking, Premium Dining, Valet, Live Music");
      setSpecialtiesInput(myTenant.specialties?.join(", ") || "Signature Biryani, Paneer Tikka, Dal Makhani");
      setOffersInput(myTenant.offers?.join(", ") || "20% off on all main courses, Free welcome drink for couples");
      
      const defaultFeatured = [
        {
          name: "Royal Chicken Biryani",
          description: "Slow-cooked authentic basmati rice with tender marinated chicken.",
          imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
        },
        {
          name: "Paneer Butter Masala",
          description: "Rich and creamy tomato gravy with soft cottage cheese cubes.",
          imageUrl: "https://images.unsplash.com/photo-1551881192-002d02cb12d9?auto=format&fit=crop&w=800&q=80"
        },
        {
          name: "Sizzling Brownie",
          description: "Hot chocolate brownie served with cold vanilla ice cream.",
          imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
        },
        {
          name: "Tandoori Platter",
          description: "Assorted kebabs and tikkas fresh from the tandoor.",
          imageUrl: "https://images.unsplash.com/photo-1599487405270-8e7d23d85bc2?auto=format&fit=crop&w=800&q=80"
        }
      ];

      setFeaturedItems(myTenant.featuredItems && myTenant.featuredItems.length > 0 ? 
        // If they have existing items, just keep them, but if they only have the previous 2, let's merge.
        (myTenant.featuredItems.length < 4 ? [...myTenant.featuredItems, ...defaultFeatured.slice(myTenant.featuredItems.length)] : myTenant.featuredItems) 
        : defaultFeatured
      );
    }
  }, [currentUser]);

  const handleSave = () => {
    if (!activeTenant) return;
    setIsSaving(true);

    const all = getStoredTenants();
    const updated = all.map(t => {
      if (t.tenantId === activeTenant.tenantId) {
        return {
          ...t,
          description: descriptionInput,
          galleryUrls: galleryInput.split(",").map(s => s.trim()).filter(Boolean),
          amenities: amenitiesInput.split(",").map(s => s.trim()).filter(Boolean),
          specialties: specialtiesInput.split(",").map(s => s.trim()).filter(Boolean),
          offers: offersInput.split(",").map(s => s.trim()).filter(Boolean),
          featuredItems: featuredItems,
          isListed: true,
        };
      }
      return t;
    });

    saveTenants(updated);
    
    dispatchNotification({
      role: "HOTEL_OWNER",
      type: "GENERIC_INFO",
      title: "Listing Updated 🌟",
      message: "Your hotel profile has been enriched and is live on the marketplace! 🚀",
      route: "/admin/list-hotel",
      playSound: true,
      soundType: "READY",
    });

    setTimeout(() => setIsSaving(false), 600);
  };

  const addFeaturedItem = () => {
    setFeaturedItems([...featuredItems, { name: "", description: "", imageUrl: "" }]);
  };

  const updateFeaturedItem = (index: number, field: keyof AppTenantSpecialItem, value: string) => {
    const updated = [...featuredItems];
    updated[index] = { ...updated[index], [field]: value };
    setFeaturedItems(updated);
  };

  const removeFeaturedItem = (index: number) => {
    setFeaturedItems(featuredItems.filter((_, i) => i !== index));
  };

  if (!activeTenant) {
    return <div className="p-8 text-center text-text-secondary">Loading profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Enrich Hotel Profile</h1>
          <p className="text-sm text-text-secondary mt-1">Add rich details to impress your customers on the marketplace.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <Save size={18} />
          <span>{isSaving ? "Saving..." : "Publish & Save"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Core Info & General Description */}
        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-3">
              <MapPin size={20} className="text-primary" /> Core Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Restaurant Name</label>
                <p className="font-bold text-text-primary text-lg mt-1">{activeTenant.restaurantName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary">Tagline</label>
                <p className="font-medium text-text-primary mt-1">{activeTenant.tagline || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary">Address</label>
                <p className="font-medium text-text-primary mt-1">{activeTenant.address}, {activeTenant.city}</p>
              </div>
              <p className="text-[11px] font-bold text-primary bg-primary/10 p-2.5 rounded-lg mt-4 border border-primary/20">
                Core information is managed during initial onboarding.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-success" /> About & Amenities
            </h2>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Rich Description</label>
                <textarea 
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl p-3 text-sm text-text-primary min-h-[120px] focus:outline-none focus:border-primary"
                  placeholder="Welcome to our wonderful restaurant... Tell your story!"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Amenities (Comma separated)</label>
                <input 
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-primary"
                  placeholder="e.g. Valet Parking, Free WiFi"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visuals & Offers */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
              <ImageIcon size={20} className="text-primary" /> Visual Gallery
            </h2>
            <p className="text-xs text-text-secondary mb-4">Impress customers with photos of your tables, kitchen, cashier, and ambiance. Add URLs separated by commas.</p>
            <textarea 
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              className="w-full bg-input border border-border rounded-xl p-3 text-sm text-text-primary min-h-[100px] focus:outline-none focus:border-primary"
              placeholder="https://image1.jpg, https://image2.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Tag size={20} className="text-rose-500" /> Special Offers
              </h2>
              <p className="text-xs text-text-secondary mb-3">Comma separated offers.</p>
              <textarea 
                value={offersInput}
                onChange={(e) => setOffersInput(e.target.value)}
                className="w-full bg-input border border-border rounded-xl p-3 text-sm text-text-primary min-h-[80px] focus:outline-none focus:border-primary"
                placeholder="20% off on weekends, Free dessert with thali"
              />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Star size={20} className="text-amber-500" /> Signature Specialties
              </h2>
              <p className="text-xs text-text-secondary mb-3">Comma separated dishes.</p>
              <textarea 
                value={specialtiesInput}
                onChange={(e) => setSpecialtiesInput(e.target.value)}
                className="w-full bg-input border border-border rounded-xl p-3 text-sm text-text-primary min-h-[80px] focus:outline-none focus:border-primary"
                placeholder="Hyderabadi Dum Biryani, Filter Coffee"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Camera size={20} className="text-primary" /> Featured Items
              </h2>
              <button 
                onClick={addFeaturedItem}
                className="flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <p className="text-xs text-text-secondary mb-4">Highlight your signature dishes with images and descriptions to entice customers.</p>
            
            {featuredItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-xl text-text-muted text-sm font-medium">
                No featured items added yet. Click "Add Item" to start.
              </div>
            ) : (
              <div className="space-y-4">
                {featuredItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-xl bg-surface/50 relative group">
                    <button 
                      onClick={() => removeFeaturedItem(index)}
                      className="absolute top-3 right-3 text-text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="w-full sm:w-1/3 flex-shrink-0">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">Image URL</label>
                      <input 
                        type="text"
                        value={item.imageUrl}
                        onChange={(e) => updateFeaturedItem(index, 'imageUrl', e.target.value)}
                        className="w-full bg-input border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                        placeholder="https://..."
                      />
                      {item.imageUrl && (
                        <div className="mt-2 h-20 rounded-lg overflow-hidden border border-border">
                          <img src={item.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full sm:w-2/3 space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">Item Name</label>
                        <input 
                          type="text"
                          value={item.name}
                          onChange={(e) => updateFeaturedItem(index, 'name', e.target.value)}
                          className="w-full bg-input border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-primary font-bold"
                          placeholder="e.g. Royal Chicken Biryani"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">Short Description</label>
                        <input 
                          type="text"
                          value={item.description || ""}
                          onChange={(e) => updateFeaturedItem(index, 'description', e.target.value)}
                          className="w-full bg-input border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                          placeholder="Aromatic basmati rice cooked with tender chicken..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
