/**
 * RenderDragon Material Parser & Packer
 * Complete implementation based on veka0/lazurite for Minecraft Bedrock (Android & Cross-platform)
 */
import { BinaryReader, BinaryWriter } from './binary.ts';
import { BgfxParser } from './bgfx.ts';
import {
  BlendMode,
  BufferAccess,
  BufferData,
  BufferType,
  EncryptionType,
  InputType,
  Interpolation,
  MaterialData,
  PassData,
  Precision,
  SamplerStateData,
  ShaderDefinitionData,
  ShaderPlatform,
  ShaderStage,
  TextureFilter,
  TextureWrap,
  UniformData,
  UniformType,
  VariantData,
} from './types.ts';
import JSZip from 'jszip';

export const MATERIAL_MAGIC = 168942106n;
export const COMPILED_MATERIAL_DEFINITION = 'RenderDragon.CompiledMaterialDefinition';
export const INITIAL_VERSION = 22;
export const LATEST_VERSION = 26;

// Platform index mapping according to lazurite
export function getPlatformList(version: number): ShaderPlatform[] {
  if (version >= 26) {
    return [
      ShaderPlatform.Direct3D_SM40,
      ShaderPlatform.Direct3D_SM50,
      ShaderPlatform.Direct3D_SM60,
      ShaderPlatform.Direct3D_SM65,
      ShaderPlatform.Direct3D_XB1,
      ShaderPlatform.Direct3D_XBX,
      ShaderPlatform.GLSL_120,
      ShaderPlatform.GLSL_430,
      ShaderPlatform.ESSL_310,
      ShaderPlatform.ESSL_320,
      ShaderPlatform.Metal,
      ShaderPlatform.Vulkan,
      ShaderPlatform.PSSL,
      ShaderPlatform.Unknown,
    ];
  } else if (version >= 25) {
    return [
      ShaderPlatform.Direct3D_SM40,
      ShaderPlatform.Direct3D_SM50,
      ShaderPlatform.Direct3D_SM60,
      ShaderPlatform.Direct3D_SM65,
      ShaderPlatform.Direct3D_XB1,
      ShaderPlatform.Direct3D_XBX,
      ShaderPlatform.GLSL_120,
      ShaderPlatform.GLSL_430,
      ShaderPlatform.ESSL_310,
      ShaderPlatform.Metal,
      ShaderPlatform.Vulkan,
      ShaderPlatform.PSSL,
      ShaderPlatform.Unknown,
    ];
  } else {
    return [
      ShaderPlatform.Direct3D_SM40,
      ShaderPlatform.Direct3D_SM50,
      ShaderPlatform.Direct3D_SM60,
      ShaderPlatform.Direct3D_SM65,
      ShaderPlatform.Direct3D_XB1,
      ShaderPlatform.Direct3D_XBX,
      ShaderPlatform.GLSL_120,
      ShaderPlatform.GLSL_430,
      ShaderPlatform.ESSL_300,
      ShaderPlatform.ESSL_310,
      ShaderPlatform.Metal,
      ShaderPlatform.Vulkan,
      ShaderPlatform.Nvn,
      ShaderPlatform.PSSL,
      ShaderPlatform.Unknown,
    ];
  }
}

export function getPlatformIndex(platform: ShaderPlatform, version: number): number {
  const list = getPlatformList(version);
  // Special fallback for ESSL_300 in v25+
  if (platform === ShaderPlatform.ESSL_300 && version >= 25) {
    return list.indexOf(ShaderPlatform.ESSL_310);
  }
  const idx = list.indexOf(platform);
  return idx !== -1 ? idx : list.length - 1;
}

export function getPlatformFromIndex(index: number, version: number): ShaderPlatform {
  const list = getPlatformList(version);
  return list[index] ?? ShaderPlatform.Unknown;
}

export function getShaderFileExtension(platform: ShaderPlatform): string {
  if (platform.startsWith('Direct3D')) return 'dxbc';
  if (platform.startsWith('GLSL') || platform.startsWith('ESSL')) return 'glsl';
  if (platform === ShaderPlatform.Metal) return 'metal';
  if (platform === ShaderPlatform.Vulkan) return 'spirv';
  return 'bin';
}

