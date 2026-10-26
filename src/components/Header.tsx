import React from 'react';
import { Sparkles, HelpCircle, Layers, Download, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  onLoadSample: (type: 'RenderChunk' | 'Sky') => void;
  onOpenGuide: () => void;
  onOpenVersionInfo: () => void;
  onOpenApkModal: () => void;
  lang: 'vi' | 'en';
  setLang: (lang: 'vi' | 'en') => void;
  hasActiveMaterial: boolean;
  onExportBin: () => void;
  onExportZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onOpenGuide,
  onOpenVersionInfo,
  onOpenApkModal,
  lang,
  setLang,
  hasActiveMaterial,
  onExportBin,
  onExportZip,
}) => {
  return (
    <header className="border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Lazurite Web
              </h1>
              <button
                onClick={onOpenVersionInfo}
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                title={lang === 'vi' ? 'Xem thông tin phiên bản v22-v26' : 'View version details'}
              >
                v22–v26 • RenderDragon
              </button>
              <button
                onClick={onOpenVersionInfo}
                className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                title={lang === 'vi' ? 'Hỗ trợ Android ESSL 3.10 / 3.20' : 'Android ESSL 3.10 / 3.20 supported'}
              >
                Android ESSL
              </button>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {lang === 'vi'
                ? 'Công cụ xử lý, giải nén & đóng gói Shader .bin không cần lệnh'
                : 'Minecraft Bedrock Shader Bin Unpacker & Repacker without CLI'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick samples dropdown / buttons */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'vi' ? 'Thử mẫu:' : 'Sample:'}
            </span>
            <button
              onClick={() => onLoadSample('RenderChunk')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors font-medium cursor-pointer"
              title="Khối terrain, cây cỏ, nước (RenderChunk.material.bin)"
            >
              RenderChunk.bin
            </button>
            <button
              onClick={() => onLoadSample('Sky')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 transition-colors font-medium cursor-pointer"
              title="Bầu trời và sương mù (Sky.material.bin)"
            >
              Sky.bin
            </button>
          </div>

          {/* Version Info Button */}
          <button
            onClick={onOpenVersionInfo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
            title={lang === 'vi' ? 'Xem các phiên bản hỗ trợ' : 'View supported versions'}
          >
            <span className="text-cyan-400 font-mono font-bold">v22–v26</span>
            <span className="hidden lg:inline">{lang === 'vi' ? 'Phiên bản' : 'Versions'}</span>
          </button>

          {/* PWA / APK Action Buttons */}
          <PWAInstallButton lang={lang} />

          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/20"
            title={lang === 'vi' ? 'Tải tệp .APK hoặc cài App Android' : 'Download Android APK'}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'vi' ? 'Tải APK' : 'Get APK'}</span>
          </button>

          {/* Android Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">
              {lang === 'vi' ? 'Hướng dẫn' : 'Guide'}
            </span>
          </button>

          {/* Quick Export Bin if material loaded */}
          {hasActiveMaterial && (
            <button
              onClick={onExportBin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/25 transition-all cursor-pointer"
              title={lang === 'vi' ? 'Đóng gói & tải về .material.bin' : 'Pack and download .material.bin'}
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-bold">{lang === 'vi' ? 'Xuất .bin' : 'Export .bin'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            title="Đổi ngôn ngữ / Change language"
          >
            {lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </button>
        </div>
      </div>
    </header>
  );
};
