"use client";

// RESPONSIBILITY: Franchise Owner Branch Management Page.
// Displays all restaurants owned by this Franchise Admin.

import React from "react";
import { Store, Plus, ArrowRight } from "lucide-react";

export default function AdminBranchesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Branches</h1>
          <p className="text-slate-400">Manage all your restaurant locations</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
          <Plus className="h-4 w-4" />
          Add New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Branch Cards */}
        {[
          { id: "T-001", name: "Downtown Branch", status: "Active", revenue: "$4,250 today" },
          { id: "T-002", name: "Airport Terminal", status: "Active", revenue: "$8,120 today" },
          { id: "T-003", name: "City Mall", status: "Maintenance", revenue: "$0 today" },
        ].map((branch) => (
          <div key={branch.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                <Store className="h-6 w-6" />
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                branch.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {branch.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-1">{branch.name}</h3>
            <p className="text-sm text-slate-400 mb-6">Tenant ID: {branch.id}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div>
                <p className="text-xs text-slate-500 mb-1">Revenue</p>
                <p className="text-sm font-medium text-slate-300">{branch.revenue}</p>
              </div>
              
              <button className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Manage
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
