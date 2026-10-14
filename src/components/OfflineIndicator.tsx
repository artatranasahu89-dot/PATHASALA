/**
 * Offline Status Indicator & Sync Badge
 */

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onTriggerSync?: () => void;
}

export function OfflineIndicator({
  isOnline,
  pendingCount,
  isSyncing,
  onTriggerSync,
}: OfflineIndicatorProps) {
  if (isOnline && pendingCount === 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <Wifi className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">ଅନଲାଇନ୍</span>
        <span className="text-[10px] text-emerald-600 font-mono">(Online)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${
          isOnline
            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
        }`}
      >
        {isOnline ? (
          <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-rose-600" />
        )}

        <span>{isOnline ? 'ସିଙ୍କ୍ ବାକି ଅଛି' : 'ଅଫଲାଇନ୍ ମୋଡ୍'}</span>

        {pendingCount > 0 && (
          <span className="px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-full text-[10px] font-bold">
            {pendingCount}
          </span>
        )}
      </div>

      {isOnline && pendingCount > 0 && onTriggerSync && (
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="p-1 text-zinc-500 hover:text-teal-600 rounded-md transition"
          title="ଏବେ ସିଙ୍କ୍ କରନ୍ତୁ (Sync Now)"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}
