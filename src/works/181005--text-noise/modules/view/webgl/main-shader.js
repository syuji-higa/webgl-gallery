export const vShader = `
  const float PI = 3.1415926;

  float interpolate(float a, float b, float x){
    float f = (1. - cos(x * PI)) * .5;
    return a * (1. - f) + b * f;
  }

  float rand(vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float irand(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec4 v = vec4(
      rand(vec2(i.x,      i.y     )),
      rand(vec2(i.x + 1., i.y     )),
      rand(vec2(i.x,      i.y + 1.)),
      rand(vec2(i.x + 1., i.y + 1.))
    );
    return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);
  }

  attribute vec3  position;
  attribute vec2  coord;
  uniform   mat4  mvpMatrix;
  varying   vec2  vCoord;

  void main(void) {
    vCoord = coord;

    vec3 _p = position;

    vec4 _destPos = mvpMatrix * vec4(_p, 1.);

    gl_Position = _destPos;
  }
`;

export const fShader = `
  precision mediump float;

  uniform sampler2D texture;
  uniform vec2      resolution;
  uniform vec4      objectStatus; // power, speed, scale, rgbShift
  uniform float     time;
  uniform vec4      pov; // point of view => x, y, xVelocity, yVelocity
  varying vec2      vCoord;

  // [0,1] -> [-1,1]
  float normZeroCenter(float n) {
    return n * 2. - 1.;
  }

  void main(void) {
    vec2 _p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    vec4 _os = objectStatus;
    float _t = time * .001 * _os.y;

    float _translateRate = 50.0 * _os.z * abs(sin(_t));
    float _translateRatio = (exp(sin(_t) * 3.) / exp(3.)) * .2 * _os.x;
    vec2 _translate = vec2(
      normZeroCenter(abs(cos(floor(_p.y * _translateRate) + sin(_t) * 100.))) * _translateRatio,
      normZeroCenter(abs(sin(floor(_p.x * _translateRate) + cos(_t) * 100.))) * _translateRatio
    );

    mat3 _transform = mat3(
      1., 0., _translate.x,
      0., 1., _translate.y,
      0., 0., 1.
    );

    float rgbShiftRate = .02 * _os.w;

    vec4 _smpColor1 = texture2D(texture, (vec3(vCoord, 1.) * _transform).xy + pov.z * rgbShiftRate);
    vec4 _smpColor2 = texture2D(texture, (vec3(vCoord, 1.) * _transform).xy + pov.w * rgbShiftRate);
    vec4 _smpColor3 = texture2D(texture, (vec3(vCoord, 1.) * _transform).xy + length(pov.zw) * rgbShiftRate);

    vec4 _smpColor = vec4(
      _smpColor1.r,
      _smpColor2.g,
      _smpColor3.b,
      _smpColor1.r + _smpColor2.g + _smpColor2.b
    );

    gl_FragColor = _smpColor;
  }
`;
