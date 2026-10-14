/**
 * Hook for managing online/offline state and mutation sync queue
 */

import { useState, useEffect, useCallback } from 'react';
import type { OfflineSyncQueueItem } from '../types';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingQueue, setPendingQueue] = useState<OfflineSyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enqueueMutation = useCallback(
    (actionType: OfflineSyncQueueItem['actionType'], payload: Record<string, unknown>) => {
      const item: OfflineSyncQueueItem = {
        clientActionId: crypto.randomUUID(),
        actionType,
        payload,
        createdAt: Date.now(),
        syncStatus: 'PENDING',
        retryCount: 0,
      };

      setPendingQueue((prev) => [...prev, item]);
      return item;
    },
    []
  );

  const triggerSync = useCallback(async () => {
    if (!isOnline || pendingQueue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    try {
      // In production, ApiService.syncBatch(pendingQueue)
      // For now, simulate successful drain
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPendingQueue([]);
    } catch (err) {
      console.error('Offline sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, pendingQueue, isSyncing]);

  useEffect(() => {
    if (isOnline && pendingQueue.length > 0) {
      triggerSync();
    }
  }, [isOnline, pendingQueue.length, triggerSync]);

  return {
    isOnline,
    pendingCount: pendingQueue.length,
    isSyncing,
    enqueueMutation,
    triggerSync,
  };
}
