"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Settings2, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Platform Settings</h1>
            <p className="text-[12px] text-text-secondary">Configure global variables, pricing, and system defaults.</p>
          </div>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[14px] font-medium text-white hover:bg-primary-hover hover:-translate-y-0.5 transition-all">
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-6 flex flex-col gap-8">
        {/* Section 1 */}
        <div>
          <h2 className="text-[16px] font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Settings2 size={18} className="text-primary" /> Core Setup
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-text-secondary mb-1">Platform Name <span className="text-danger">*</span></label>
              <input type="text" defaultValue="SMART LIB 360" className="w-full bg-input border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-text-secondary mb-1">Support Email</label>
              <input type="email" defaultValue="support@smartlib360.com" className="w-full bg-input border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus" />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Section 2 */}
        <div>
          <h2 className="text-[16px] font-semibold text-text-primary mb-4">SaaS Pricing Config</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-text-secondary mb-1">Annual Fee (₹)</label>
              <input type="number" defaultValue={2999} className="w-full bg-input border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus" />
              <p className="text-[12px] text-text-secondary mt-1">Default price billed to tenants.</p>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-text-secondary mb-1">Master GSTIN</label>
              <input type="text" defaultValue="27AADCB2230M1Z2" className="w-full bg-input border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
