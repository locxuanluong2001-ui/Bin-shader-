/**
 * Binary Reader and Writer for Minecraft Bedrock RenderDragon materials.
 * Strictly adheres to Python struct packing / unpacking formats used in veka0/lazurite.
 */

export class BinaryReader {
  private view: DataView;
  private buffer: Uint8Array;
  public offset: number;

  constructor(data: ArrayBuffer | Uint8Array) {
    if (data instanceof Uint8Array) {
      this.buffer = data;
      this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    } else {
      this.buffer = new Uint8Array(data);
      this.view = new DataView(data);
    }
    this.offset = 0;
  }

  get length(): number {
    return this.buffer.byteLength;
  }

  get remaining(): number {
    return this.buffer.byteLength - this.offset;
  }

  readUByte(): number {
    if (this.offset + 1 > this.buffer.byteLength) {
      throw new Error(`Unexpected EOF reading ubyte at offset ${this.offset}`);
    }
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  readBool(): boolean {
    return this.readUByte() !== 0;
  }

  readUShort(): number {
    if (this.offset + 2 > this.buffer.byteLength) {
      throw new Error(`Unexpected EOF reading ushort at offset ${this.offset}`);
    }
    const val = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return val;
  }

  readULong(): number {
    if (this.offset + 4 > this.buffer.byteLength) {
      throw new Error(`Unexpected EOF reading ulong at offset ${this.offset}`);
    }
    const val = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return val;
  }

  readULongLong(): bigint {
    if (this.offset + 8 > this.buffer.byteLength) {
      throw new Error(`Unexpected EOF reading ulonglong at offset ${this.offset}`);
    }
    const val = this.view.getBigUint64(this.offset, true);
    this.offset += 8;
    return val;
  }

  readFloat(): number {
    if (this.offset + 4 > this.buffer.byteLength) {
      throw new Error(`Unexpected EOF reading float at offset ${this.offset}`);
    }
    const val = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return val;
  }

  readBytes(count: number): Uint8Array {
    if (this.offset + count > this.buffer.byteLength) {
      throw new Error(`Unexpected EOF reading ${count} bytes at offset ${this.offset}`);
    }
    const sub = this.buffer.subarray(this.offset, this.offset + count);
    this.offset += count;
    return sub;
  }

  readArray(): Uint8Array {
    const len = this.readULong();
    return this.readBytes(len);
  }

  readString(): string {
    const bytes = this.readArray();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(bytes);
  }

  readFixedString(count: number): string {
    const bytes = this.readBytes(count);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(bytes);
  }
}

export class BinaryWriter {
  private chunks: Uint8Array[] = [];
  private totalSize = 0;

  writeUByte(val: number): void {
    const buf = new Uint8Array(1);
    buf[0] = val & 0xff;
    this.append(buf);
  }

  writeBool(val: boolean): void {
    this.writeUByte(val ? 1 : 0);
  }

  writeUShort(val: number): void {
    const buf = new Uint8Array(2);
    const view = new DataView(buf.buffer);
    view.setUint16(0, val, true);
    this.append(buf);
  }

  writeULong(val: number): void {
    const buf = new Uint8Array(4);
    const view = new DataView(buf.buffer);
    view.setUint32(0, val, true);
    this.append(buf);
  }

  writeULongLong(val: bigint | number): void {
    const buf = new Uint8Array(8);
    const view = new DataView(buf.buffer);
    view.setBigUint64(0, typeof val === 'bigint' ? val : BigInt(val), true);
    this.append(buf);
  }

  writeFloat(val: number): void {
    const buf = new Uint8Array(4);
    const view = new DataView(buf.buffer);
    view.setFloat32(0, val, true);
    this.append(buf);
  }

  writeBytes(bytes: Uint8Array): void {
    this.append(bytes);
  }

  writeArray(bytes: Uint8Array): void {
    this.writeULong(bytes.byteLength);
    this.append(bytes);
  }

  writeString(str: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.writeArray(bytes);
  }

  writeFixedString(str: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.append(bytes);
  }

  private append(buf: Uint8Array): void {
    this.chunks.push(buf);
    this.totalSize += buf.byteLength;
  }

  getBytes(): Uint8Array {
    const result = new Uint8Array(this.totalSize);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return result;
  }
}
