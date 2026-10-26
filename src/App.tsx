import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { DropZone } from './components/DropZone.tsx';
import { MaterialOverview } from './components/MaterialOverview.tsx';
import { PassInspector } from './components/PassInspector.tsx';
import { ShaderEditor } from './components/ShaderEditor.tsx';
import { BuffersAndUniforms } from './components/BuffersAndUniforms.tsx';
import { AndroidGuideModal } from './components/AndroidGuideModal.tsx';
import { McpackModal } from './components/McpackModal.tsx';
import { VersionInfoModal } from './components/VersionInfoModal.tsx';
import { ApkModal } from './components/ApkModal.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { MaterialData, ShaderDefinitionData, ShaderStage } from './core/types.ts';
import { MaterialParser } from './core/material.ts';
import { createSampleRenderChunk, createSampleSky } from './core/samples.ts';
import { Sparkles, FileCode, CheckCircle2, Sliders, Layers, RefreshCcw } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [material, setMaterial] = useState<MaterialData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inspector selection states
  const [selectedPassIndex, setSelectedPassIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedShaderIndex, setSelectedShaderIndex] = useState(0);

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMcpackModalOpen, setIsMcpackModalOpen] = useState(false);
  const [isVersionInfoOpen, setIsVersionInfoOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Unpack dropped .material.bin or .bin file
  const handleUnpackBinFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(
      lang === 'vi'
        ? `Đang giải nén tệp ${file.name}...`
        : `Decompiling ${file.name}...`
    );

    try {
      const buffer = await file.arrayBuffer();
      const parsed = MaterialParser.parse(buffer);
      // Auto-fallback file name if empty in metadata
      if (!parsed.name) {
        parsed.name = file.name.replace(/\.material\.bin$/, '').replace(/\.bin$/, '');
      }

      setMaterial(parsed);
      setSelectedPassIndex(0);
      setSelectedVariantIndex(0);
      setSelectedShaderIndex(0);

      setStatusMessage(
        lang === 'vi'
          ? `Giải nén thành công "${parsed.name}" (${parsed.passes.length} render passes, ${parsed.buffers.length} buffers, ${parsed.uniforms.length} uniforms)!`
          : `Successfully unpacked "${parsed.name}"!`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        lang === 'vi'
          ? `Lỗi khi giải nén tệp .bin: ${err.message}`
          : `Failed to unpack material .bin: ${err.message}`
      );
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Pack dropped .zip archive back into .material.bin
  const handlePackZipFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(
      lang === 'vi'
        ? `Đang đóng gói tệp ${file.name} thành .material.bin...`
        : `Packing ${file.name} into .material.bin...`
    );

    try {
      const buffer = await file.arrayBuffer();
      const parsed = await MaterialParser.packFromZip(buffer);
      setMaterial(parsed);
      setSelectedPassIndex(0);
      setSelectedVariantIndex(0);
      setSelectedShaderIndex(0);

      // Trigger download of compiled .material.bin
      const binBytes = MaterialParser.serialize(parsed);
      downloadBlob(
        new Blob([binBytes as any], { type: 'application/octet-stream' }),
        `${parsed.name || 'material'}.material.bin`
      );

      setStatusMessage(
        lang === 'vi'
          ? `Đã đóng gói thành công tệp "${parsed.name}.material.bin" và bắt đầu tải xuống!`
          : `Successfully packed "${parsed.name}.material.bin" and started download!`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        lang === 'vi'
          ? `Lỗi khi đóng gói từ tệp .zip: ${err.message}`
          : `Failed to pack from zip: ${err.message}`
      );
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load built-in sample materials
  const handleLoadSample = (type: 'RenderChunk' | 'Sky') => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const sample = type === 'RenderChunk' ? createSampleRenderChunk() : createSampleSky();
      setMaterial(sample);
      setSelectedPassIndex(0);
      setSelectedVariantIndex(0);
      setSelectedShaderIndex(0);
      setStatusMessage(
        lang === 'vi'
          ? `Đã nạp mẫu "${sample.name}.material.bin" hoàn chỉnh cho Android (ESSL 3.10)!`
          : `Loaded sample "${sample.name}.material.bin" with ESSL Android shaders!`
      );
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper download blob
  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export compiled .material.bin
  const handleExportBin = () => {
    if (!material) return;
    try {
      const bytes = MaterialParser.serialize(material);
      const fileName = material.name.endsWith('.material.bin')
        ? material.name
        : `${material.name}.material.bin`;
      downloadBlob(new Blob([bytes as any], { type: 'application/octet-stream' }), fileName);
      setStatusMessage(
        lang === 'vi'
          ? `Đã tải xuống tệp ${fileName} thành công!`
          : `Downloaded ${fileName} successfully!`
      );
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  // Export unpacked folder as .zip
  const handleExportZip = async () => {
    if (!material) return;
    try {
      const zipBlob = await MaterialParser.unpackToZip(material, material.name);
      downloadBlob(zipBlob, `${material.name}_unpacked.zip`);
      setStatusMessage(
        lang === 'vi'
          ? `Đã tải xuống gói ${material.name}_unpacked.zip thành công!`
          : `Downloaded ${material.name}_unpacked.zip!`
      );
    } catch (err: any) {
      alert(`Export zip error: ${err.message}`);
    }
  };

  // Version conversion
  const handleConvertVersion = (targetVersion: number) => {
    if (!material) return;
    const converted = MaterialParser.convertVersion(material, targetVersion);
    setMaterial(converted);
    setStatusMessage(
      lang === 'vi'
        ? `Đã chuyển đổi định dạng material sang v${targetVersion} thành công!`
        : `Converted material format to v${targetVersion}!`
    );
  };

  // Apply Lazurite metadata label headers
  const handleApplyLabel = () => {
    if (!material) return;
    const labeled = MaterialParser.labelMaterial(material);
    setMaterial(labeled);
    setStatusMessage(
      lang === 'vi'
        ? 'Đã gắn nhãn chú thích thông tin Lazurite vào mã nguồn shader!'
        : 'Embedded Lazurite debug metadata comments into shaders!'
    );
  };

  // Update current shader code
  const handleUpdateShaderCode = (newCode: string) => {
    if (!material) return;
    const currentPass = material.passes[selectedPassIndex];
    if (!currentPass) return;
    const currentVariant = currentPass.variants[selectedVariantIndex];
    if (!currentVariant) return;
    const currentShader = currentVariant.shaders[selectedShaderIndex];
    if (!currentShader) return;

    // Mutate and update state
    currentShader.bgfx_shader.shader_text = newCode;
    // Sync null-terminated bytes
    const enc = new TextEncoder().encode(newCode);
    const bytes = new Uint8Array(enc.length + 1);
    bytes.set(enc, 0);
    bytes[enc.length] = 0;
    currentShader.bgfx_shader.shader_bytes = bytes;

    setMaterial({ ...material });
  };

  // Resolve currently active shader for editing
  const activePass = material?.passes[selectedPassIndex];
  const activeVariant = activePass?.variants[selectedVariantIndex];
  const activeShader = activeVariant?.shaders[selectedShaderIndex];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* Header */}
      <Header
        onLoadSample={handleLoadSample}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenVersionInfo={() => setIsVersionInfoOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        lang={lang}
        setLang={setLang}
        hasActiveMaterial={Boolean(material)}
        onExportBin={handleExportBin}
        onExportZip={handleExportZip}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Dropzone & File Importer */}
        <DropZone
          onUnpackBinFile={handleUnpackBinFile}
          onPackZipFile={handlePackZipFile}
          onLoadSample={handleLoadSample}
          lang={lang}
          isProcessing={isProcessing}
          statusMessage={statusMessage}
          errorMessage={errorMessage}
        />

        {/* If material is loaded: Visual Studio Workspace */}
        {material && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Overview & Quick Stats */}
            <MaterialOverview
              material={material}
              lang={lang}
              onConvertVersion={handleConvertVersion}
              onApplyLabel={handleApplyLabel}
              onExportBin={handleExportBin}
              onExportZip={handleExportZip}
              onOpenMcpackModal={() => setIsMcpackModalOpen(true)}
            />

            {/* Split Workspace: Left = Pass/Variant Browser; Right = Shader Code Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Pass & Variant Hierarchy Tree (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <PassInspector
                  material={material}
                  selectedPassIndex={selectedPassIndex}
                  setSelectedPassIndex={setSelectedPassIndex}
                  selectedVariantIndex={selectedVariantIndex}
                  setSelectedVariantIndex={setSelectedVariantIndex}
                  selectedShaderIndex={selectedShaderIndex}
                  setSelectedShaderIndex={setSelectedShaderIndex}
                  lang={lang}
                />
              </div>

              {/* Shader Source Code Editor & Mod Tools (8 cols) */}
              <div className="lg:col-span-8">
                {activeShader && activePass && activeVariant ? (
                  <ShaderEditor
                    shader={activeShader}
                    passName={activePass.name}
                    variantIndex={selectedVariantIndex}
                    flags={activeVariant.flags}
                    onUpdateShaderCode={handleUpdateShaderCode}
                    onSaveBin={handleExportBin}
                    lang={lang}
                  />
                ) : (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                    {lang === 'vi'
                      ? 'Chọn một shader từ danh sách bên trái để xem và sửa mã nguồn.'
                      : 'Select a shader from the left tree to inspect and edit code.'}
                  </div>
                )}
              </div>
            </div>

            {/* Buffers, Textures & Uniforms Table */}
            <BuffersAndUniforms material={material} lang={lang} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Lazurite Web Studio</span>
            <span>•</span>
            <span>Dựa trên công cụ mã nguồn mở RenderDragon veka0/lazurite</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <OfflineIndicator lang={lang} />
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {lang === 'vi' ? 'Hướng dẫn Android' : 'Android Guide'}
            </button>
            <a
              href="https://github.com/veka0/lazurite"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              GitHub (veka0/lazurite)
            </a>
          </div>
        </div>
      </footer>

      {/* Android Guide Modal */}
      <AndroidGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        lang={lang}
      />

      {/* Version Compatibility Info Modal */}
      <VersionInfoModal
        isOpen={isVersionInfoOpen}
        onClose={() => setIsVersionInfoOpen(false)}
        lang={lang}
      />

      {/* APK & Android Installation Modal */}
      <ApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        lang={lang}
      />

      {/* .MCPACK Resource Pack Builder Modal */}
      {material && (
        <McpackModal
          isOpen={isMcpackModalOpen}
          onClose={() => setIsMcpackModalOpen(false)}
          material={material}
          lang={lang}
        />
      )}
    </div>
  );
}
