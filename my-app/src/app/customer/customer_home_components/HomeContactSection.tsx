"use client";

// RESPONSIBILITY: Contact Us section with restaurant address, operating hours, phone, and inquiry form.
// DATA FLOW: Form inputs → HomeContactSection.tsx → confirmation feedback

import React, { useState } from "react";
import { MapPin, Phone, Clock, Mail, Send, CheckCircle2 } from "lucide-react";

export function HomeContactSection(): React.JSX.Element {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setName("");
      setPhone("");
      setMessage("");
      setIsSubmitted(false);
    }, 2500);
  };

  return (
    <section id="contact" className="py-16 bg-page border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Get In Touch</span>
          <h2 className="mt-1 text-2xl font-black text-text-primary sm:text-4xl">
            Location, Hours & Inquiries
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary">
            Visit our restaurant or drop us a message for table reservations and party bookings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column: Details */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Restaurant Address</h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  Royal Spice Bistro, Ground Floor, Grand Galleria Mall, MG Road, Connaught Place, New Delhi — 110001
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Operating Hours</h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  Monday – Sunday: 11:00 AM – 11:30 PM (Non-Stop Service)
                  <br />
                  Happy Hours: 04:00 PM – 07:00 PM (Beverages 20% OFF)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                <Phone size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Direct Helpline & Reservations</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Phone: <strong className="text-text-primary">+91 98765 43210</strong>
                  <br />
                  Email: <strong className="text-text-primary">reservations@royalspicebistro.com</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-text-primary">Send Quick Message</h3>
            <p className="mt-1 text-xs text-text-secondary mb-4">
              Have a question or custom catering request? Send us a message below.
            </p>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={40} className="text-success mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-text-primary">Message Sent Successfully!</h4>
                <p className="text-xs text-text-secondary mt-1">Our team will call you back shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-text-secondary uppercase">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ankit Sharma"
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-text-secondary uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-text-secondary uppercase">Message / Request</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about table booking or party requirements..."
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-bold text-white shadow-sm hover:bg-primary-hover transition-all"
                >
                  <Send size={14} />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
