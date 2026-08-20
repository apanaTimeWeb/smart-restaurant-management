import React from "react";
import Link from "next/link";
import { UtensilsCrossed, Globe, Share2, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card text-text-primary pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8 lg:gap-12">
          
          {/* Brand & About */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 text-white shadow-md">
                <UtensilsCrossed size={22} />
              </div>
              <span className="font-black text-xl tracking-tight text-text-primary">
                Smart POS 360
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed mt-2">
              The ultimate Multi-City Enterprise Marketplace & POS SaaS. Revolutionizing restaurant management with zero-wait pre-ordering, cloud billing, and live kitchen displays.
            </p>
            <div className="flex items-center gap-4 mt-4 text-text-muted">
              <a href="#" className="hover:text-primary transition-colors"><Globe size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Share2 size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><MessageCircle size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm mb-2">Platform</h3>
            <Link href="/" className="text-sm text-text-secondary hover:text-primary transition-colors">Find Restaurants</Link>
            <Link href="/owner/register" className="text-sm text-text-secondary hover:text-primary transition-colors">List Your Restaurant</Link>
            <Link href="/auth/login" className="text-sm text-text-secondary hover:text-primary transition-colors">Partner Login</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Pricing & Plans</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">API Documentation</Link>
          </div>

          {/* Legal & Support */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm mb-2">Legal & Support</h3>
            <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Refund Policy</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Help Center</Link>
            <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Contact Support</Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm mb-2">Contact Us</h3>
            <div className="flex items-start gap-3 text-sm text-text-secondary">
              <MapPin size={18} className="shrink-0 text-primary" />
              <span>123 Innovation Drive, Tech Park,<br />Bengaluru, KA 560001, India</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary mt-2">
              <Phone size={18} className="shrink-0 text-primary" />
              <span>+91 800 123 4567</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary mt-2">
              <Mail size={18} className="shrink-0 text-primary" />
              <span>support@smartpos360.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-disabled font-medium">
            © {new Date().getFullYear()} Smart POS 360 SaaS. All rights reserved.
          </p>
          <p className="text-xs text-text-disabled">
            Powered by Smart Restaurant Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
