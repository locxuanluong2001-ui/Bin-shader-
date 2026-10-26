import React from 'react';
import { MaterialData, ShaderPlatform, ShaderStage } from '../core/types.ts';
import { Download, FileArchive, Tag, RefreshCw, Cpu, Layers, Sparkles, FolderArchive, ArrowUpRight } from 'lucide-react';

interface MaterialOverviewProps {
  material: MaterialData;
  lang: 'vi' | 'en';
  onConvertVersion: (targetVer: number) => void;
  onApplyLabel: () => void;
  onExportBin: () => void;
  onExportZip: () => void;
  onOpenMcpackModal: () => void;
}

export const MaterialOverview: React.FC<MaterialOverviewProps> = ({
  material,
  lang,
  onConvertVersion,
  onApplyLabel,
  onExportBin,
  onExportZip,
  onOpenMcpackModal,
}) => {
  // Count stats
  const totalPasses = material.passes.length;
  let totalVariants = 0;
  let totalShaders = 0;
  let esslShadersCount = 0;

  for (const p of material.passes) {
    totalVariants += p.variants.length;
    for (const v of p.variants) {
      totalShaders += v.shaders.length;
      for (const s of v.shaders) {
        if (s.platform.startsWith('ESSL')) {
          esslShadersCount++;
        }
      }
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl">
      {/* Top Banner: Name, Version & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {material.name || 'Unnamed Material'}
            </h2>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
              .material.bin
            </span>
            {material.parent && (
              <span className="text-xs text-slate-400">
                (Parent: <span className="text-cyan-400 font-mono">{material.parent}</span>)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'vi'
              ? 'Tệp shader RenderDragon đã giải nén thành công và sẵn sàng tùy biến.'
              : 'RenderDragon shader container parsed and ready for modification.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Label Button */}
          <button
            onClick={onApplyLabel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title={lang === 'vi' ? 'Thêm chú thích debug vào mã nguồn shader (lazurite label)' : 'Embed Lazurite metadata comment headers'}
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'vi' ? 'Gắn nhãn (Label)' : 'Label'}</span>
          </button>

          {/* Export Unpacked ZIP */}
          <button
            onClick={onExportZip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer"
            title={lang === 'vi' ? 'Tải về toàn bộ thư mục giải nén dưới dạng .zip' : 'Download complete unpacked folder as .zip'}
          >
            <FileArchive className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'vi' ? 'Tải ZIP đã giải nén' : 'Export ZIP'}</span>
          </button>

          {/* Create .mcpack directly */}
          <button
            onClick={onOpenMcpackModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title={lang === 'vi' ? 'Tạo gói Resource Pack .mcpack cài thẳng vào Minecraft Android' : 'Create direct-install .mcpack resource pack'}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Tạo gói .MCPACK' : 'Build .MCPACK'}</span>
          </button>

          {/* Export .material.bin */}
          <button
            onClick={onExportBin}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'vi' ? 'ĐÓNG GÓI .BIN' : 'PACK TO .BIN'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-5">
        {/* Version & Converter */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            {lang === 'vi' ? 'Phiên bản (Format)' : 'Format Version'}
          </span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className="text-lg font-bold font-mono text-cyan-400">
              v{material.version}
            </span>
            {/* Version converter */}
            <select
              value={material.version}
              onChange={(e) => onConvertVersion(Number(e.target.value))}
              className="text-[11px] font-mono bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-500"
              title={lang === 'vi' ? 'Chuyển đổi phiên bản định dạng (lazurite convert)' : 'Convert format version'}
            >
              <option value={26}>v26 (1.21+)</option>
              <option value={25}>v25 (1.20+)</option>
              <option value={24}>v24</option>
              <option value={23}>v23</option>
              <option value={22}>v22</option>
            </select>
          </div>
        </div>

        {/* Total Passes */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">
            {lang === 'vi' ? 'Số Render Pass' : 'Render Passes'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-lg font-bold font-mono text-white">{totalPasses}</span>
          </div>
        </div>

        {/* Total Variants */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">
            {lang === 'vi' ? 'Biến thể (Variants)' : 'Variants'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span className="text-lg font-bold font-mono text-white">{totalVariants}</span>
          </div>
        </div>

        {/* Android ESSL Shaders */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">
            {lang === 'vi' ? 'Shader Android ESSL' : 'Android ESSL Shaders'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-lg font-bold font-mono text-emerald-400">{esslShadersCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">/ {totalShaders}</span>
          </div>
        </div>

        {/* Uniform Registers */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">
            {lang === 'vi' ? 'Biến Uniform' : 'Uniform Registers'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold font-mono text-purple-400">{material.uniforms.length}</span>
            <span className="text-[10px] text-slate-500">{lang === 'vi' ? 'thông số' : 'uniforms'}</span>
          </div>
        </div>

        {/* Buffers / Samplers */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">
            {lang === 'vi' ? 'Texture Buffers' : 'Texture Buffers'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold font-mono text-amber-400">{material.buffers.length}</span>
            <span className="text-[10px] text-slate-500">{lang === 'vi' ? 'samplers' : 'buffers'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
