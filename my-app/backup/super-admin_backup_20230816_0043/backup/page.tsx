"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminData } from '@/app/admin/admin_hooks/useAdminData';

export default function BackupPage() {
  const { exportBackup, importRestore, emergencyReset, isExporting, isImporting, isResetting } = useAdminData();
  const [resetPin, setResetPin] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleImport = async () => {
    if (importFile) {
      await importRestore(importFile);
      setImportFile(null);
    }
  };

  const handleReset = () => {
    const success = emergencyReset(resetPin);
    if (success) {
      alert('System reset completed');
    } else {
      alert('Invalid PIN');
    }
    setResetPin('');
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-white/10 backdrop-blur-lg p-6 shadow-lg flex flex-col gap-6">
      <Card className="bg-white/10 backdrop-blur-lg border border-primary/20 rounded-xl p-4">
        <CardHeader>
          <h1 className="text-2xl font-bold text-primary">System Backup & Restore</h1>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Initiate data backups, view backup history, and restore previous snapshots of the platform.
          </p>
          {/* Export Backup */}
          <Button
            variant="primary"
            onClick={exportBackup}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? 'Exporting...' : 'Export Backup'}
          </Button>

          {/* Import Backup */}
          <div className="flex flex-col gap-2">
            <Input
              type="file"
              accept="application/json"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            />
            <Button
              variant="secondary"
              onClick={handleImport}
              disabled={!importFile || isImporting}
            >
              {isImporting ? 'Importing...' : 'Import Backup'}
            </Button>
          </div>

          {/* Emergency Reset */}
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              placeholder="Enter admin PIN"
              value={resetPin}
              onChange={(e) => setResetPin(e.target.value)}
            />
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={isResetting || resetPin.length === 0}
            >
              {isResetting ? 'Resetting...' : 'Emergency Reset'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
