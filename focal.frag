// focal.frag =================================

uniform sampler2D texture;
uniform vec2 resolution;
out vec4 outColor;

const float BLUR = 0.08;
const float FOCUS = 0.0;

vec4 gamma(vec4 color)
{
  return pow(color, vec4(1.0 / 2.2));
}

void main()
{
  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 texColor = texture(texture, uv);
  float focus = min(abs(texColor.w) / 100.0, 1.0);
  vec2 blur = vec2(focus * BLUR, 0.0);
  outColor = (
    (
      texColor +
      texture(texture, uv + blur.xy) +
      texture(texture, uv - blur.xy) +
      texture(texture, uv + blur.yx) +
      texture(texture, uv - blur.yx)
    ) / 5.0
  );
}