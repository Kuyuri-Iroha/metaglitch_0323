
PShader metaball;
PShader focal;
PMatrix3D sphereEuler = new PMatrix3D();
float[] sphereEulerVal = new float[9];
PMatrix3D particleEuler0 = new PMatrix3D();
PMatrix3D particleEuler1 = new PMatrix3D();
float[] particleEulerVal = new float[30];
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
  focal = loadShader("focal.frag");
}

void update()
{
  // time
  time = float(frameCount % 251) / 50.0;
  
  // sphere
  final float RANDOM_SCALE = 100;
  final float SPEED = 0.1;
  for(int i = 0; i < sphereEulerVal.length; i++)
  {
    sphereEulerVal[i] += (noise(time + fractSin(i / 3, i % 3, RANDOM_SCALE)) * 2.0 - 1.0) * SPEED;
  }
  sphereEuler.set(sphereEulerVal);

  // particle
  final float PARTICLE_SPEED = 0.05;
  for(int i = 0; i < particleEulerVal.length; i++)
  {
    particleEulerVal[i] += (noise(time + fractSin(i / 3 + 50, i % 3 + 50, RANDOM_SCALE)) * 2.0 - 1.0) * PARTICLE_SPEED;
  }
  particleEuler0.set(
    particleEulerVal[0], particleEulerVal[1], particleEulerVal[2], particleEulerVal[3],
    particleEulerVal[4], particleEulerVal[5], particleEulerVal[6], particleEulerVal[7],
    particleEulerVal[8], particleEulerVal[9], particleEulerVal[10], particleEulerVal[11],
    particleEulerVal[12], particleEulerVal[13], particleEulerVal[14], 0.0
  );
  particleEuler1.set(
    particleEulerVal[15], particleEulerVal[16], particleEulerVal[17], particleEulerVal[18],
    particleEulerVal[19], particleEulerVal[20], particleEulerVal[21], particleEulerVal[22],
    particleEulerVal[23], particleEulerVal[24], particleEulerVal[25], particleEulerVal[26],
    particleEulerVal[27], particleEulerVal[28], particleEulerVal[29], 0.0
  );
}

void draw()
{
  update();
  
  background(0);

  metaball.set("resolution", width, height);
  metaball.set("time", time);
  metaball.set("sphereEuler", sphereEuler, true);
  metaball.set("particleEuler0", particleEuler0, false);
  metaball.set("particleEuler1", particleEuler1, false);
  filter(metaball);

  focal.set("resolution", width, height);
  filter(focal);
  
//  println("FPS: "+frameRate);

  saveFrame("capture/####.png");
  if(250 < frameCount)
  {
    exit();
  }
}
