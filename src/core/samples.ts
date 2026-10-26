/**
 * High-quality Preloaded Sample Materials for Minecraft Bedrock RenderDragon (Android ESSL)
 * Allows users to immediately unpack, inspect, edit, and repack without needing an APK extraction.
 */
import {
  BlendMode,
  BufferAccess,
  BufferType,
  EncryptionType,
  InputType,
  Interpolation,
  MaterialData,
  Precision,
  ShaderPlatform,
  ShaderStage,
  TextureFilter,
  TextureWrap,
  UniformType,
} from './types.ts';
import { MaterialParser } from './material.ts';

// Sample RenderChunk Vertex Shader for Android (ESSL 3.10)
const RENDERCHUNK_VERTEX_GLSL = `#version 310 es
precision highp float;

// Uniforms
uniform mat4 ViewProj;
uniform mat4 World;
uniform vec4 FogColor;
uniform vec4 FogControl;
uniform vec4 ViewPositionAndTime;

// Attributes
layout(location = 0) in highp vec3 a_position;
layout(location = 1) in vec4 a_color0;
layout(location = 2) in vec2 a_texcoord0;
layout(location = 3) in vec2 a_texcoord1;

// Varyings to Fragment Shader
out vec4 v_color0;
out vec2 v_texcoord0;
out vec2 v_texcoord1;
out vec4 v_fog;
out vec3 v_worldPos;

void main() {
    vec3 pos = a_position;
    
    // --- Lazurite Android Foliage Wind Effect ---
    #if defined(SEASONS) || defined(ALPHA_TEST)
    float time = ViewPositionAndTime.w;
    if (a_color0.a < 0.99 && a_texcoord1.y > 0.8) {
        // Subtle wind swaying for leaves & tall plants
        float wave = sin(time * 2.5 + pos.x * 2.0 + pos.z * 1.5) * 0.06;
        pos.x += wave * a_texcoord1.y;
        pos.z += wave * 0.5 * a_texcoord1.y;
    }
    #endif

    vec4 worldPos = World * vec4(pos, 1.0);
    v_worldPos = worldPos.xyz;
    gl_Position = ViewProj * worldPos;

    v_color0 = a_color0;
    v_texcoord0 = a_texcoord0;
    v_texcoord1 = a_texcoord1;

    // Distance fog calculation
    float depth = length(worldPos.xyz - ViewPositionAndTime.xyz);
    float fogDensity = clamp((depth - FogControl.x) / (FogControl.y - FogControl.x), 0.0, 1.0);
    v_fog = vec4(FogColor.rgb, fogDensity);
}
`;

// Sample RenderChunk Fragment Shader for Android (ESSL 3.10)
const RENDERCHUNK_FRAGMENT_GLSL = `#version 310 es
precision highp float;

// Samplers
uniform sampler2D s_MatTexture;
uniform sampler2D s_LightMapTexture;

// Varyings
in vec4 v_color0;
in vec2 v_texcoord0;
in vec2 v_texcoord1;
in vec4 v_fog;
in vec3 v_worldPos;

// Output
layout(location = 0) out vec4 o_fragColor;

void main() {
    vec4 diffuse = texture(s_MatTexture, v_texcoord0);
    
    #if defined(ALPHA_TEST)
    if (diffuse.a < 0.5) {
        discard;
    }
    #endif

    vec4 light = texture(s_LightMapTexture, v_texcoord1);
    
    // Minecraft bedrock color tinting (grass, leaves, water)
    diffuse.rgb *= v_color0.rgb;
    
    // Apply block and sky lighting
    vec3 litColor = diffuse.rgb * light.rgb * 1.25;

    // --- Lazurite Android Vibrant Tone Mapping ---
    // Saturation and vibrance boost
    float luma = dot(litColor, vec3(0.2126, 0.7152, 0.0722));
    litColor = mix(vec3(luma), litColor, 1.15);

    // Fog blending
    vec3 finalColor = mix(litColor, v_fog.rgb, v_fog.a);

    o_fragColor = vec4(finalColor, diffuse.a * v_color0.a);
}
`;

// Sample Sky Vertex Shader for Android (ESSL 3.10)
const SKY_VERTEX_GLSL = `#version 310 es
precision highp float;

uniform mat4 ViewProj;
uniform vec4 FogColor;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color0;

out vec4 v_color0;
out vec3 v_position;

void main() {
    v_color0 = a_color0;
    v_position = a_position;
    gl_Position = ViewProj * vec4(a_position, 1.0);
}
`;

