import React from 'react';
import { X, Smartphone, FolderCheck, ShieldCheck, Download, Terminal, Layers, ArrowRight } from 'lucide-react';

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Smartphone className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {lang === 'vi' ? 'Hướng dẫn cài đặt Shader cho Android' : 'Android Shader Installation Guide'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'vi'
                ? 'Cách sử dụng tệp .material.bin đã đóng gói vào Minecraft Bedrock Android'
                : 'How to install compiled .material.bin shaders into Minecraft Bedrock on Android'}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          {/* Method 1: The easiest way (.mcpack) */}
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-emerald-400 text-sm sm:text-base">
                {lang === 'vi' ? 'Cách 1: Dùng tệp .MCPACK (Khuyên dùng - Nhanh nhất)' : 'Method 1: Direct .MCPACK Install (Fastest)'}
              </h3>
            </div>
            <p className="text-slate-300 mb-2 leading-relaxed">
              {lang === 'vi'
                ? 'Trong ứng dụng này, bấm nút "Tạo gói .MCPACK". Ứng dụng sẽ tự động tạo gói Resource Pack hoàn chỉnh có chứa manifest.json và tệp shader.'
                : 'Click "Build .MCPACK" in this app. It generates a full Minecraft Resource Pack with manifest.json and the compiled shader bin.'}
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'vi'
                  ? 'Sau khi tải về, mở bằng ZArchiver hoặc Trình quản lý tệp và bấm vào tệp .mcpack ➜ Minecraft sẽ tự động mở và cài đặt!'
                  : 'Open the downloaded .mcpack file with ZArchiver or File Manager ➜ Minecraft will auto-launch and import!'}
              </span>
            </div>
          </div>

          {/* Method 2: Manual placement into resource_packs */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-cyan-400 text-sm sm:text-base">
                {lang === 'vi' ? 'Cách 2: Chép thủ công tệp .material.bin' : 'Method 2: Manual .material.bin placement'}
              </h3>
            </div>
            <p className="text-slate-300 mb-2 leading-relaxed">
              {lang === 'vi'
                ? 'Nếu bạn đã có sẵn gói Shader Resource Pack trên máy, đặt tệp .material.bin vào đúng đường dẫn sau:'
                : 'If you already have a shader resource pack folder, place the .material.bin file into:'}
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 break-all select-all">
              Android/data/com.mojang.minecraftpe/files/games/com.mojang/resource_packs/[Tên_Gói_Shader]/renderer/materials/
            </div>
            <p className="text-slate-400 text-[11px] mt-2">
              {lang === 'vi'
                ? 'Ví dụ: Đặt RenderChunk.material.bin vào thư mục renderer/materials/ để thay đổi đồ họa thế giới và nước.'
                : 'For example, put RenderChunk.material.bin inside renderer/materials/ to replace terrain graphics.'}
            </p>
          </div>

          {/* Android 11-15 Permission notice */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white text-xs sm:text-sm">
                {lang === 'vi' ? 'Lưu ý về thư mục Android/data trên Android 11, 12, 13, 14, 15' : 'Accessing Android/data on Android 11+'}
              </h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {lang === 'vi'
                ? 'Hệ điều hành Android mới thường khóa quyền truy cập trực tiếp vào Android/data. Bạn nên sử dụng ứng dụng "ZArchiver" hoặc "MT Manager" (kết hợp với Shizuku nếu cần) để sao chép tệp dễ dàng mà không bị chặn quyền.'
                : 'Modern Android restricts direct access to Android/data. Use ZArchiver or MT Manager (with Shizuku if needed) to easily paste files into the Minecraft directory.'}
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'vi' ? 'Đã hiểu' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
