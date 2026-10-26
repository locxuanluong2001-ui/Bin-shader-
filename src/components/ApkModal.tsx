import React from 'react';
import { X, Smartphone, Download, CheckCircle2, Zap, ShieldCheck, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface ApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const ApkModal: React.FC<ApkModalProps> = ({ isOpen, onClose, lang }) => {
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  const handlePWAInstall = async () => {
    if (isInstallable) {
      await install();
    } else {
      alert(
        lang === 'vi'
          ? 'Cách cài nhanh nhất trên Android:\n1. Bấm vào nút Menu 3 chấm (⋮) ở góc trên bên phải trình duyệt Chrome/Cốc Cốc.\n2. Chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính".\nỨng dụng sẽ xuất hiện như App độc lập và chạy 100% offline!'
          : 'To install on Android:\n1. Tap the 3-dots menu (⋮) in your browser.\n2. Select "Install app" or "Add to Home screen".'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/25">
            <Smartphone className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {lang === 'vi' ? 'Cài đặt App lên Android' : 'Install on Android'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'vi'
                ? 'Tải tệp .APK trực tiếp hoặc cài đặt 1 chạm chạy Offline 100%'
                : 'Direct .APK download or 1-tap offline home screen install'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Option 1: Direct APK Download Link */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {lang === 'vi' ? 'Tải trực tiếp tệp .APK (Khuyên dùng)' : 'Direct .APK Download'}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                lazurite.apk
              </span>
            </div>

            <p className="text-slate-300 mb-3 text-xs leading-relaxed">
              {lang === 'vi'
                ? 'Bấm nút dưới đây để tải trực tiếp tệp .APK cài đặt về máy (tải thẳng từ ứng dụng, không cần thông qua bất kỳ trang web trung gian nào):'
                : 'Download the standalone .APK package directly to your Android device:'}
            </p>

            <a
              href="/Lazurite-Shader-Studio.apk"
              download="Lazurite-Shader-Studio.apk"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === 'vi' ? 'TẢI TỆP .APK VỀ MÁY (7.3 MB)' : 'DOWNLOAD .APK FILE (7.3 MB)'}</span>
            </a>

            <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'vi' ? 'Cách cài đặt sau khi tải tệp .apk về:' : 'How to install after download:'}</span>
              </div>
              <p className="pl-5 text-slate-300">
                1. Mở tệp <strong>Lazurite-Shader-Studio.apk</strong> trong thư mục Download (bằng ZArchiver hoặc Trình quản lý tệp).
              </p>
              <p className="pl-5 text-slate-300">
                2. Nếu máy hỏi "Cho phép cài đặt từ nguồn này", chọn <strong>Cho phép (Allow)</strong>.
              </p>
              <p className="pl-5 text-slate-300">
                3. Bấm <strong>Cài đặt (Install)</strong> ➜ App sẽ xuất hiện trên màn hình điện thoại!
              </p>
            </div>
          </div>

          {/* Option 2: WebAPK Direct Browser Install (No file needed, 0 MB, No virus warning) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-cyan-400 text-sm sm:text-base">
                  {lang === 'vi' ? 'Cách 2: Cài đặt WebAPK 1 chạm (Siêu nhẹ, không tốn bộ nhớ)' : 'Option 2: 1-Tap WebAPK (Zero storage)'}
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PWA
              </span>
            </div>

            <p className="text-slate-300 mb-3 text-xs leading-relaxed">
              {lang === 'vi'
                ? 'Tính năng chính thức của Google Android: Tự động biến trang web thành App độc lập trên màn hình chính, không bị Play Protect cảnh báo, không tốn dung lượng và chạy offline 100%:'
                : 'Official Google Android standard: Creates a native app icon on your home screen, 100% offline, zero storage overhead.'}
            </p>

            <button
              onClick={handlePWAInstall}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-cyan-400 fill-current" />
              <span>{lang === 'vi' ? 'CÀI ĐẶT WEBAPK VÀO MÀN HÌNH CHÍNH' : 'ADD WEBAPK TO HOME SCREEN'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'vi' ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
