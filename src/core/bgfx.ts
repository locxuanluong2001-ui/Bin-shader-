/**
 * BGFX Shader Binary Parser and Serializer
 * Used inside RenderDragon .material.bin files
 */
import { BinaryReader, BinaryWriter } from './binary.ts';
import { BgfxShaderData, BgfxUniformData, ShaderPlatform, ShaderStage } from './types.ts';

export class BgfxParser {
  static read(reader: BinaryReader, platform: ShaderPlatform, stage: ShaderStage): BgfxShaderData {
    const headerStr = reader.readFixedString(3);
    if (!['VSH', 'FSH', 'CSH'].includes(headerStr)) {
      throw new Error(`Unrecognized BGFX shader bin header: "${headerStr}"`);
    }
    const header = headerStr as 'VSH' | 'FSH' | 'CSH';
    const version = reader.readUByte();
    if (!(version === 5 || (version === 3 && header === 'CSH'))) {
      throw new Error(`Unsupported BGFX shader bin version: ${version}`);
    }

    const hash = reader.readULong();
    const uniformCount = reader.readUShort();
    const uniforms: BgfxUniformData[] = [];

    for (let i = 0; i < uniformCount; i++) {
      const nameLen = reader.readUByte();
      const name = reader.readFixedString(nameLen);
      const type_bits = reader.readUByte();
      const count = reader.readUByte();
      const reg_index = reader.readUShort();
      const reg_count = reader.readUShort();
      uniforms.push({ name, type_bits, count, reg_index, reg_count });
    }

    const group_size: number[] = [];
    if (platform === ShaderPlatform.Metal && stage === ShaderStage.Compute) {
      group_size.push(reader.readUShort(), reader.readUShort(), reader.readUShort());
    }

    const shaderLength = reader.readULong();
    const shader_bytes = reader.readBytes(shaderLength);

    reader.readUByte(); // padding (always 0)

    const attributes: number[] = [];
    let size = -1;

    if (reader.remaining > 0) {
      const attributeCount = reader.readUByte();
      for (let i = 0; i < attributeCount; i++) {
        attributes.push(reader.readUShort());
      }
      size = reader.readUShort();
    }

    // Try decoding text for ESSL / GLSL / Metal shaders
    let shader_text: string | undefined = undefined;
    if (
      platform.startsWith('ESSL') ||
      platform.startsWith('GLSL') ||
      platform === ShaderPlatform.Metal
    ) {
      try {
        const text = new TextDecoder('utf-8', { fatal: false }).decode(shader_bytes);
        // Clean null characters at the end if any
        shader_text = text.replace(/\0+$/, '');
      } catch {
        // keep undefined if not decodeable
      }
    }

    return {
      header,
      version,
      hash,
      uniforms,
      group_size,
      shader_bytes,
      shader_text,
      attributes,
      size,
    };
  }

  static write(shader: BgfxShaderData, platform: ShaderPlatform, stage: ShaderStage): Uint8Array {
    const writer = new BinaryWriter();
    let header = 'FSH';
    let version = 5;

    if (stage === ShaderStage.Vertex) {
      header = 'VSH';
    } else if (stage === ShaderStage.Compute) {
      header = 'CSH';
      version = 3;
    }

    writer.writeFixedString(header);
    writer.writeUByte(version);
    writer.writeULong(shader.hash);
    writer.writeUShort(shader.uniforms.length);

    for (const u of shader.uniforms) {
      const enc = new TextEncoder().encode(u.name);
      writer.writeUByte(enc.length);
      writer.writeBytes(enc);
      writer.writeUByte(u.type_bits);
      writer.writeUByte(u.count);
      writer.writeUShort(u.reg_index);
      writer.writeUShort(u.reg_count);
    }

    if (platform === ShaderPlatform.Metal && stage === ShaderStage.Compute) {
      for (let i = 0; i < 3; i++) {
        writer.writeUShort(shader.group_size[i] ?? 0);
      }
    }

    // If shader_text was modified in the editor, sync it to shader_bytes!
    let bytesToWrite = shader.shader_bytes;
    if (shader.shader_text !== undefined) {
      const encoded = new TextEncoder().encode(shader.shader_text);
      // BGFX shaders for plain text platforms usually have a null byte terminator
      if (
        platform.startsWith('ESSL') ||
        platform.startsWith('GLSL') ||
        platform === ShaderPlatform.Metal
      ) {
        bytesToWrite = new Uint8Array(encoded.length + 1);
        bytesToWrite.set(encoded, 0);
        bytesToWrite[encoded.length] = 0;
      } else {
        bytesToWrite = encoded;
      }
    }

    writer.writeULong(bytesToWrite.length);
    writer.writeBytes(bytesToWrite);
    writer.writeUByte(0); // padding

    if (shader.size !== -1) {
      writer.writeUByte(shader.attributes.length);
      for (const attr of shader.attributes) {
        writer.writeUShort(attr);
      }
      writer.writeUShort(shader.size);
    }

    return writer.getBytes();
  }
}
