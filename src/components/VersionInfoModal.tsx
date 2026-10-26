import React from 'react';
import { X, Cpu, Layers, CheckCircle2, Info, ArrowRight, ShieldCheck } from 'lucide-react';

interface VersionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const VersionInfoModal: React.FC<VersionInfoModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Info className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {lang === 'vi' ? 'Thông tin Phiên bản Hỗ trợ' : 'Version Compatibility Details'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'vi'
                ? 'Chi tiết các phiên bản Minecraft Bedrock và định dạng RenderDragon mà phần mềm xử lý'
                : 'Supported Minecraft Bedrock and RenderDragon formats'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Main versions card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'vi' ? 'Định dạng RenderDragon Material (.bin)' : 'RenderDragon Material Formats'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span>Format v26 (Mới nhất)</span>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded">1.21+ / 1.26</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {lang === 'vi'
                    ? 'Hỗ trợ các bản cập nhật mới nhất của Minecraft Bedrock (1.21.x và Preview). Hỗ trợ ESSL_320, dynamic flag domain và các trường bổ sung.'
                    : 'Latest MCBE 1.21+ updates. Supports ESSL_320, dynamic flag domain, and updated uniform buffers.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                  <span>Format v25</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">1.20.50 - 1.20.80</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {lang === 'vi'
                    ? 'Chuẩn định dạng phổ biến nhất của các bản RenderDragon 1.20. Chuẩn ESSL_310 cho Android.'
                    : 'Common format for 1.20 updates. Uses ESSL_310 as the primary Android platform.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-indigo-400 font-bold mb-1">
                  <span>Format v24</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">1.20.0 - 1.20.40</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {lang === 'vi'
                    ? 'Bổ sung trường texture_format và interpolation cho varyings.'
                    : 'Added texture_format and interpolation definitions.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                  <span>Format v22 - v23</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">1.19.x - 1.20 Early</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {lang === 'vi'
                    ? 'Hỗ trợ giải nén các shader cũ hơn, tương thích với cả ESSL_300.'
                    : 'Backwards-compatible with older shader packs (including ESSL_300).'}
                </p>
              </div>
            </div>
          </div>

          {/* Android Shader Platforms */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'vi' ? 'Nền tảng Shader Android hỗ trợ' : 'Supported Android Shader Targets'}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">ESSL_310 (OpenGL ES 3.1)</strong>
                  <p className="text-slate-400 text-[11px]">
                    {lang === 'vi'
                      ? 'Nền tảng mặc định và tương thích cao nhất trên mọi điện thoại Android (Xiaomi, Samsung, Oppo, Realme, v.v.).'
                      : 'The standard and most compatible platform across Android devices.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">ESSL_320 (OpenGL ES 3.2)</strong>
                  <p className="text-slate-400 text-[11px]">
                    {lang === 'vi'
                      ? 'Dành cho các bản Minecraft Bedrock Android 1.20.60+ / 1.21+ trên các dòng máy hỗ trợ OpenGLES 3.2 mới.'
                      : 'For modern MCBE Android versions supporting OpenGL ES 3.2.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono">Vulkan / Direct3D / Metal</strong>
                  <p className="text-slate-400 text-[11px]">
                    {lang === 'vi'
                      ? 'Đồng thời giải nén và đóng gói tương thích đầy đủ nếu tệp .material.bin chứa cả shader cho PC (DirectX) hoặc iOS (Metal).'
                      : 'Also fully unpacks and repacks multi-platform shaders if included in the material container.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lazurite core library info */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'vi' ? 'Lõi công cụ' : 'Engine Core'}: Lazurite v0.12.0 (veka0)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {lang === 'vi'
                ? 'Ứng dụng đã chuyển đổi toàn bộ thuật toán nhị phân từ thư viện Python Lazurite sang engine chạy trực tiếp trên trình duyệt, tích hợp sẵn tính năng đổi phiên bản tự động (Convert format version) và nhúng chú thích mã nguồn (Label).'
                : 'Implemented using the latest Lazurite specification with client-side binary parsing, packaging, and version conversion.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'vi' ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
