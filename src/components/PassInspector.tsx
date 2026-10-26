import React, { useState } from 'react';
import { MaterialData, PassData, ShaderPlatform, ShaderStage, VariantData } from '../core/types.ts';
import { Layers, ChevronRight, FileCode, CheckCircle2, Sliders, ShieldAlert } from 'lucide-react';

interface PassInspectorProps {
  material: MaterialData;
  selectedPassIndex: number;
  setSelectedPassIndex: (index: number) => void;
  selectedVariantIndex: number;
  setSelectedVariantIndex: (index: number) => void;
  selectedShaderIndex: number;
  setSelectedShaderIndex: (index: number) => void;
  lang: 'vi' | 'en';
}

export const PassInspector: React.FC<PassInspectorProps> = ({
  material,
  selectedPassIndex,
  setSelectedPassIndex,
  selectedVariantIndex,
  setSelectedVariantIndex,
  selectedShaderIndex,
  setSelectedShaderIndex,
  lang,
}) => {
  const currentPass: PassData | undefined = material.passes[selectedPassIndex];
  const currentVariant: VariantData | undefined = currentPass?.variants[selectedVariantIndex];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            {lang === 'vi' ? 'Cấu trúc Render Pass' : 'Render Pass Structure'}
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {material.passes.length} {lang === 'vi' ? 'passes' : 'passes'}
        </span>
      </div>

      {/* Pass Selector Tabs */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
          1. {lang === 'vi' ? 'Chọn Render Pass:' : 'Select Pass:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {material.passes.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedPassIndex(idx);
                setSelectedVariantIndex(0);
                setSelectedShaderIndex(0);
              }}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPassIndex === idx
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              <div className="font-mono text-xs font-bold truncate text-cyan-300">
                {p.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{p.variants.length} var</span>
                <span className="font-mono text-[9px] bg-slate-800 px-1 rounded text-slate-300">
                  {p.default_blend_mode}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Variants List for current Pass */}
      {currentPass && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase">
              2. {lang === 'vi' ? 'Chọn Biến thể (Variant):' : 'Select Variant:'}
            </label>
            <span className="text-[10px] text-slate-500">
              {currentPass.variants.length} {lang === 'vi' ? 'biến thể' : 'variants'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {currentPass.variants.map((v, vIdx) => {
              const flagKeys = Object.keys(v.flags);
              return (
                <button
                  key={vIdx}
                  onClick={() => {
                    setSelectedVariantIndex(vIdx);
                    setSelectedShaderIndex(0);
                  }}
                  className={`p-2 rounded-xl text-left border flex items-center justify-between text-xs transition-all cursor-pointer ${
                    selectedVariantIndex === vIdx
                      ? 'bg-blue-600/15 border-blue-500/50 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-mono text-[10px] text-cyan-400 font-bold shrink-0">
                      {vIdx}
                    </span>
                    <div className="truncate">
                      {flagKeys.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(v.flags).map(([k, val]) => (
                            <span
                              key={k}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300"
                            >
                              {k}:{val}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">
                          {lang === 'vi' ? 'Mặc định (Không có cờ)' : 'Default (No flags)'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {v.shaders.length} shaders
                    </span>
                    {v.is_supported && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shader Stage Selector (Vertex vs Fragment) */}
      {currentVariant && (
        <div className="pt-2 border-t border-slate-800">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
            3. {lang === 'vi' ? 'Chọn Shader để xem & sửa:' : 'Select Shader Stage:'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {currentVariant.shaders.map((s, sIdx) => {
              const isVertex = s.stage === ShaderStage.Vertex;
              const isFragment = s.stage === ShaderStage.Fragment;
              const isSelected = selectedShaderIndex === sIdx;

              return (
                <button
                  key={sIdx}
                  onClick={() => setSelectedShaderIndex(sIdx)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/15'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className={`w-4 h-4 ${isVertex ? 'text-amber-400' : isFragment ? 'text-emerald-400' : 'text-purple-400'}`} />
                    <div className="text-left">
                      <div className="font-bold text-xs text-white">
                        {ShaderStage[s.stage]} Shader
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400">
                        {s.platform}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
