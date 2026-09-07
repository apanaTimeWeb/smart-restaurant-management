"use client";

import React, { useState } from 'react';
import { BroadcastPriority } from '../../super-admin_types/broadcasts_types';
import { Send, Calendar } from 'lucide-react';

interface Props {
  isSending: boolean;
  onSubmit: (data: { title: string, message: string, priority: BroadcastPriority, targetAudience: 'all' | 'active_only' | 'specific_tenants' }) => void;
}

export default function NewBroadcastForm({ isSending, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<BroadcastPriority>('info');
  const [targetAudience, setTargetAudience] = useState<'all' | 'active_only' | 'specific_tenants'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    onSubmit({ title, message, priority, targetAudience });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-[16px] font-bold text-primary mb-4">Compose Global Broadcast</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[13px] font-medium text-primary mb-1">Alert Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Scheduled System Maintenance"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-primary mb-1">Priority Level</label>
            <select 
              value={priority}
              onChange={e => setPriority(e.target.value as BroadcastPriority)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary"
            >
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Yellow)</option>
              <option value="critical">Critical (Red)</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-primary mb-1">Target Audience</label>
            <select 
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value as any)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary"
            >
              <option value="all">All Tenants</option>
              <option value="active_only">Active Tenants Only</option>
              <option value="specific_tenants">Specific Tenants (Manual)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-primary mb-1">Message Body</label>
          <textarea 
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Enter the alert content that will appear on tenant dashboards..."
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-[14px] text-primary focus:outline-none focus:border-primary min-h-[100px]"
            required
          />
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button 
            type="submit"
            disabled={isSending}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md text-[14px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {isSending ? 'Sending...' : 'Send Broadcast Now'}
          </button>
          <button 
            type="button"
            className="flex items-center gap-2 bg-background border border-border text-primary px-5 py-2 rounded-md text-[14px] font-medium hover:bg-border transition-colors"
          >
            <Calendar size={16} /> Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
