// glitch.frag =================================

precision mediump float;

const float PI = 3.14159265;

uniform sampler2D texture;
uniform vec2 resolution;
uniform float time;
out vec4 outColor;

// スクリーンを任意の分割数で分割
float segmentation(vec2 uv, vec2 divNum) {
  return floor(divNum.x * uv.x) + divNum.x * floor(divNum.y * uv.y);
}

float random(float v)
{
  return fract(sin(691.43 * v) * 571.54);
}

float random2(vec2 st)
{
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

float waveFunc(float x)
{
  return abs(x) <= 1.0 ? pow(min(cos(PI * x / 2.0), 1.0 - abs(x)), 3.5) : 0.0;
}

float wave(float py)
{
  float div = floor(py * 100.0) / 100.0;
  float t = mod(time * 40.0, 100.0) - 20.0;

  return waveFunc(div * 10.0 + t) / 30.0;
}

float whiteNoise(vec2 p)
{
  return clamp(random2(p + floor(time * 10.0)) * 4.0, 0.92, 1.0);
}

float scaningLine(float py)
{
  return clamp(step(0.2, (sin(py * 400.0 + -time * 0.9) + 1.0) / 2.0), 0.84, 1.0);
}

float crack(float py)
{
  float div = floor(py * 4.0);
  float param = step(0.95, waveFunc(mod(time * 0.76, 2.0) - 1.0));

  return -(0.5 < div && div < 1.5 ? 1.0 : 0.0) * 0.1 * param;
}

void main()
{
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 scPos = (gl_FragCoord.xy * 2.0 - resolution) / resolution;

  // 見た目が変化する定数群
  const float SEG_SHIFT = 0.7;
  const float THRESHOLD = 0.1;
  const float AMPLIFIER = 0.5;
  const float POW_MAGNITUDE = 2.0;
  const vec2 SEGMENT_DIV_NUM = vec2(3.0, 9.0);
  const float DISPLACE_STRENGTH = 0.15;
  const vec3 RGB_SHIFT = vec3(1.4, 1.0, 1.0);
  const float GLITCH_ENABLED_SEED = 0.1;
  const vec2 DISPLACE_VAL_SEED = vec2(0.5, 0.3);

  // グリッチの強さ
  float magnitudeScale = (-cos(float(time)) + 1.0) / 2.0;

  vec2 displace = vec2(0.0, 0.0);
  for(int i = 0; i < 2; i++)
  {
    float divNumScale = pow(POW_MAGNITUDE, float(i));
    float id = segmentation(uv + SEG_SHIFT * float(i), SEGMENT_DIV_NUM * divNumScale);

    if(random(GLITCH_ENABLED_SEED + id) < THRESHOLD)
    {
      float displaceValX = random(DISPLACE_VAL_SEED.x + id) * 2.0 - 1.0;
      float displaceValY = random(DISPLACE_VAL_SEED.y + id) * 2.0 - 1.0;
      displace += vec2(displaceValX, displaceValY) / divNumScale * DISPLACE_STRENGTH;
    }
  }
  displace *= AMPLIFIER;

  vec2 waveDisplace = vec2(-wave(scPos.y), 0.0);
  vec2 crackDisplace = vec2(-crack(uv.y), 0.0);

  outColor = vec4(vec3(
    texture(texture, uv + RGB_SHIFT.r * displace + waveDisplace + crackDisplace).r,
    texture(texture, uv + RGB_SHIFT.g * displace + waveDisplace + crackDisplace).g,
    texture(texture, uv + RGB_SHIFT.b * displace + waveDisplace + crackDisplace).b
  ), 1.0);

  outColor.rgb = outColor.rgb * whiteNoise(scPos) * scaningLine(scPos.y);
}