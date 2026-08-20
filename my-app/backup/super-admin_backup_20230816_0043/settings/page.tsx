import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <Card style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
        <CardHeader>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>System Settings</h1>
        </CardHeader>
        <CardContent>
          <p>Configure platform-wide settings, feature toggles, and integrations here.</p>
        </CardContent>
      </Card>
    </main>
  );
}