export function getSemanticName(index: number, subIndex: number): string {
  const semantics = [
    'POSITION',
    'NORMAL',
    'TANGENT',
    'BITANGENT',
    'COLOR',
    'BLENDINDICES',
    'BLENDWEIGHT',
    'TEXCOORD',
    'UNKNOWN',
    'FRONTFACING',
  ];
  const name = semantics[index] || 'UNKNOWN';
  if (name === 'COLOR' || name === 'TEXCOORD' || name === 'UNKNOWN') {
    return `${name}${subIndex}`;
  }
  return name;
}

export class MaterialParser {
  /**
   * Parse a .material.bin binary buffer into structured MaterialData
   */
  static parse(buffer: ArrayBuffer | Uint8Array): MaterialData {
    const reader = new BinaryReader(buffer);

    // 1. Magic
    const magic = reader.readULongLong();
    if (magic !== MATERIAL_MAGIC) {
      throw new Error(`Invalid file magic: ${magic}. Expected ${MATERIAL_MAGIC} (RenderDragon material)`);
    }

    // 2. Definition header
    const def = reader.readString();
    if (def !== COMPILED_MATERIAL_DEFINITION) {
      throw new Error(`Unrecognized material definition: "${def}". Expected "${COMPILED_MATERIAL_DEFINITION}"`);
    }

    // 3. Version
    const version = Number(reader.readULongLong());
    if (version < INITIAL_VERSION || version > LATEST_VERSION) {
      console.warn(`Warning: Material version ${version} may be experimental. Supported range: ${INITIAL_VERSION}-${LATEST_VERSION}`);
    }

    // 4. Encryption type (4-byte string reversed)
    const encBytes = reader.readBytes(4);
    const encStr = new TextDecoder().decode(encBytes).split('').reverse().join('');
    let encryption = EncryptionType.NONE;
    if (encStr === 'SMPL') encryption = EncryptionType.SIMPLE_PASSPHRASE;
    else if (encStr === 'KYPR') encryption = EncryptionType.KEY_PAIR;

    if (encryption !== EncryptionType.NONE) {
      throw new Error(`Encrypted materials (${encryption}) cannot be decompiled.`);
    }

    // 5. Name & Parent
    const name = reader.readString();
    const hasParent = reader.readBool();
    const parent = hasParent ? reader.readString() : '';

    // 6. Buffers
    const bufferCount = reader.readUByte();
    const buffers: BufferData[] = [];
    for (let i = 0; i < bufferCount; i++) {
      const bName = reader.readString();
      const register_slot = reader.readUShort();
      const access: BufferAccess = reader.readUByte();
      const precision: Precision = reader.readUByte();
      const unordered_access = reader.readBool();
      const type: BufferType = reader.readUByte();
      const texture_format = reader.readString();
      const slot_count = reader.readULong();
      const binding_slot = reader.readUByte();

      let unknown: number | undefined = undefined;
      if (version >= 26) {
        unknown = reader.readULong();
      }

      let sampler_state: SamplerStateData | null = null;
      if (reader.readBool()) {
        const val = reader.readUByte();
        sampler_state = {
          filter: (val & 1) === 1 ? TextureFilter.Bilinear : TextureFilter.Point,
          wrapping: ((val >> 1) & 1) === 1 ? TextureWrap.Repeat : TextureWrap.Clamp,
        };
      }

      const hasDefaultTex = reader.readBool();
      const default_texture = hasDefaultTex ? reader.readString() : '';

      const hasTexPath = reader.readBool();
      const texture_path = hasTexPath ? reader.readString() : '';

      let custom_type_info: { struct: string; size: number } | null = null;
      if (reader.readBool()) {
        custom_type_info = {
          struct: reader.readString(),
          size: reader.readULong(),
        };
      }

      buffers.push({
        name: bName,
        register_slot,
        access,
        precision,
        unordered_access,
        type,
        texture_format,
        slot_count,
        binding_slot,
        unknown,
        sampler_state,
        default_texture,
        texture_path,
        custom_type_info,
      });
    }

    // 7. Uniforms
    const uniformCount = reader.readUShort();
    const uniforms: UniformData[] = [];
    for (let i = 0; i < uniformCount; i++) {
      const uName = reader.readString();
      const uType: UniformType = reader.readUShort();
      let count = 0;
      let defaultVals: number[] = [];

      if (uType >= 2 && uType <= 4) {
        count = reader.readULong();
        const hasData = reader.readBool();
        if (hasData) {
          const numFloats = uType === 2 ? 4 : uType === 3 ? 9 : 16;
          for (let f = 0; f < numFloats; f++) {
            defaultVals.push(reader.readFloat());
          }
        }
      }

      uniforms.push({
        name: uName,
        type: uType,
        count,
        default: defaultVals,
      });
    }

    // 8. Uniform Overrides (omitted in "Core/Builtins")
    const uniform_overrides: Record<string, string> = {};
    if (name !== 'Core/Builtins') {
      const overrideCount = reader.readUShort();
      for (let i = 0; i < overrideCount; i++) {
        const key = reader.readString();
        const val = reader.readString();
        uniform_overrides[key] = val;
      }
    }

    // 9. Passes
    const passCount = reader.readUShort();
    const passes: PassData[] = [];
    for (let p = 0; p < passCount; p++) {
      const pName = reader.readString();
      const bitString = reader.readString();
      const fallback_pass = reader.readString();

      let default_blend_mode = BlendMode.Unspecified;
      if (reader.readBool()) {
        const modeIndex = reader.readUShort();
        const blendValues = Object.values(BlendMode);
        default_blend_mode = blendValues[modeIndex] ?? BlendMode.NoneMode;
      }

      // Flag domain
      const flag_domain: Record<string, string[]> = {};
      const flagDomainCount = reader.readUShort();
      if (version >= 26) {
        for (let f = 0; f < flagDomainCount; f++) {
          const key = reader.readString();
          const valCount = reader.readUShort();
          const values: string[] = [];
          for (let v = 0; v < valCount; v++) {
            values.push(reader.readString());
          }
          flag_domain[key] = values;
        }
      } else {
        for (let f = 0; f < flagDomainCount; f++) {
          const key = reader.readString();
          flag_domain[key] = [reader.readString()];
        }
      }

      let output_binding_signature = 0;
      if (version >= 23) {
        output_binding_signature = reader.readULong();
      }

      // Supported platforms mapping from bitString
      const platformList = getPlatformList(version);
      const supported_platforms: Record<ShaderPlatform, boolean> = {} as any;
      for (let i = 0; i < platformList.length; i++) {
        const plat = platformList[i];
        supported_platforms[plat] = bitString[i] === '1';
      }

      // Variants
      const variantCount = reader.readUShort();
      const variants: VariantData[] = [];
      for (let v = 0; v < variantCount; v++) {
        const is_supported = reader.readBool();
        const flagCount = reader.readUShort();
        const shaderCount = reader.readUShort();

        const flags: Record<string, string> = {};
        for (let f = 0; f < flagCount; f++) {
          const fKey = reader.readString();
          const fVal = reader.readString();
          flags[fKey] = fVal;
        }

        const shaders: ShaderDefinitionData[] = [];
        for (let s = 0; s < shaderCount; s++) {
          const stageStr = reader.readString();
          const platformStr = reader.readString();
          const stageIndex = reader.readUByte();
          const platformIndex = reader.readUByte();

          const stage = (ShaderStage as any)[stageStr] ?? stageIndex;
          const platform = (ShaderPlatform as any)[platformStr] ?? getPlatformFromIndex(platformIndex, version);

          // Inputs
          const inputCount = reader.readUShort();
          const inputs = [];
          for (let inp = 0; inp < inputCount; inp++) {
            const inpName = reader.readString();
            const inpType: InputType = reader.readUByte();
            const semanticIndex = reader.readUByte();
            const semanticSubIndex = reader.readUByte();
            const per_instance = reader.readBool();

            let inpPrecision = Precision.none;
            if (reader.readBool()) {
              inpPrecision = reader.readUByte();
            }

            let inpInterpolation = Interpolation.none;
            if (reader.readBool()) {
              inpInterpolation = reader.readUByte();
            }

            inputs.push({
              name: inpName,
              type: inpType,
              semanticIndex,
              semanticSubIndex,
              per_instance,
              precision: inpPrecision,
              interpolation: inpInterpolation,
            });
          }

          const hash = reader.readULongLong();
          const bgfxBytes = reader.readArray();
          const bgfxReader = new BinaryReader(bgfxBytes);
          const bgfx_shader = BgfxParser.read(bgfxReader, platform, stage);

          const ext = getShaderFileExtension(platform);
          const stageName = ShaderStage[stage];
          const fileName = `${v}.${platform}.${stageName}.${ext}`;

          shaders.push({
            stage,
            platform,
            inputs,
            hash,
            bgfx_shader,
            file_name: fileName,
          });
        }

        variants.push({
          is_supported,
          flags,
          shaders,
        });
      }

      passes.push({
        name: pName,
        supported_platforms,
        fallback_pass,
        default_blend_mode,
        flag_domain,
        output_binding_signature,
        variants,
      });
    }

    // 10. Trailing validation magic
    const trailingMagic = reader.readULongLong();
    if (trailingMagic !== MATERIAL_MAGIC) {
      console.warn(`Trailing magic mismatch: ${trailingMagic} vs ${MATERIAL_MAGIC}`);
    }

    return {
      version,
      name,
      encryption,
      parent,
      buffers,
      uniforms,
      uniform_overrides,
      passes,
    };
  }

