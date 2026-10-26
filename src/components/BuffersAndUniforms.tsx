import React, { useState } from 'react';
import { BufferData, MaterialData, UniformData, UniformType } from '../core/types.ts';
import { Sliders, Database, Eye, Image as ImageIcon, Binary } from 'lucide-react';

interface BuffersAndUniformsProps {
  material: MaterialData;
  lang: 'vi' | 'en';
}

export const BuffersAndUniforms: React.FC<BuffersAndUniformsProps> = ({ material, lang }) => {
  const [activeTab, setActiveTab] = useState<'uniforms' | 'buffers' | 'overrides'>('uniforms');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
      {/* Header and Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            {lang === 'vi' ? 'Thông số Uniforms & Buffers' : 'Uniforms & Texture Buffers'}
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('uniforms')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'uniforms'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Uniforms ({material.uniforms.length})
          </button>
          <button
            onClick={() => setActiveTab('buffers')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'buffers'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Buffers ({material.buffers.length})
          </button>
          {Object.keys(material.uniform_overrides || {}).length > 0 && (
            <button
              onClick={() => setActiveTab('overrides')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'overrides'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overrides ({Object.keys(material.uniform_overrides).length})
            </button>
          )}
        </div>
      </div>

      {/* Uniforms View */}
      {activeTab === 'uniforms' && (
        <div className="overflow-x-auto">
          {material.uniforms.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              {lang === 'vi' ? 'Không có uniform nào được đăng ký.' : 'No uniforms registered.'}
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2">Tên biến (Name)</th>
                  <th className="pb-2">Kiểu (Type)</th>
                  <th className="pb-2">Số lượng (Count)</th>
                  <th className="pb-2">Giá trị mặc định (Default Values)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {material.uniforms.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-950/40">
                    <td className="py-2.5 font-bold text-cyan-300">{u.name}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {UniformType[u.type]}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{u.count}</td>
                    <td className="py-2.5 text-slate-300">
                      {u.default.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.default.map((v, vIdx) => (
                            <span key={vIdx} className="bg-slate-950 px-1 py-0.2 rounded text-[10px] text-amber-300">
                              {v.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Buffers View */}
      {activeTab === 'buffers' && (
        <div className="overflow-x-auto">
          {material.buffers.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              {lang === 'vi' ? 'Không có texture buffer nào.' : 'No texture buffers registered.'}
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2">Tên Texture Buffer</th>
                  <th className="pb-2">Register Slot</th>
                  <th className="pb-2">Kiểu Buffer</th>
                  <th className="pb-2">Bộ lọc (Sampler Filter)</th>
                  <th className="pb-2">Chế độ lặp (Wrap)</th>
                  <th className="pb-2">Texture mặc định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {material.buffers.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-950/40">
                    <td className="py-2.5 font-bold text-cyan-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{b.name}</span>
                    </td>
                    <td className="py-2.5 text-amber-300 font-bold">{b.register_slot}</td>
                    <td className="py-2.5 text-slate-400">{b.type}</td>
                    <td className="py-2.5">
                      {b.sampler_state ? (
                        <span className="text-emerald-400 text-[11px]">
                          {b.sampler_state.filter === 1 ? 'Bilinear' : 'Point'}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {b.sampler_state ? (
                        <span className="text-sky-400 text-[11px]">
                          {b.sampler_state.wrapping === 1 ? 'Repeat' : 'Clamp'}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-400">{b.default_texture || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Uniform Overrides */}
      {activeTab === 'overrides' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2">Uniform Name</th>
                <th className="pb-2">Override Identifier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {Object.entries(material.uniform_overrides || {}).map(([k, v], i) => (
                <tr key={i} className="hover:bg-slate-950/40">
                  <td className="py-2 font-bold text-purple-300">{k}</td>
                  <td className="py-2 text-cyan-300">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
