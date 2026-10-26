/**
 * Lazurite Core Types and Enums
 * Based on veka0/lazurite (RenderDragon shader toolchain for Minecraft Bedrock)
 */

export enum ShaderPlatform {
  Direct3D_SM40 = 'Direct3D_SM40',
  Direct3D_SM50 = 'Direct3D_SM50',
  Direct3D_SM60 = 'Direct3D_SM60',
  Direct3D_SM65 = 'Direct3D_SM65',
  Direct3D_XB1 = 'Direct3D_XB1',
  Direct3D_XBX = 'Direct3D_XBX',
  GLSL_120 = 'GLSL_120',
  GLSL_430 = 'GLSL_430',
  ESSL_300 = 'ESSL_300', // Removed in format version 25
  ESSL_310 = 'ESSL_310', // Standard for Minecraft Bedrock Android
  ESSL_320 = 'ESSL_320', // Modern Android in 1.20.60+
  Metal = 'Metal',       // iOS / macOS
  Vulkan = 'Vulkan',     // Switch / Modern
  Nvn = 'Nvn',           // Switch older
  PSSL = 'PSSL',         // PlayStation
  Unknown = 'Unknown',
}

export enum ShaderStage {
  Vertex = 0,
  Fragment = 1,
  Compute = 2,
  Unknown = 3,
}

export enum EncryptionType {
  NONE = 'NONE',
  SIMPLE_PASSPHRASE = 'SMPL',
  KEY_PAIR = 'KYPR',
}

export enum BlendMode {
  Unspecified = 'Unspecified',
  NoneMode = 'NoneMode',
  Replace = 'Replace',
  AlphaBlend = 'AlphaBlend',
  ColorBlendAlphaAdd = 'ColorBlendAlphaAdd',
  PreMultiplied = 'PreMultiplied',
  InvertColor = 'InvertColor',
  Additive = 'Additive',
  AdditiveAlpha = 'AdditiveAlpha',
  Multiply = 'Multiply',
  MultiplyBoth = 'MultiplyBoth',
  InverseSrcAlpha = 'InverseSrcAlpha',
  SrcAlpha = 'SrcAlpha',
}

export enum Precision {
  none = -1,
  lowp = 0,
  mediump = 1,
  highp = 2,
}

export enum BufferAccess {
  undefined = 0,
  readonly = 1,
  writeonly = 2,
  readwrite = 3,
}

export enum BufferType {
  texture2D = 0,
  texture2DArray = 1,
  external2D = 2,
  texture3D = 3,
  textureCube = 4,
  textureCubeArray = 5,
  structBuffer = 6,
  rawBuffer = 7,
  accelerationStructure = 8,
  shadow2D = 9,
  shadow2DArray = 10,
}

export enum TextureFilter {
  Point = 0,
  Bilinear = 1,
}

export enum TextureWrap {
  Clamp = 0,
  Repeat = 1,
}

export enum UniformType {
  vec4 = 2,
  mat3 = 3,
  mat4 = 4,
  external = 5,
}

export enum InputType {
  float = 0,
  vec2 = 1,
  vec3 = 2,
  vec4 = 3,
  int = 4,
  ivec2 = 5,
  ivec3 = 6,
  ivec4 = 7,
  uint = 8,
  uvec2 = 9,
  uvec3 = 10,
  uvec4 = 11,
  mat4 = 12,
}

export enum Interpolation {
  none = -1,
  flat = 0,
  smooth = 1,
  noperspective = 2,
  centroid = 3,
}

export interface SamplerStateData {
  filter: TextureFilter;
  wrapping: TextureWrap;
}

export interface CustomTypeInfoData {
  struct: string;
  size: number;
}

export interface BufferData {
  name: string;
  register_slot: number;
  access: BufferAccess;
  precision: Precision;
  unordered_access: boolean;
  type: BufferType;
  texture_format: string;
  slot_count: number;
  binding_slot: number;
  unknown?: number;
  sampler_state: SamplerStateData | null;
  default_texture: string;
  texture_path: string;
  custom_type_info: CustomTypeInfoData | null;
}

export interface UniformData {
  name: string;
  type: UniformType;
  count: number;
  default: number[];
}

export interface ShaderInputData {
  name: string;
  type: InputType;
  semanticIndex: number;
  semanticSubIndex: number;
  per_instance: boolean;
  precision: Precision;
  interpolation: Interpolation;
}

export interface BgfxUniformData {
  name: string;
  type_bits: number;
  count: number;
  reg_index: number;
  reg_count: number;
}

export interface BgfxShaderData {
  header: 'VSH' | 'FSH' | 'CSH';
  version: number;
  hash: number;
  uniforms: BgfxUniformData[];
  group_size: number[];
  shader_bytes: Uint8Array;
  shader_text?: string;
  attributes: number[];
  size: number;
}

export interface ShaderDefinitionData {
  stage: ShaderStage;
  platform: ShaderPlatform;
  inputs: ShaderInputData[];
  hash: bigint;
  bgfx_shader: BgfxShaderData;
  file_name?: string;
}

export interface VariantData {
  is_supported: boolean;
  flags: Record<string, string>;
  shaders: ShaderDefinitionData[];
}

export interface PassData {
  name: string;
  supported_platforms: Record<ShaderPlatform, boolean>;
  fallback_pass: string;
  default_blend_mode: BlendMode;
  flag_domain: Record<string, string[]>;
  output_binding_signature: number;
  variants: VariantData[];
}

export interface MaterialData {
  version: number;
  name: string;
  encryption: EncryptionType;
  parent: string;
  buffers: BufferData[];
  uniforms: UniformData[];
  uniform_overrides: Record<string, string>;
  passes: PassData[];
}
