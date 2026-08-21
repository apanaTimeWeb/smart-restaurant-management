"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Shield, Filter, Download, Clock, CheckCircle2, AlertTriangle, AlertCircle, Eye } from "lucide-react";

export default function AuditPage() {
  const [search, setSearch] = useState("");

  const mockLogs = [
    {
      id: "LOG-0923",
      timestamp: "2026-08-21 14:32:10",
      user: "super.admin@system.com",
      action: "UPDATE_GLOBAL_SETTING",
      module: "Settings",
      severity: "WARNING",
      details: "Changed global tax rate from 18% to 5%"
    },
    {
      id: "LOG-0924",
      timestamp: "2026-08-21 12:15:00",
      user: "system.auto@pos.com",
      action: "TENANT_BACKUP_SUCCESS",
      module: "Database",
      severity: "INFO",
      details: "Automated full platform backup completed"
    },
    {
      id: "LOG-0925",
      timestamp: "2026-08-20 09:45:22",
      user: "super.admin@system.com",
      action: "SUSPEND_TENANT",
      module: "Tenants",
      severity: "CRITICAL",
      details: "Suspended tenant ID T-003 for non-payment"
    },
    {
      id: "LOG-0926",
      timestamp: "2026-08-19 16:20:05",
      user: "franchise.owner@spicy.com",
      action: "LOGIN_SUCCESS",
      module: "Auth",
      severity: "INFO",
      details: "Successful login from IP 192.168.1.45"
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'INFO':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success-bg text-success border border-success/30"><CheckCircle2 size={12} /> INFO</span>;
      case 'WARNING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning-bg text-warning border border-warning/30"><AlertTriangle size={12} /> WARN</span>;
      case 'CRITICAL':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-danger-bg text-danger border border-danger/30"><AlertCircle size={12} /> CRIT</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-info-bg text-info border border-info/30"><Clock size={12} /> LOG</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1">
          <Link href="/super-admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">Audit Logs</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">System Audit Logs</h1>
            <p className="text-[12px] text-text-secondary">Immutable chronological record of all global system events and administrative actions.</p>
          </div>
          <button className="flex items-center gap-2 rounded-md bg-card border border-border px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-border/50 transition-all duration-200">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content Card (Pattern 5b) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Action Bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50">
          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search user, action, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input border border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus rounded-md pl-9 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-secondary transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-input border border-border rounded-md px-3 py-2">
              <Filter size={16} className="text-text-secondary" />
              <select className="bg-transparent border-none text-[13px] text-text-primary focus:outline-none cursor-pointer">
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Info</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-input border border-border rounded-md px-3 py-2">
              <Clock size={16} className="text-text-secondary" />
              <select className="bg-transparent border-none text-[13px] text-text-primary focus:outline-none cursor-pointer">
                <option value="7D">Last 7 Days</option>
                <option value="30D">Last 30 Days</option>
                <option value="ALL">All Time</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-primary/5 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Module / Action</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-center">Severity</th>
                <th className="px-6 py-4 text-right">Raw</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-border/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-primary">{log.timestamp.split(' ')[0]}</p>
                    <p className="text-[12px] text-text-secondary">{log.timestamp.split(' ')[1]}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-[12px] text-text-secondary">{log.user}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-text-primary">{log.module}</p>
                    <p className="text-[12px] text-text-secondary truncate max-w-[200px]">{log.action}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-text-secondary truncate max-w-[300px]">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getSeverityBadge(log.severity)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-border text-text-secondary hover:text-primary transition-colors" title="View Raw JSON">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-[13px] text-text-secondary bg-card/50">
          <span>Showing 1 to {mockLogs.length} of 12,394 logs</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-border hover:bg-border disabled:opacity-50 transition-colors" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-border hover:bg-border disabled:opacity-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
