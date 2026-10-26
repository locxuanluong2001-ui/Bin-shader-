import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Smartphone, Download, Check, X, Share2 } from 'lucide-react';

interface PWAInstallButtonProps {
  lang: 'vi' | 'en';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside standalone app, hide button
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
        <Check className="w-3.5 h-3.5" />
        <span>{lang === 'vi' ? 'Đã cài đặt' : 'Installed'}</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions for browser menu
      alert(
        lang === 'vi'
          ? 'Để cài đặt ứng dụng về máy Android: Bấm vào menu 3 chấm (⋮) ở góc trên trình duyệt ➜ chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính". Ứng dụng sẽ hoạt động offline 100%!'
          : 'To install on Android: Tap the 3 dots menu (⋮) in your browser ➜ tap "Install app" or "Add to Home screen". Works 100% offline!'
      );
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/20"
        title={lang === 'vi' ? 'Cài đặt ứng dụng lên máy để dùng hoàn toàn Offline' : 'Install app for 100% offline use'}
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span>{lang === 'vi' ? 'Cài đặt Offline' : 'Install Offline App'}</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Cài đặt trên iOS / Safari</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              1. Chạm vào nút <strong>Chia sẻ (Share)</strong> trên thanh công cụ Safari.<br />
              2. Kéo xuống và chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.<br />
              3. Ứng dụng sẽ xuất hiện như app độc lập và chạy offline 100%.
            </p>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
