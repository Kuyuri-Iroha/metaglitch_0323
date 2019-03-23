
PShader metaball;

void setup()
{
  size(500, 500, P3D);
  frameRate(50);
  textureMode(REPEAT);
  smooth(16);

  metaball = loadShader("metaball.frag");
}

void draw()
{
  background(0);
  metaball.set("resolution", width, height);
  metaball.set("time", float(frameCount) / 50.0);
  filter(metaball);
  
//  println("FPS: "+frameRate);

//  saveFrame("capture/####.png");
  if(400 < frameCount)
  {
//    exit();
  }
}
