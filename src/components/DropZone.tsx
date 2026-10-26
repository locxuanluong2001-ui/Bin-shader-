import React, { useRef, useState } from 'react';
import { UploadCloud, FileArchive, FileCode, CheckCircle2, AlertCircle, ArrowRightLeft, Sparkles, FolderDown } from 'lucide-react';

interface DropZoneProps {
  onUnpackBinFile: (file: File) => Promise<void>;
  onPackZipFile: (file: File) => Promise<void>;
  onLoadSample: (type: 'RenderChunk' | 'Sky') => void;
  lang: 'vi' | 'en';
  isProcessing: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onUnpackBinFile,
  onPackZipFile,
  onLoadSample,
  lang,
  isProcessing,
  statusMessage,
  errorMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'unpack' | 'pack'>('unpack');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleFile(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.bin') || activeTab === 'unpack') {
      await onUnpackBinFile(file);
    } else if (name.endsWith('.zip') || activeTab === 'pack') {
      await onPackZipFile(file);
    } else {
      await onUnpackBinFile(file);
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl shadow-cyan-950/20">
      {/* Background glow decoration */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tabs */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('unpack')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'unpack'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            {lang === 'vi' ? '1. Giải nén .material.bin (Unpack)' : '1. Unpack .material.bin'}
          </button>
          <button
            onClick={() => setActiveTab('pack')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'pack'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileArchive className="w-4 h-4" />
            {lang === 'vi' ? '2. Đóng gói ngược lại (Pack)' : '2. Pack back to .bin'}
          </button>
        </div>
      </div>

      {/* Drop Target Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer relative ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-slate-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={activeTab === 'unpack' ? '.bin,.material.bin,*' : '.zip,*'}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            {activeTab === 'unpack' ? (
              <UploadCloud className="w-8 h-8 text-cyan-400 animate-pulse" />
            ) : (
              <FolderDown className="w-8 h-8 text-blue-400 animate-pulse" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              {activeTab === 'unpack'
                ? lang === 'vi'
                  ? 'Kéo thả tệp .bin hoặc bấm để chọn tệp'
                  : 'Drop .material.bin file here or click to browse'
                : lang === 'vi'
                  ? 'Kéo thả tệp .zip hoặc bấm để chọn tệp đã giải nén'
                  : 'Drop unpacked .zip archive here to pack into .bin'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {activeTab === 'unpack'
                ? lang === 'vi'
                  ? 'Tự động phân tích, giải nén toàn bộ Vertex/Fragment shader ESSL cho Android và tạo cấu trúc JSON.'
                  : 'Automatically decompiles all ESSL Android shaders, RenderDragon passes, and JSON metadata.'
                : lang === 'vi'
                  ? 'Chuyển đổi thư mục mã nguồn shader và material.json trở lại thành tệp .material.bin hoàn chỉnh.'
                  : 'Re-compiles source shaders and material.json back into a pristine RenderDragon binary.'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {activeTab === 'unpack' ? '*.material.bin / *.bin' : '*.zip (Unpacked Project)'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {lang === 'vi' ? 'Không cần cài đặt Termux hay Python' : '100% Client-side, no CLI needed'}
            </span>
          </div>
        </div>

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-xl z-10">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-cyan-300 animate-pulse">
              {statusMessage || (lang === 'vi' ? 'Đang xử lý shader...' : 'Processing shader...')}
            </p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {statusMessage && !isProcessing && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick sample buttons below dropzone for mobile users */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'vi' ? 'Chưa có tệp sẵn trên máy? Thử mẫu nhanh:' : 'No file on hand? Try sample:'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLoadSample('RenderChunk')}
            className="px-3 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            RenderChunk (Địa hình & Nước)
          </button>
          <button
            onClick={() => onLoadSample('Sky')}
            className="px-3 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 text-blue-300 font-medium transition-colors cursor-pointer"
          >
            Sky (Bầu trời & Mây)
          </button>
        </div>
      </div>
    </div>
  );
};
