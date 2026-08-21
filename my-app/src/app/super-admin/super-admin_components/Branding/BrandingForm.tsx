"use client";

import React from "react";
import { TenantBranding } from "../../super-admin_types/branding_types";

interface Props {
  branding: TenantBranding;
  isSaving: boolean;
  onUpdate: (updates: Partial<TenantBranding>) => void;
  onSave: () => void;
}

export default function BrandingForm({ branding, isSaving, onUpdate, onSave }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
        <div>
          <h2 className="text-[18px] font-bold text-primary">White-Label Configuration</h2>
          <p className="text-[14px] text-secondary">Customize the look and feel of the tenant platform.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={branding.isWhiteLabelEnabled}
            onChange={(e) => onUpdate({ isWhiteLabelEnabled: e.target.checked })}
          />
          <div className="w-11 h-6 bg-secondary/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          <span className="ml-3 text-[14px] font-medium text-primary">
            {branding.isWhiteLabelEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      <div className={`flex flex-col gap-6 ${!branding.isWhiteLabelEnabled && 'opacity-50 pointer-events-none'}`}>
        <div>
          <label className="block text-[14px] font-medium text-primary mb-1">
            Custom CNAME Domain
          </label>
          <div className="flex items-center">
            <span className="bg-background border border-r-0 border-border rounded-l-md px-3 py-2 text-secondary text-[14px]">
              https://
            </span>
            <input 
              type="text" 
              value={branding.customDomain}
              onChange={(e) => onUpdate({ customDomain: e.target.value })}
              placeholder="pos.yourcompany.com"
              className="flex-1 bg-background border border-border rounded-r-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary"
            />
          </div>
          <p className="text-[12px] text-secondary mt-1">Make sure to point your DNS CNAME record to our servers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[14px] font-medium text-primary mb-1">
              Platform Logo URL
            </label>
            <input 
              type="text" 
              value={branding.logoUrl}
              onChange={(e) => onUpdate({ logoUrl: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary"
            />
            {branding.logoUrl && (
              <div className="mt-4 p-4 border border-border rounded-md bg-background flex items-center justify-center">
                <img src={branding.logoUrl} alt="Tenant Logo" className="max-h-12 object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[14px] font-medium text-primary mb-1">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={branding.primaryColor}
                onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                className="h-10 w-20 cursor-pointer bg-background border border-border rounded-md"
              />
              <input 
                type="text" 
                value={branding.primaryColor}
                onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary font-mono uppercase"
              />
            </div>
            
            <div className="mt-4 p-4 border border-border rounded-md">
              <p className="text-[12px] text-secondary mb-2">Preview:</p>
              <button 
                className="w-full text-white py-2 rounded-md font-medium text-[14px] transition-opacity hover:opacity-90"
                style={{ backgroundColor: branding.primaryColor }}
              >
                Sample Action Button
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex justify-end">
        <button 
          onClick={onSave}
          disabled={isSaving || !branding.isWhiteLabelEnabled}
          className="bg-primary text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
