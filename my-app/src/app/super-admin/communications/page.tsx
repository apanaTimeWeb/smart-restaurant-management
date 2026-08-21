import React from 'react';

export default function SuperAdminCommunicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-primary">Communication Logs</h1>
        <p className="text-[14px] text-secondary mt-1">Master log for debugging all sent Emails, SMS, and WhatsApp messages.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
        <p className="text-secondary text-[14px]">Communication deliverability logs coming soon.</p>
      </div>
    </div>
  );
}
