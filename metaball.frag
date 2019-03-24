// metaball.frag =================================

precision mediump float;

// 定数
const float PI = 3.14159265;
const float INF = 1.0 / 0.0;
const float ANGLE = 90.0;
const float FOV = ANGLE * PI/2.0 / 180.0;
const vec3 LIGHT_DIR = vec3(-0.577, 0.577, 0.577);
const int SPHERE_NUMBER = 3;
const int PARTICLE_NUMBER = 10;
const float SPHERE_SIZES[SPHERE_NUMBER] = {0.3, 0.3, 0.3};

// uniforms
uniform sampler2D texture;
uniform vec2 resolution;
uniform float time;
uniform mat3 sphereEuler;
uniform mat4 particleEuler0;
uniform mat4 particleEuler1;
out vec4 outColor;

// 変数
vec3 spherePos[SPHERE_NUMBER];
vec3 particlePos[PARTICLE_NUMBER];
float particleSize[PARTICLE_NUMBER];

// fract-sin random.
float random(vec2 st)
{
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
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
    float smoothRes = -log(h) / k;
    return 16383.9999 < smoothRes ? min(d1, d2) : smoothRes;
}

// 球
float distSphere(vec3 p, int index)
{
  return length(p + spherePos[index]) - SPHERE_SIZES[index];
}

// パーティクル
float distParticle(vec3 p, int index)
{
  return length(p + particlePos[index]) - particleSize[index];
}

// 距離関数
float distFunc(vec3 p)
{
  float dist = distSphere(p, 0);
  for(int i = 1; i < SPHERE_NUMBER; i++)
  {
    dist = smoothMin(dist, distSphere(p, i), 40.0);
  }
  for(int i = 0; i < PARTICLE_NUMBER; i++)
  {
    dist = smoothMin(dist, distParticle(p, i), 10.0);
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

  // スフィアの初期位置
  const float SPHERES_MARGIN = 1.0 * ((-cos(time / 5.0 * (PI * 2)) + 1.0) / 2.0);
  spherePos[0] = vec3(0.0, -SPHERES_MARGIN, 0.0);
  spherePos[1] = vec3(-SPHERES_MARGIN * cos(PI/6), SPHERES_MARGIN * sin(PI/6), 0.0);
  spherePos[2] = vec3(SPHERES_MARGIN * cos(PI/6), SPHERES_MARGIN * sin(PI/6), 0.0);

  // スフィアの回転
  for(int i = 0; i < SPHERE_NUMBER; i++)
  {
    spherePos[i] = rotateFromEuler(spherePos[i], sphereEuler[i]);
  }

  // パーティクルの初期位置
  const float PARTICLE_MARGIN = 1.3 * (1.0 - pow(abs(mix(-1.0, 1.0, time / 5.0)), 3.0));
  for(int i = 0; i < PARTICLE_NUMBER; i++)
  {
    particlePos[i] = vec3(PARTICLE_MARGIN * cos(PI*2 / PARTICLE_NUMBER * i), PARTICLE_MARGIN * sin(PI*2 / PARTICLE_NUMBER * i), 0.0);
  }

  // パーティクルのサイズ
  for(int i = 0; i < 10; i++)
  {
    particleSize[i] = clamp(random(vec2(i, i + 50)) * 0.1, 0.06, 0.1);
  }

  // 受け取ったパーティクル回転のセット
  vec3 particleEulerVal[10];
  for(int i = 0; i < 15; i+=3)
  {
    particleEulerVal[i/3] = vec3(particleEuler0[i/4][int(mod(i, 4))], particleEuler0[i/4][int(mod(i+1, 4))], particleEuler0[i/4][int(mod(i+2, 4))]);
  }

  for(int i = 0; i < 15; i+=3)
  {
    particleEulerVal[i/3 + 5] = vec3(particleEuler1[i/4][int(mod(i, 4))], particleEuler1[i/4][int(mod(i+1, 4))], particleEuler1[i/4][int(mod(i+2, 4))]);
  }

  // パーティクルの回転
  for(int i = 0; i < PARTICLE_NUMBER; i++)
  {
    particlePos[i] = rotateFromEuler(particlePos[i], particleEulerVal[i]);
  }

  vec3 ray = normalize(vec3(sin(FOV) * pos.x, sin(FOV) * pos.y, -cos(FOV)));

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
    // 疑似AOをスーパーサンプリング
    const float NORMAL_DELTA = 0.01;
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
    outColor.rgb = albedo;
    outColor = vec4(outColor.rgb - ao.xyz * ao.w, rayPos.z);
  }
  else
  {
    outColor = vec4(vec3(0.94), INF);
  }
}