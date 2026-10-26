import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { WifiOff, Wifi } from 'lucide-react';

interface OfflineIndicatorProps {
  lang: 'vi' | 'en';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>{lang === 'vi' ? 'Hỗ trợ Offline 100%' : '100% Offline Ready'}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-amber-500/40 px-3.5 py-2 text-xs font-semibold text-amber-300 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>
        {lang === 'vi'
          ? 'Chế độ Offline — Ứng dụng đang xử lý shader hoàn toàn trên máy của bạn không cần mạng.'
          : 'Offline Mode — Shader processing continues entirely on your device without internet.'}
      </span>
    </div>
  );
};
