import React, { useState, useEffect } from 'react';
import { Note, Highlight } from '../lib/types';

interface SyncManagerProps {
  notes: Note[];
  highlights: Highlight[];
  onSync: (data: SyncData) => void;
}

interface SyncData {
  notes: Note[];
  highlights: Highlight[];
  lastSyncTime: Date;
  deviceId: string;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  progress: number;
}

export const SyncManager: React.FC<SyncManagerProps> = ({
  notes,
  highlights,
  onSync,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    progress: 0,
  });
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5); // minutes

  useEffect(() => {
    if (autoSync) {
      const interval = setInterval(() => {
        handleSync();
      }, syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoSync, syncInterval]);

  const handleSync = async () => {
    if (syncStatus.isSyncing) return;

    setSyncStatus((prev) => ({
      ...prev,
      isSyncing: true,
      error: null,
      progress: 0,
    }));

    try {
      // Simulate sync progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSyncStatus((prev) => ({
          ...prev,
          progress: i,
        }));
      }

      const syncData: SyncData = {
        notes,
        highlights,
        lastSyncTime: new Date(),
        deviceId: 'device-' + Math.random().toString(36).substr(2, 9),
      };

      // This is a placeholder for the actual API call
      // You would need to implement the actual sync functionality
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncData),
      });

      onSync(syncData);

      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        progress: 100,
      }));
    } catch (error) {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Synchronization</h3>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleSync}
            disabled={syncStatus.isSyncing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="h-4 w-4 text-blue-500"
            />
            <label className="text-sm text-gray-700">Auto-sync</label>
          </div>
          {autoSync && (
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </select>
          )}
        </div>

        {syncStatus.isSyncing && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${syncStatus.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Syncing... {syncStatus.progress}%
            </p>
          </div>
        )}

        {syncStatus.error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {syncStatus.error}
          </div>
        )}

        {syncStatus.lastSyncTime && (
          <div className="text-sm text-gray-600">
            Last synced:{' '}
            {syncStatus.lastSyncTime.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}; 