  /**
   * Serialize MaterialData back into binary format (.material.bin)
   */
  static serialize(material: MaterialData): Uint8Array {
    const writer = new BinaryWriter();
    const version = material.version;

    // 1. Magic
    writer.writeULongLong(MATERIAL_MAGIC);

    // 2. Definition header
    writer.writeString(COMPILED_MATERIAL_DEFINITION);

    // 3. Version
    writer.writeULongLong(BigInt(version));

    // 4. Encryption (NONE is "ENON")
    const encStr = material.encryption || EncryptionType.NONE;
    const revEnc = encStr.split('').reverse().join('');
    writer.writeFixedString(revEnc);

    // 5. Name & Parent
    writer.writeString(material.name);
    writer.writeBool(Boolean(material.parent));
    if (material.parent) {
      writer.writeString(material.parent);
    }

    // 6. Buffers
    writer.writeUByte(material.buffers.length);
    for (const b of material.buffers) {
      writer.writeString(b.name);
      writer.writeUShort(b.register_slot);
      writer.writeUByte(b.access);
      writer.writeUByte(b.precision >= 0 ? b.precision : 0);
      writer.writeBool(b.unordered_access);
      writer.writeUByte(b.type);
      writer.writeString(b.texture_format || '');
      writer.writeULong(b.slot_count || 1);
      writer.writeUByte(b.binding_slot || 0);

      if (version >= 26) {
        writer.writeULong(b.unknown || 0);
      }

      writer.writeBool(b.sampler_state !== null);
      if (b.sampler_state) {
        const val = (b.sampler_state.filter & 1) | ((b.sampler_state.wrapping & 1) << 1);
        writer.writeUByte(val);
      }

      writer.writeBool(Boolean(b.default_texture));
      if (b.default_texture) {
        writer.writeString(b.default_texture);
      }

      writer.writeBool(Boolean(b.texture_path));
      if (b.texture_path) {
        writer.writeString(b.texture_path);
      }

      writer.writeBool(b.custom_type_info !== null);
      if (b.custom_type_info) {
        writer.writeString(b.custom_type_info.struct);
        writer.writeULong(b.custom_type_info.size);
      }
    }

    // 7. Uniforms
    writer.writeUShort(material.uniforms.length);
    for (const u of material.uniforms) {
      writer.writeString(u.name);
      writer.writeUShort(u.type);
      if (u.type >= 2 && u.type <= 4) {
        writer.writeULong(u.count);
        writer.writeBool(u.default.length > 0);
        if (u.default.length > 0) {
          for (const val of u.default) {
            writer.writeFloat(val);
          }
        }
      }
    }

    // 8. Uniform overrides
    if (material.name !== 'Core/Builtins') {
      const entries = Object.entries(material.uniform_overrides || {});
      writer.writeUShort(entries.length);
      for (const [k, v] of entries) {
        writer.writeString(k);
        writer.writeString(v);
      }
    }

    // 9. Passes
    writer.writeUShort(material.passes.length);
    for (const p of material.passes) {
      writer.writeString(p.name);

      // Format bit string
      const platformList = getPlatformList(version);
      const bitStr = platformList
        .map((plat) => (p.supported_platforms[plat] !== false ? '1' : '0'))
        .join('');
      writer.writeString(bitStr);

      writer.writeString(p.fallback_pass || '');

      const hasBlend = p.default_blend_mode && p.default_blend_mode !== BlendMode.Unspecified;
      writer.writeBool(hasBlend);
      if (hasBlend) {
        const blendValues = Object.values(BlendMode);
        const idx = blendValues.indexOf(p.default_blend_mode);
        writer.writeUShort(idx !== -1 ? idx : 0);
      }

      // Flag domain
      const flagEntries = Object.entries(p.flag_domain || {});
      writer.writeUShort(flagEntries.length);
      if (version >= 26) {
        for (const [k, vals] of flagEntries) {
          writer.writeString(k);
          writer.writeUShort(vals.length);
          for (const v of vals) {
            writer.writeString(v);
          }
        }
      } else {
        for (const [k, vals] of flagEntries) {
          writer.writeString(k);
          writer.writeString(vals[0] || '');
        }
      }

      if (version >= 23) {
        writer.writeULong(p.output_binding_signature || 0);
      }

      // Variants
      writer.writeUShort(p.variants.length);
      for (const v of p.variants) {
        writer.writeBool(v.is_supported);
        const fEntries = Object.entries(v.flags || {});
        writer.writeUShort(fEntries.length);
        writer.writeUShort(v.shaders.length);

        for (const [fk, fv] of fEntries) {
          writer.writeString(fk);
          writer.writeString(fv);
        }

        for (const s of v.shaders) {
          const stageName = ShaderStage[s.stage];
          writer.writeString(stageName);
          writer.writeString(s.platform);
          writer.writeUByte(s.stage);
          writer.writeUByte(getPlatformIndex(s.platform, version));

          writer.writeUShort(s.inputs.length);
          for (const inp of s.inputs) {
            writer.writeString(inp.name);
            writer.writeUByte(inp.type);
            writer.writeUByte(inp.semanticIndex);
            writer.writeUByte(inp.semanticSubIndex);
            writer.writeBool(inp.per_instance);

            writer.writeBool(inp.precision !== Precision.none);
            if (inp.precision !== Precision.none) {
              writer.writeUByte(inp.precision);
            }

            writer.writeBool(inp.interpolation !== Interpolation.none);
            if (inp.interpolation !== Interpolation.none) {
              writer.writeUByte(inp.interpolation);
            }
          }

          writer.writeULongLong(s.hash);

          // BGFX shader binary bytes
          const bgfxBytes = BgfxParser.write(s.bgfx_shader, s.platform, s.stage);
          writer.writeArray(bgfxBytes);
        }
      }
    }

    // 10. Trailing magic
    writer.writeULongLong(MATERIAL_MAGIC);

    return writer.getBytes();
  }

