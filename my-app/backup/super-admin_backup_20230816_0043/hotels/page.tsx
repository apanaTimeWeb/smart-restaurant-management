"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { getStoredTenants } from '@/lib/tenantService';
// removed custom CSS import

export default function HotelsPage() {
  const [tenants, setTenants] = useState([] as any[]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const data = getStoredTenants();
    setTenants(data);
  }, []);

  const filtered = tenants.filter((t) =>
    t.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
      <Card className="relative overflow-hidden rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm max-w-6xl mx-auto">
        <CardHeader>
          <h1 className="text-2xl font-bold text-text-primary">Hotel List</h1>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64 mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotel, city, owner…"
              className="w-full rounded-xl border border-border bg-input py-2 pl-9 pr-3 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-[11px] font-black uppercase tracking-wider text-text-secondary">
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Owner & Phone</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-muted">No matching hotels found.</td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.tenantId} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-text-primary">
                        <div className="flex items-center gap-3">
                          <img src={t.logoUrl} alt={t.restaurantName} className="h-9 w-9 rounded-xl object-cover border border-border" />
                          <div>
                            <p className="font-extrabold text-text-primary">{t.restaurantName}</p>
                            <p className="text-[10px] text-text-muted font-mono">{t.tenantId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-text-secondary">{t.city}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-text-primary">{t.ownerName}</p>
                        <p className="text-[10px] text-text-muted">{t.ownerPhone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                              : t.status === 'APPROVAL_PENDING'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse'
                              : t.status === 'SUSPENDED'
                              ? 'bg-red-500/10 border-red-500/30 text-red-500'
                              : 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
