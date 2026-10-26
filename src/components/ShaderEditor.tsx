import React, { useState } from 'react';
import { ShaderDefinitionData, ShaderStage } from '../core/types.ts';
import { Copy, Check, Search, Sparkles, Wind, Droplets, Sun, CloudFog, Moon, Code2, Save, FileCode } from 'lucide-react';

interface ShaderEditorProps {
  shader: ShaderDefinitionData;
  passName: string;
  variantIndex: number;
  flags: Record<string, string>;
  onUpdateShaderCode: (newCode: string) => void;
  onSaveBin: () => void;
  lang: 'vi' | 'en';
}

export const ShaderEditor: React.FC<ShaderEditorProps> = ({
  shader,
  passName,
  variantIndex,
  flags,
  onUpdateShaderCode,
  onSaveBin,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const code = shader.bgfx_shader.shader_text || '';
  const isVertex = shader.stage === ShaderStage.Vertex;
  const isFragment = shader.stage === ShaderStage.Fragment;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick mod snippet injector
  const injectSnippet = (snippetType: 'waving_foliage' | 'waving_water' | 'vibrant_colors' | 'soft_fog' | 'night_cinematic') => {
    let newCode = code;

    if (snippetType === 'waving_foliage') {
      if (newCode.includes('Lazurite Foliage Wave')) {
        alert(lang === 'vi' ? 'Mã hiệu ứng lá lay động đã có trong shader!' : 'Foliage wave effect already present!');
        return;
      }
      const hook = 'gl_Position =';
      const foliageMath = `
    // --- Lazurite Foliage Wave (Android ESSL) ---
    float animTime = ViewPositionAndTime.w;
    float foliageWave = sin(animTime * 2.8 + pos.x * 2.2 + pos.z * 1.8) * 0.08;
    pos.x += foliageWave * a_texcoord1.y;
    pos.z += foliageWave * 0.6 * a_texcoord1.y;
    // -------------------------------------------
`;
      if (newCode.includes(hook)) {
        newCode = newCode.replace(hook, foliageMath + '\n    ' + hook);
      } else {
        newCode += '\n' + foliageMath;
      }
    } else if (snippetType === 'waving_water') {
      if (newCode.includes('Lazurite Water Wave')) {
        alert(lang === 'vi' ? 'Mã sóng nước đã có trong shader!' : 'Water wave effect already present!');
        return;
      }
      const hook = 'gl_Position =';
      const waterMath = `
    // --- Lazurite Water Wave (Android ESSL) ---
    float waterTime = ViewPositionAndTime.w;
    float waterWave = sin(waterTime * 3.0 + pos.x * 3.0 + pos.z * 3.0) * 0.05;
    pos.y += waterWave;
    // -----------------------------------------
`;
      if (newCode.includes(hook)) {
        newCode = newCode.replace(hook, waterMath + '\n    ' + hook);
      } else {
        newCode += '\n' + waterMath;
      }
    } else if (snippetType === 'vibrant_colors') {
      if (newCode.includes('Lazurite Vibrant Boost')) {
        alert(lang === 'vi' ? 'Mã tăng màu sắc đã có trong shader!' : 'Vibrant boost already present!');
        return;
      }
      const hook = 'o_fragColor =';
      const vibrantMath = `
    // --- Lazurite Vibrant Boost (Android ESSL) ---
    float lum = dot(litColor, vec3(0.2126, 0.7152, 0.0722));
    litColor = mix(vec3(lum), litColor, 1.25); // Tăng 25% độ bão hòa
    litColor = pow(litColor, vec3(0.95));       // Cân chỉnh độ tương phản
    // --------------------------------------------
`;
      if (newCode.includes(hook)) {
        newCode = newCode.replace(hook, vibrantMath + '\n    ' + hook);
      } else {
        newCode += '\n' + vibrantMath;
      }
    } else if (snippetType === 'soft_fog') {
      if (newCode.includes('Lazurite Soft Fog')) {
        alert(lang === 'vi' ? 'Mã sương mù mềm đã có trong shader!' : 'Soft fog already present!');
        return;
      }
      const hook = 'o_fragColor =';
      const fogMath = `
    // --- Lazurite Soft Fog (Android ESSL) ---
    float smoothFog = smoothstep(0.0, 1.0, v_fog.a);
    vec3 atmosphericColor = mix(litColor, v_fog.rgb, smoothFog * 0.85);
    // ----------------------------------------
`;
      if (newCode.includes(hook)) {
        newCode = newCode.replace(hook, fogMath + '\n    ' + hook);
      } else {
        newCode += '\n' + fogMath;
      }
    }

    onUpdateShaderCode(newCode);
  };

  const lines = code.split('\n');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
      {/* Editor Header Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* File and Context info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">
                {shader.file_name || `${passName}.${ShaderStage[shader.stage]}.glsl`}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30">
                {shader.platform}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                isVertex ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}>
                {ShaderStage[shader.stage]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Pass: <strong className="text-slate-300 font-mono">{passName}</strong></span>
              <span>•</span>
              <span>Variant #{variantIndex}</span>
              {Object.keys(flags).length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-slate-400 font-mono">
                    Flags: {Object.entries(flags).map(([k, v]) => `${k}=${v}`).join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar & Mod Snippets */}
        <div className="flex items-center gap-2">
          {/* Quick Shader Mod Presets */}
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'vi' ? 'Hiệu ứng Shader Mod' : 'Shader Mod Snippets'}</span>
            </button>

            {showPresets && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  {lang === 'vi' ? 'Chèn mã mod nhanh cho Android:' : 'Insert Android Shader Mod:'}
                </div>

                {isVertex && (
                  <>
                    <button
                      onClick={() => { injectSnippet('waving_foliage'); setShowPresets(false); }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      <Wind className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">Lá cây & Cỏ lay động</div>
                        <div className="text-[10px] text-slate-400">Wind wave foliage vertex motion</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { injectSnippet('waving_water'); setShowPresets(false); }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-semibold text-white">Sóng nước nhấp nhô</div>
                        <div className="text-[10px] text-slate-400">Realistic gentle water waves</div>
                      </div>
                    </button>
                  </>
                )}

                {isFragment && (
                  <>
                    <button
                      onClick={() => { injectSnippet('vibrant_colors'); setShowPresets(false); }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      <Sun className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold text-white">Màu sắc tươi tắn & Rực rỡ</div>
                        <div className="text-[10px] text-slate-400">Vibrant saturation tonemapper</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { injectSnippet('soft_fog'); setShowPresets(false); }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      <CloudFog className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="font-semibold text-white">Sương mù chân trời mềm mịn</div>
                        <div className="text-[10px] text-slate-400">Smooth horizon fog blending</div>
                      </div>
                    </button>
                  </>
                )}

                {!isVertex && !isFragment && (
                  <div className="px-2 py-2 text-xs text-slate-500 italic">
                    Compute shader or custom stage.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Copy code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            title="Copy source code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (lang === 'vi' ? 'Đã sao chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
          </button>

          {/* Quick Save & Pack to .bin */}
          <button
            onClick={onSaveBin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            title="Save changes and repack directly into .material.bin"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === 'vi' ? 'Lưu & Xuất .bin' : 'Save & Pack .bin'}</span>
          </button>
        </div>
      </div>

      {/* Editor Workspace: Search Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 w-full max-w-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'vi' ? 'Tìm biến, hàm trong shader...' : 'Find keyword in shader...'}
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs font-mono"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
              ✕
            </button>
          )}
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          {lines.length} lines • ESSL 3.10 / GLSL
        </div>
      </div>

      {/* Code Textarea with Line Numbers */}
      <div className="flex-1 flex overflow-hidden bg-[#0a0e17] font-mono text-xs sm:text-sm">
        {/* Line Numbers Bar */}
        <div className="w-12 sm:w-14 py-3 bg-[#070a10] border-r border-slate-800/80 text-right pr-3 select-none text-slate-600 font-mono text-xs shrink-0 overflow-hidden">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Editor */}
        <textarea
          value={code}
          onChange={(e) => onUpdateShaderCode(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-slate-200 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-6 selection:bg-cyan-500/30 overflow-auto whitespace-pre tab-4"
          placeholder="// Shader code will appear here..."
        />
      </div>

      {/* Editor Footer Status */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{lang === 'vi' ? 'Chỉnh sửa trực tiếp — Tự động đồng bộ với tệp .material.bin' : 'Live Editing — Automatically synchronized with .material.bin'}</span>
        </div>
        <span className="font-mono text-slate-500">UTF-8 • UNIX (LF)</span>
      </div>
    </div>
  );
};