  /**
   * Unpack material into a structured JSZip archive (Lazurite folder structure)
   */
  static async unpackToZip(material: MaterialData, folderName?: string): Promise<Blob> {
    const zip = new JSZip();
    const rootName = folderName || material.name || 'material';
    const root = zip.folder(rootName)!;

    // material.json
    const metaJson = {
      version: material.version,
      name: material.name,
      parent: material.parent,
      buffers: material.buffers.map((b) => b.name),
      uniforms: material.uniforms.map((u) => u.name),
      uniform_overrides: material.uniform_overrides,
      passes: material.passes.map((p) => p.name),
    };
    root.file('material.json', JSON.stringify(metaJson, null, 2));

    // buffers
    if (material.buffers.length > 0) {
      const bufFolder = root.folder('buffers')!;
      for (const b of material.buffers) {
        bufFolder.file(`${b.name}.json`, JSON.stringify(b, null, 2));
      }
    }

    // uniforms
    if (material.uniforms.length > 0) {
      const uFolder = root.folder('uniforms')!;
      for (const u of material.uniforms) {
        uFolder.file(`${u.name}.json`, JSON.stringify(u, null, 2));
      }
    }

    // passes
    if (material.passes.length > 0) {
      const passFolder = root.folder('passes')!;
      for (const p of material.passes) {
        // Pass JSON metadata
        const passMeta = {
          name: p.name,
          supported_platforms: p.supported_platforms,
          fallback_pass: p.fallback_pass,
          default_blend_mode: p.default_blend_mode,
          flag_domain: p.flag_domain,
          output_binding_signature: p.output_binding_signature,
          variants: p.variants.map((v, vIndex) => ({
            is_supported: v.is_supported,
            flags: v.flags,
            shaders: v.shaders.map((s) => ({
              file_name: s.file_name || `${vIndex}.${s.platform}.${ShaderStage[s.stage]}.${getShaderFileExtension(s.platform)}`,
              stage: ShaderStage[s.stage],
              platform: s.platform,
              inputs: s.inputs,
              hash: s.hash.toString(),
              bgfx_shader: {
                hash: s.bgfx_shader.hash,
                uniforms: s.bgfx_shader.uniforms,
                group_size: s.bgfx_shader.group_size,
                attributes: s.bgfx_shader.attributes,
                size: s.bgfx_shader.size,
              },
            })),
          })),
        };
        passFolder.file(`${p.name}.json`, JSON.stringify(passMeta, null, 2));

        // Subfolder with raw shaders
        const passCodeFolder = passFolder.folder(p.name)!;
        for (let vIdx = 0; vIdx < p.variants.length; vIdx++) {
          const v = p.variants[vIdx];
          for (const s of v.shaders) {
            const fileName = s.file_name || `${vIdx}.${s.platform}.${ShaderStage[s.stage]}.${getShaderFileExtension(s.platform)}`;
            if (s.bgfx_shader.shader_text) {
              passCodeFolder.file(fileName, s.bgfx_shader.shader_text);
            } else {
              passCodeFolder.file(fileName, s.bgfx_shader.shader_bytes);
            }
          }
        }
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Pack from an uploaded unpacked ZIP archive back into MaterialData
   */
  static async packFromZip(zipBuffer: ArrayBuffer): Promise<MaterialData> {
    const zip = await JSZip.loadAsync(zipBuffer);

    // Find material.json in root or immediate subfolder
    let rootPath = '';
    let metaFile = zip.file('material.json');
    if (!metaFile) {
      for (const path of Object.keys(zip.files)) {
        if (path.endsWith('/material.json') && path.split('/').length === 2) {
          metaFile = zip.file(path);
          rootPath = path.substring(0, path.lastIndexOf('/') + 1);
          break;
        }
      }
    }

    if (!metaFile) {
      throw new Error('Could not find "material.json" in the unpacked archive.');
    }

    const metaJson = JSON.parse(await metaFile.async('string'));
    const version: number = metaJson.version || LATEST_VERSION;
    const name: string = metaJson.name || 'CustomMaterial';
    const parent: string = metaJson.parent || '';
    const uniform_overrides: Record<string, string> = metaJson.uniform_overrides || {};

    // Buffers
    const buffers: BufferData[] = [];
    const bufNames: string[] = metaJson.buffers || [];
    for (const bName of bufNames) {
      const bFile = zip.file(`${rootPath}buffers/${bName}.json`);
      if (bFile) {
        const bData = JSON.parse(await bFile.async('string'));
        buffers.push(bData);
      }
    }

    // Uniforms
    const uniforms: UniformData[] = [];
    const uNames: string[] = metaJson.uniforms || [];
    for (const uName of uNames) {
      const uFile = zip.file(`${rootPath}uniforms/${uName}.json`);
      if (uFile) {
        const uData = JSON.parse(await uFile.async('string'));
        uniforms.push(uData);
      }
    }

    // Passes
    const passes: PassData[] = [];
    const passNames: string[] = metaJson.passes || [];
    for (const pName of passNames) {
      const pFile = zip.file(`${rootPath}passes/${pName}.json`);
      if (!pFile) continue;

      const pData = JSON.parse(await pFile.async('string'));
      const variants: VariantData[] = [];

      for (let vIdx = 0; vIdx < (pData.variants || []).length; vIdx++) {
        const vRaw = pData.variants[vIdx];
        const shaders: ShaderDefinitionData[] = [];

        for (const sRaw of vRaw.shaders || []) {
          const stage: ShaderStage = (ShaderStage as any)[sRaw.stage] ?? 0;
          const platform: ShaderPlatform = (ShaderPlatform as any)[sRaw.platform] ?? ShaderPlatform.ESSL_310;
          const fileName = sRaw.file_name;

          // Read shader file bytes or string
          const codeFile = zip.file(`${rootPath}passes/${pName}/${fileName}`);
          let shader_bytes = new Uint8Array();
          let shader_text: string | undefined = undefined;

          if (codeFile) {
            const rawBytes = await codeFile.async('uint8array');
            if (
              platform.startsWith('ESSL') ||
              platform.startsWith('GLSL') ||
              platform === ShaderPlatform.Metal
            ) {
              shader_text = new TextDecoder('utf-8', { fatal: false }).decode(rawBytes).replace(/\0+$/, '');
              // Sync to null-terminated bytes
              const enc = new TextEncoder().encode(shader_text);
              shader_bytes = new Uint8Array(enc.length + 1);
              shader_bytes.set(enc, 0);
              shader_bytes[enc.length] = 0;
            } else {
              shader_bytes = new Uint8Array(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength) as any;
            }
          }

          shaders.push({
            stage,
            platform,
            inputs: sRaw.inputs || [],
            hash: BigInt(sRaw.hash || '0'),
            file_name: fileName,
            bgfx_shader: {
              header: stage === ShaderStage.Vertex ? 'VSH' : stage === ShaderStage.Compute ? 'CSH' : 'FSH',
              version: stage === ShaderStage.Compute ? 3 : 5,
              hash: sRaw.bgfx_shader?.hash || 0,
              uniforms: sRaw.bgfx_shader?.uniforms || [],
              group_size: sRaw.bgfx_shader?.group_size || [],
              attributes: sRaw.bgfx_shader?.attributes || [],
              size: sRaw.bgfx_shader?.size ?? -1,
              shader_bytes,
              shader_text,
            },
          });
        }

        variants.push({
          is_supported: vRaw.is_supported ?? true,
          flags: vRaw.flags || {},
          shaders,
        });
      }

      passes.push({
        name: pName,
        supported_platforms: pData.supported_platforms || {},
        fallback_pass: pData.fallback_pass || '',
        default_blend_mode: pData.default_blend_mode || BlendMode.Unspecified,
        flag_domain: pData.flag_domain || {},
        output_binding_signature: pData.output_binding_signature || 0,
        variants,
      });
    }

    return {
      version,
      name,
      encryption: EncryptionType.NONE,
      parent,
      buffers,
      uniforms,
      uniform_overrides,
      passes,
    };
  }

  /**
   * Lazurite label(): Prepends helpful debug metadata comment headers to plain-text shaders
   */
  static labelMaterial(material: MaterialData): MaterialData {
    const copy = JSON.parse(JSON.stringify(material, (k, v) => (typeof v === 'bigint' ? v.toString() : v)));
    // Restore bigints
    for (const p of copy.passes) {
      for (const v of p.variants) {
        for (const s of v.shaders) {
          s.hash = BigInt(s.hash || '0');
          if (
            s.platform.startsWith('ESSL') ||
            s.platform.startsWith('GLSL') ||
            s.platform === ShaderPlatform.Metal
          ) {
            const comment = [
              '// =========================================',
              '// Lazurite Shader Information',
              `// Material: ${material.name}`,
              `// Pass: ${p.name}`,
              `// Platform: ${s.platform}`,
              `// Stage: ${ShaderStage[s.stage]}`,
              `// Supported: ${v.is_supported}`,
              `// Flags: ${JSON.stringify(v.flags)}`,
              '// =========================================\n',
            ].join('\n');

            if (s.bgfx_shader.shader_text && !s.bgfx_shader.shader_text.includes('Lazurite Shader Information')) {
              s.bgfx_shader.shader_text = comment + s.bgfx_shader.shader_text;
            }
          }
        }
      }
    }
    return copy;
  }

  /**
   * Convert material between format versions (e.g. 23 -> 25 -> 26)
   */
  static convertVersion(material: MaterialData, targetVersion: number): MaterialData {
    const copy: MaterialData = JSON.parse(JSON.stringify(material, (k, v) => (typeof v === 'bigint' ? v.toString() : v)));
    copy.version = targetVersion;

    for (const p of copy.passes) {
      for (const v of p.variants) {
        for (const s of v.shaders) {
          s.hash = BigInt(s.hash || '0');
          // If moving to v25+ and platform is ESSL_300, promote to ESSL_310
          if (targetVersion >= 25 && s.platform === ShaderPlatform.ESSL_300) {
            s.platform = ShaderPlatform.ESSL_310;
          }
        }
      }
    }

    return copy;
  }
}
