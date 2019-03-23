
PShader metaball;
PMatrix3D sphereEuler = new PMatrix3D();
float time = 0;

float fract(float a)
{
  return a - floor(a);
}

float fractSin (float x, float y, float scale)
{
  return scale * fract(sin(PVector.dot(new PVector(x, y), new PVector(12.9898,78.233))) * 43758.5453123);
}

void setup()
{
  size(500, 500, P3D);
  frameRate(50);
  textureMode(REPEAT);
  smooth(16);

  metaball = loadShader("metaball.frag");
}

void update()
{
  // time
  time = float(frameCount) / 50.0;
  
  // sphere
  final float RANDOM_SCALE = 100;
  sphereEuler.m00 += (noise(time + fractSin(0, 1, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
  sphereEuler.m01 += (noise(time + fractSin(0, 2, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
  sphereEuler.m02 += (noise(time + fractSin(0, 3, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
  sphereEuler.m10 += (noise(time + fractSin(1, 1, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
  sphereEuler.m11 += (noise(time + fractSin(1, 2, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
  sphereEuler.m12 += (noise(time + fractSin(1, 3, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
  sphereEuler.m20 += (noise(time + fractSin(2, 1, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
  sphereEuler.m21 += (noise(time + fractSin(2, 2, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
  sphereEuler.m22 += (noise(time + fractSin(2, 3, RANDOM_SCALE)) * 2.0 - 1.0) * 0.1;
}

void draw()
{
  update();
  
  background(0);
  metaball.set("resolution", width, height);
  metaball.set("time", time);
  metaball.set("sphereEuler", sphereEuler, true);
  filter(metaball);
  
//  println("FPS: "+frameRate);

//  saveFrame("capture/####.png");
  if(400 < frameCount)
  {
//    exit();
  }
}
