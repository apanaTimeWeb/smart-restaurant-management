"use client";

// RESPONSIBILITY: Menu preview section showcasing authentic Indian dishes, pricing, and dietary badges.
// DATA FLOW: Renders menu category tabs & dishes grid.

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import { Star, Utensils, ArrowRight } from "lucide-react";

interface MenuItemPreview {
  id: string;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
  isSpecial: boolean;
  description: string;
}

const MENU_PREVIEW_ITEMS: MenuItemPreview[] = [
  { id: "m-01", name: "Paneer Tikka", price: 280, category: "Starters", isVeg: true, isSpecial: true, description: "Cottage cheese marinated in rich spices and clay-oven roasted." },
  { id: "m-02", name: "Veg Spring Roll", price: 160, category: "Starters", isVeg: true, isSpecial: false, description: "Crispy rolls stuffed with seasoned garden vegetables." },
  { id: "m-03", name: "Chicken Tikka", price: 320, category: "Starters", isVeg: false, isSpecial: true, description: "Tender chicken chunks marinated in yogurt & Kashmiri chili." },
  { id: "m-04", name: "Dal Makhani", price: 220, category: "Main Course", isVeg: true, isSpecial: false, description: "Slow-cooked black lentils in white butter and cream gravy." },
  { id: "m-05", name: "Shahi Paneer", price: 260, category: "Main Course", isVeg: true, isSpecial: true, description: "Paneer cubes simmered in creamy cashewnut and tomato gravy." },
  { id: "m-06", name: "Butter Chicken", price: 340, category: "Main Course", isVeg: false, isSpecial: true, description: "Iconic tandoori chicken chunks in velvety tomato butter gravy." },
  { id: "m-07", name: "Butter Naan", price: 40, category: "Breads", isVeg: true, isSpecial: false, description: "Traditional Indian flatbread brushed with rich melted butter." },
  { id: "m-08", name: "Mango Lassi", price: 120, category: "Beverages", isVeg: true, isSpecial: true, description: "Chilled yogurt smoothie blended with Alphonso mango pulp." },
  { id: "m-09", name: "Gulab Jamun", price: 80, category: "Desserts", isVeg: true, isSpecial: false, description: "Warm milk dumplings soaked in cardamom sugar syrup." },
];

export function HomeMenuPreviewSection(): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = ["ALL", "Starters", "Main Course", "Breads", "Beverages", "Desserts"];

  const filteredItems = MENU_PREVIEW_ITEMS.filter(
    (item) => activeCategory === "ALL" || item.category === activeCategory
  );

  return (
    <section id="menu" className="py-16 bg-page border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Culinary Masterpieces</span>
          <h2 className="mt-1 text-2xl font-black text-text-primary sm:text-4xl">
            Our Gourmet Menu & Chef Specials
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-2xl">
            Handcrafted with authentic spices, fresh local ingredients, and traditional tandoor techniques.
          </p>

          {/* Category Tabs Filter */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-primary/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-border-focus hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  {/* Veg / Non-Veg Indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-sm border p-0.5 ${
                        item.isVeg ? "border-success" : "border-danger"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${item.isVeg ? "bg-success" : "bg-danger"}`} />
                    </span>
                    <span className="text-xs font-bold text-text-primary">{item.name}</span>
                  </div>

                  {item.isSpecial && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2.5 py-0.5 text-[10px] font-bold text-warning">
                      <Star size={10} />
                      Chef Special
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-xs text-text-secondary leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-sm font-extrabold text-primary">{formatCurrency(item.price)}</span>
                <Link
                  href="/auth/customer-signup"
                  className="flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-primary transition-colors"
                >
                  <span>Pre-Order</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-10 text-center">
          <Link
            href="/auth/customer-signup"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition-all"
          >
            <Utensils size={14} />
            <span>Explore Full Menu & Pre-Book Dishes</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
