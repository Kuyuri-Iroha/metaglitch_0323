//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}


// metaball.frag =================================

uniform sampler2D texture;
uniform vec2 resolution;
uniform float time;
out vec4 outColor;

// 定数
const float PI = 3.14159265;
const float ANGLE = 90.0;
const float FOV = ANGLE * PI/2.0 / 180.0;
const vec3 LIGHT_DIR = vec3(-0.577, 0.577, 0.577);
const int SPHERE_NUMBER = 3;
const int PARTICLE_NUMBER = 10;
const float SPHERE_SIZES[SPHERE_NUMBER] = {0.5, 0.5, 0.5};
const float PARTICLE_SIZES[PARTICLE_NUMBER] = {0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1};

// 変数
vec3 spherePos[SPHERE_NUMBER];
vec3 particlePos[PARTICLE_NUMBER];

// 転置行列
mat3 transpose(in mat3 origin)
{
  return mat3(
    origin[0][0], origin[1][0], origin[2][0],
    origin[0][1], origin[1][1], origin[2][1],
    origin[0][2], origin[1][2], origin[2][2]
  );
}

// Euler rotate
vec3 rotateFromEuler(vec3 pos, vec3 euler)
{
  vec3 s = vec3(sin(euler.x), sin(euler.y), sin(euler.z));
  vec3 c = vec3(cos(euler.x), cos(euler.y), cos(euler.z));
  mat3 rot = mat3(
    c.z*c.y, -s.z*c.x+c.z*s.y*s.x,  s.z*s.x+c.z*s.y*c.x,
    s.z*c.y,  c.z*c.x+s.z*s.y*s.x, c.z*-s.x+s.z*s.y*c.x,
       -s.y,              c.y*s.x,              c.y*c.x
  );
  return rot * pos;
}

// smoothing min
float smoothMin(float d1, float d2, float k){
    float h = exp(-k * d1) + exp(-k * d2);
    return -log(h) / k;
}

// 球の距離関数
float distSphere(vec3 p, float size)
{
    return length(p) - size;
}

// 球
float distSphere(vec3 p, int index)
{
  return length(p + spherePos[index]) - SPHERE_SIZES[index];
}

// パーティクル
float distParticle(vec3 p, int index)
{
  return length(p + particlePos[index]) - PARTICLE_SIZES[index];
}

// 距離関数
float distFunc(vec3 p)
{
  float dist = distSphere(p, 0);
  for(int i = 1; i < SPHERE_NUMBER; i++)
  {
    dist = smoothMin(dist, distSphere(p, i), 50.0);
  }
  return dist;
}

// 法線の取得
vec3 getNormal(vec3 p)
{
  const float DELTA = 0.0001;
  return normalize(vec3(
    distFunc(p + vec3(DELTA, 0.0, 0.0)) - distFunc(p + vec3(-DELTA, 0.0, 0.0)),
    distFunc(p + vec3(0.0, DELTA, 0.0)) - distFunc(p + vec3(0.0, -DELTA, 0.0)),
    distFunc(p + vec3(0.0, 0.0, DELTA)) - distFunc(p + vec3(0.0, 0.0, -DELTA))
  ));
}

// 疑似AOの計算
// https://qiita.com/edo_m18/items/63dbacb57db3b7734483
vec4 genAmbientOcclusion(vec3 ro, vec3 rd)
{
    vec4 totalAO = vec4(0.0);
    float sca = 1.0;

    for (int aoI = 0; aoI < 5; aoI++)
    {
        float ray2nd = 0.01 + 0.02 * float(aoI * aoI);
        vec3 aoPos = ro + rd * ray2nd;
        float distRes = distFunc(aoPos);
        float ao = clamp(-(distRes - ray2nd), 0.0, 1.0);
        totalAO += ao * sca * vec4(1.0, 1.0, 1.0, 1.0);
        sca *= 0.75;
    }

    const float AO_COEF = 0.5;
    totalAO.w = 1.0 - clamp(AO_COEF * totalAO.w, 0.0, 1.0);

    return totalAO;
}

void main()
{
  vec2 pos = (gl_FragCoord.xy * 2.0 - resolution) / resolution;

  vec3 camPos = vec3(0.0, 0.0, 2.0);
  vec3 camDir = vec3(0.0, 0.0, -1.0);
  vec3 camUp = vec3(0.0, 1.0, 0.0);
  vec3 camSide = cross(camDir, camUp);
  float targetDepth = 1.0;

  // スフィアの移動
  float moveT = time / 1.5;
  spherePos[0].x = cnoise(vec3(moveT, 0.0, 0.0)) * 1.0;
  spherePos[0].y = cnoise(vec3(0.0, moveT, 0.0)) * 1.0;
  spherePos[0].z = cnoise(vec3(0.0, 0.0, moveT)) * 0.5;
  spherePos[1].x = cnoise(vec3(-moveT + 4.0, 0.0, 0.0)) * 1.0 + 0.7;
  spherePos[1].y = cnoise(vec3(moveT, -moveT, 0.0)) * 2.0;
  spherePos[1].z = cnoise(vec3(0.0, 0.0, -moveT + 4.0)) * 0.5;
  spherePos[2].x = cnoise(vec3(moveT + 20.0, -moveT, 0.0)) * 2.0;
  spherePos[2].y = cnoise(vec3(0.0, moveT + 20.0, 0.0)) * 1.0 - 0.7;
  spherePos[2].z = cnoise(vec3(0.0, 0.0, moveT + 20.0)) * 0.5;

  vec3 ray = normalize(vec3(sin(FOV) * pos.x - 0.2, sin(FOV) * pos.y + 0.2, -cos(FOV)));

  float distance = 0.0;
  float rayLength = 0.0;
  vec3 rayPos = camPos;
  const float EPS = 0.001;
  const int MAX_STEPS = 128;
  for(int i = 0; i < MAX_STEPS; i++)
  {
    rayPos = camPos + ray * rayLength;

    distance = distFunc(rayPos);

    if(abs(distance) < EPS) break;

    rayLength += distance;
  }

  // hit check
  if(abs(distance) < EPS)
  {
    const float NORMAL_DELTA = 0.3;
    vec3 normal[7];
    normal[0] = getNormal(rayPos);
    normal[1] = getNormal(rayPos + vec3(-NORMAL_DELTA, 0.0, 0.0));
    normal[2] = getNormal(rayPos + vec3(NORMAL_DELTA, 0.0, 0.0));
    normal[3] = getNormal(rayPos + vec3(0.0, -NORMAL_DELTA, 0.0));
    normal[4] = getNormal(rayPos + vec3(0.0, NORMAL_DELTA, 0.0));
    normal[5] = getNormal(rayPos + vec3(0.0, 0.0, -NORMAL_DELTA));
    normal[6] = getNormal(rayPos + vec3(0.0, 0.0, NORMAL_DELTA));

    vec4 ao;
    for(int i = 0; i < 7; i++)
    {
      ao += genAmbientOcclusion(rayPos, normal[i]) * 0.14285714285;
    }

    vec3 albedo = vec3(1.0);
//    float diffuse = clamp(dot(LIGHT_DIR, normal[0]), 0.1, 1.0);
    outColor.rgb = albedo;
    outColor = vec4(outColor.rgb - ao.xyz * ao.w, 1.0);
  }
  else
  {
    outColor = vec4(vec3(0.94), 1.0);
  }
}