// Sample Sky Fragment Shader for Android (ESSL 3.10)
const SKY_FRAGMENT_GLSL = `#version 310 es
precision highp float;

uniform vec4 FogColor;
uniform vec4 ViewPositionAndTime;

in vec4 v_color0;
in vec3 v_position;

layout(location = 0) out vec4 o_fragColor;

void main() {
    // Smooth atmospheric horizon gradient
    float h = clamp(v_position.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 zenith = v_color0.rgb;
    vec3 horizon = FogColor.rgb * 1.05;
    
    vec3 skyColor = mix(horizon, zenith, pow(h, 0.75));
    o_fragColor = vec4(skyColor, 1.0);
}
`;

export function createSampleRenderChunk(): MaterialData {
  const vshBytes = new TextEncoder().encode(RENDERCHUNK_VERTEX_GLSL);
  const fshBytes = new TextEncoder().encode(RENDERCHUNK_FRAGMENT_GLSL);

  return {
    version: 26,
    name: 'RenderChunk',
    encryption: EncryptionType.NONE,
    parent: '',
    buffers: [
      {
        name: 'MatTexture',
        register_slot: 0,
        access: BufferAccess.readonly,
        precision: Precision.lowp,
        unordered_access: false,
        type: BufferType.texture2D,
        texture_format: '',
        slot_count: 1,
        binding_slot: 0,
        sampler_state: { filter: TextureFilter.Bilinear, wrapping: TextureWrap.Repeat },
        default_texture: 'white',
        texture_path: '',
        custom_type_info: null,
      },
      {
        name: 'LightMapTexture',
        register_slot: 1,
        access: BufferAccess.readonly,
        precision: Precision.lowp,
        unordered_access: false,
        type: BufferType.texture2D,
        texture_format: '',
        slot_count: 1,
        binding_slot: 1,
        sampler_state: { filter: TextureFilter.Bilinear, wrapping: TextureWrap.Clamp },
        default_texture: '',
        texture_path: '',
        custom_type_info: null,
      },
    ],
    uniforms: [
      { name: 'ViewProj', type: UniformType.mat4, count: 1, default: [] },
      { name: 'World', type: UniformType.mat4, count: 1, default: [] },
      { name: 'FogColor', type: UniformType.vec4, count: 1, default: [0.75, 0.85, 0.95, 1.0] },
      { name: 'FogControl', type: UniformType.vec4, count: 1, default: [32.0, 96.0, 0.0, 0.0] },
      { name: 'ViewPositionAndTime', type: UniformType.vec4, count: 1, default: [0.0, 64.0, 0.0, 120.0] },
    ],
    uniform_overrides: {
      FogColor: 'CustomFogColor',
    },
    passes: [
      {
        name: 'Opaque',
        supported_platforms: {
          [ShaderPlatform.ESSL_310]: true,
          [ShaderPlatform.ESSL_320]: true,
          [ShaderPlatform.Direct3D_SM50]: true,
          [ShaderPlatform.Metal]: true,
          [ShaderPlatform.Vulkan]: true,
        } as any,
        fallback_pass: '',
        default_blend_mode: BlendMode.Replace,
        flag_domain: {
          FOG: ['FOG_OFF', 'FOG_ON'],
          SEASONS: ['SEASONS_OFF', 'SEASONS_ON'],
        },
        output_binding_signature: 0,
        variants: [
          {
            is_supported: true,
            flags: { FOG: 'FOG_ON', SEASONS: 'SEASONS_OFF' },
            shaders: [
              {
                stage: ShaderStage.Vertex,
                platform: ShaderPlatform.ESSL_310,
                inputs: [
                  { name: 'a_position', type: InputType.vec3, semanticIndex: 0, semanticSubIndex: 0, per_instance: false, precision: Precision.highp, interpolation: Interpolation.none },
                  { name: 'a_color0', type: InputType.vec4, semanticIndex: 4, semanticSubIndex: 0, per_instance: false, precision: Precision.lowp, interpolation: Interpolation.none },
                  { name: 'a_texcoord0', type: InputType.vec2, semanticIndex: 7, semanticSubIndex: 0, per_instance: false, precision: Precision.mediump, interpolation: Interpolation.none },
                  { name: 'a_texcoord1', type: InputType.vec2, semanticIndex: 7, semanticSubIndex: 1, per_instance: false, precision: Precision.mediump, interpolation: Interpolation.none },
                ],
                hash: 1048576n,
                bgfx_shader: {
                  header: 'VSH',
                  version: 5,
                  hash: 1001,
                  uniforms: [
                    { name: 'ViewProj', type_bits: 4, count: 1, reg_index: 0, reg_count: 4 },
                    { name: 'World', type_bits: 4, count: 1, reg_index: 4, reg_count: 4 },
                    { name: 'ViewPositionAndTime', type_bits: 2, count: 1, reg_index: 8, reg_count: 1 },
                  ],
                  group_size: [],
                  shader_bytes: vshBytes,
                  shader_text: RENDERCHUNK_VERTEX_GLSL,
                  attributes: [0, 4, 7],
                  size: 32,
                },
              },
              {
                stage: ShaderStage.Fragment,
                platform: ShaderPlatform.ESSL_310,
                inputs: [],
                hash: 2097152n,
                bgfx_shader: {
                  header: 'FSH',
                  version: 5,
                  hash: 1002,
                  uniforms: [
                    { name: 's_MatTexture', type_bits: 1, count: 1, reg_index: 0, reg_count: 1 },
                    { name: 's_LightMapTexture', type_bits: 1, count: 1, reg_index: 1, reg_count: 1 },
                    { name: 'FogColor', type_bits: 2, count: 1, reg_index: 2, reg_count: 1 },
                  ],
                  group_size: [],
                  shader_bytes: fshBytes,
                  shader_text: RENDERCHUNK_FRAGMENT_GLSL,
                  attributes: [],
                  size: -1,
                },
              },
            ],
          },
          {
            is_supported: true,
            flags: { FOG: 'FOG_ON', SEASONS: 'SEASONS_ON' },
            shaders: [
              {
                stage: ShaderStage.Vertex,
                platform: ShaderPlatform.ESSL_310,
                inputs: [
                  { name: 'a_position', type: InputType.vec3, semanticIndex: 0, semanticSubIndex: 0, per_instance: false, precision: Precision.highp, interpolation: Interpolation.none },
                  { name: 'a_color0', type: InputType.vec4, semanticIndex: 4, semanticSubIndex: 0, per_instance: false, precision: Precision.lowp, interpolation: Interpolation.none },
                  { name: 'a_texcoord0', type: InputType.vec2, semanticIndex: 7, semanticSubIndex: 0, per_instance: false, precision: Precision.mediump, interpolation: Interpolation.none },
                ],
                hash: 1048577n,
                bgfx_shader: {
                  header: 'VSH',
                  version: 5,
                  hash: 1003,
                  uniforms: [
                    { name: 'ViewProj', type_bits: 4, count: 1, reg_index: 0, reg_count: 4 },
                    { name: 'World', type_bits: 4, count: 1, reg_index: 4, reg_count: 4 },
                  ],
                  group_size: [],
                  shader_bytes: vshBytes,
                  shader_text: RENDERCHUNK_VERTEX_GLSL,
                  attributes: [0, 4, 7],
                  size: 32,
                },
              },
              {
                stage: ShaderStage.Fragment,
                platform: ShaderPlatform.ESSL_310,
                inputs: [],
                hash: 2097153n,
                bgfx_shader: {
                  header: 'FSH',
                  version: 5,
                  hash: 1004,
                  uniforms: [
                    { name: 's_MatTexture', type_bits: 1, count: 1, reg_index: 0, reg_count: 1 },
                  ],
                  group_size: [],
                  shader_bytes: fshBytes,
                  shader_text: RENDERCHUNK_FRAGMENT_GLSL,
                  attributes: [],
                  size: -1,
                },
              },
            ],
          },
        ],
      },
      {
        name: 'Transparent',
        supported_platforms: {
          [ShaderPlatform.ESSL_310]: true,
          [ShaderPlatform.ESSL_320]: true,
        } as any,
        fallback_pass: '',
        default_blend_mode: BlendMode.AlphaBlend,
        flag_domain: {
          FOG: ['FOG_OFF', 'FOG_ON'],
        },
        output_binding_signature: 0,
        variants: [
          {
            is_supported: true,
            flags: { FOG: 'FOG_ON' },
            shaders: [
              {
                stage: ShaderStage.Vertex,
                platform: ShaderPlatform.ESSL_310,
                inputs: [
                  { name: 'a_position', type: InputType.vec3, semanticIndex: 0, semanticSubIndex: 0, per_instance: false, precision: Precision.highp, interpolation: Interpolation.none },
                ],
                hash: 1048580n,
                bgfx_shader: {
                  header: 'VSH',
                  version: 5,
                  hash: 1005,
                  uniforms: [
                    { name: 'ViewProj', type_bits: 4, count: 1, reg_index: 0, reg_count: 4 },
                  ],
                  group_size: [],
                  shader_bytes: vshBytes,
                  shader_text: RENDERCHUNK_VERTEX_GLSL,
                  attributes: [0],
                  size: 16,
                },
              },
              {
                stage: ShaderStage.Fragment,
                platform: ShaderPlatform.ESSL_310,
                inputs: [],
                hash: 2097155n,
                bgfx_shader: {
                  header: 'FSH',
                  version: 5,
                  hash: 1006,
                  uniforms: [
                    { name: 's_MatTexture', type_bits: 1, count: 1, reg_index: 0, reg_count: 1 },
                  ],
                  group_size: [],
                  shader_bytes: fshBytes,
                  shader_text: RENDERCHUNK_FRAGMENT_GLSL,
                  attributes: [],
                  size: -1,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

export function createSampleSky(): MaterialData {
  const vshBytes = new TextEncoder().encode(SKY_VERTEX_GLSL);
  const fshBytes = new TextEncoder().encode(SKY_FRAGMENT_GLSL);

  return {
    version: 26,
    name: 'Sky',
    encryption: EncryptionType.NONE,
    parent: '',
    buffers: [],
    uniforms: [
      { name: 'ViewProj', type: UniformType.mat4, count: 1, default: [] },
      { name: 'FogColor', type: UniformType.vec4, count: 1, default: [0.65, 0.78, 0.95, 1.0] },
      { name: 'ViewPositionAndTime', type: UniformType.vec4, count: 1, default: [0.0, 64.0, 0.0, 60.0] },
    ],
    uniform_overrides: {},
    passes: [
      {
        name: 'SkyPass',
        supported_platforms: {
          [ShaderPlatform.ESSL_310]: true,
          [ShaderPlatform.ESSL_320]: true,
          [ShaderPlatform.Direct3D_SM50]: true,
        } as any,
        fallback_pass: '',
        default_blend_mode: BlendMode.NoneMode,
        flag_domain: {},
        output_binding_signature: 0,
        variants: [
          {
            is_supported: true,
            flags: {},
            shaders: [
              {
                stage: ShaderStage.Vertex,
                platform: ShaderPlatform.ESSL_310,
                inputs: [
                  { name: 'a_position', type: InputType.vec3, semanticIndex: 0, semanticSubIndex: 0, per_instance: false, precision: Precision.highp, interpolation: Interpolation.none },
                  { name: 'a_color0', type: InputType.vec4, semanticIndex: 4, semanticSubIndex: 0, per_instance: false, precision: Precision.lowp, interpolation: Interpolation.none },
                ],
                hash: 3141592n,
                bgfx_shader: {
                  header: 'VSH',
                  version: 5,
                  hash: 2001,
                  uniforms: [
                    { name: 'ViewProj', type_bits: 4, count: 1, reg_index: 0, reg_count: 4 },
                  ],
                  group_size: [],
                  shader_bytes: vshBytes,
                  shader_text: SKY_VERTEX_GLSL,
                  attributes: [0, 4],
                  size: 28,
                },
              },
              {
                stage: ShaderStage.Fragment,
                platform: ShaderPlatform.ESSL_310,
                inputs: [],
                hash: 3141593n,
                bgfx_shader: {
                  header: 'FSH',
                  version: 5,
                  hash: 2002,
                  uniforms: [
                    { name: 'FogColor', type_bits: 2, count: 1, reg_index: 0, reg_count: 1 },
                  ],
                  group_size: [],
                  shader_bytes: fshBytes,
                  shader_text: SKY_FRAGMENT_GLSL,
                  attributes: [],
                  size: -1,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

export function getSampleBinFiles(): { name: string; getBytes: () => Uint8Array }[] {
  return [
    {
      name: 'RenderChunk.material.bin',
      getBytes: () => MaterialParser.serialize(createSampleRenderChunk()),
    },
    {
      name: 'Sky.material.bin',
      getBytes: () => MaterialParser.serialize(createSampleSky()),
    },
  ];
}
