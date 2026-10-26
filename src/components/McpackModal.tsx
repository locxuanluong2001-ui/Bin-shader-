import React, { useState } from 'react';
import { MaterialData } from '../core/types.ts';
import { MaterialParser } from '../core/material.ts';
import JSZip from 'jszip';
import { X, FolderArchive, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface McpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialData;
  lang: 'vi' | 'en';
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const McpackModal: React.FC<McpackModalProps> = ({ isOpen, onClose, material, lang }) => {
  const [packName, setPackName] = useState(`${material.name} Custom Shader`);
  const [packDesc, setPackDesc] = useState(`Created with Lazurite Web for Android Minecraft Bedrock`);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleBuildMcpack = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();

      // 1. Generate Manifest
      const headerUUID = generateUUID();
      const moduleUUID = generateUUID();
      const manifest = {
        format_version: 2,
        header: {
          name: packName,
          description: packDesc,
          uuid: headerUUID,
          version: [1, 0, 0],
          min_engine_version: [1, 20, 0],
        },
        modules: [
          {
            type: 'resources',
            uuid: moduleUUID,
            version: [1, 0, 0],
          },
        ],
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // 2. Generate a clean pack_icon.png using HTML5 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 128, 128);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(1, '#3b82f6');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        // Icon text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LZ', 64, 54);

        ctx.font = 'bold 12px monospace';
        ctx.fillText('RENDERDRAGON', 64, 92);

        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        zip.file('pack_icon.png', base64Data, { base64: true });
      }

      // 3. Serialize Material and place in renderer/materials/<Name>.material.bin
      const binBytes = MaterialParser.serialize(material);
      const fileName = material.name.endsWith('.material.bin')
        ? material.name
        : `${material.name}.material.bin`;

      zip.file(`renderer/materials/${fileName}`, binBytes);

      // 4. Generate .mcpack
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packName.replace(/[^a-zA-Z0-9_-]/g, '_')}.mcpack`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err: any) {
      alert(`Error building .mcpack: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FolderArchive className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {lang === 'vi' ? 'Tạo gói cài đặt .MCPACK' : 'Build .MCPACK Resource Pack'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'vi'
                ? 'Đóng gói toàn bộ cấu trúc để chạm mở trực tiếp trên Minecraft Android'
                : 'Directly imports into Minecraft Bedrock with 1 tap on Android'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {lang === 'vi' ? 'Tên gói Resource Pack:' : 'Pack Name:'}
            </label>
            <input
              type="text"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {lang === 'vi' ? 'Mô tả ngắn:' : 'Pack Description:'}
            </label>
            <textarea
              value={packDesc}
              onChange={(e) => setPackDesc(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium resize-none"
            />
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Cấu trúc tự động tạo bao gồm:' : 'Package will include:'}</span>
            </div>
            <p className="font-mono text-[11px] text-slate-300 pl-5">
              • manifest.json (UUIDs v2)
            </p>
            <p className="font-mono text-[11px] text-slate-300 pl-5">
              • pack_icon.png
            </p>
            <p className="font-mono text-[11px] text-cyan-300 pl-5">
              • renderer/materials/{material.name}.material.bin
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {lang === 'vi' ? 'Hủy' : 'Cancel'}
          </button>
          <button
            onClick={handleBuildMcpack}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isGenerating
                ? (lang === 'vi' ? 'Đang tạo...' : 'Generating...')
                : (lang === 'vi' ? 'Tải tệp .MCPACK' : 'Download .MCPACK')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
