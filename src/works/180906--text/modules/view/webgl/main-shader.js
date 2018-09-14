export const vShader = `
  attribute vec3  position;
  uniform   mat4  mvpMatrix;
  uniform   float time;
  uniform   float dpr;
  uniform   vec2  pov; // point of view
  uniform   vec4  color;
  uniform   float scale;
  uniform   vec2  fluctuation; // power, speed
  varying   vec4  vColor;

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

  void main(void) {
    vec3 _p = position;

    vColor = color;

    float _fluctuationSpeed = time * .01 * fluctuation.y;
    vec2 _fluctuation = vec2(
      ((sin(_p.y * 5. + _fluctuationSpeed)) - .5) * fluctuation.x,
      ((sin(_p.x * 5. + _fluctuationSpeed)) - .5) * fluctuation.x
    );

    float _translateSpeed = abs(exp(sin(time * .001) * 20.)) * .00000005;
    float _tremble = max(.005, _translateSpeed) * scale;
    vec2 _translate = vec2(
      _p.x * _translateSpeed + (irand(_p.xy * time * .2) - .5) * _tremble,
      _p.y * _translateSpeed + (irand(_p.yx * time * .2) - .5) * _tremble
    );

    mat4 transform = mat4(
      (1. + _fluctuation.x) * scale, 0., 0., _translate.x,
      0. + _fluctuation.y, scale, 0., _translate.y,
      0., 0., 1., 0.,
      0., 0., 0., 1.
    );

    vec4 _destPos = mvpMatrix * vec4(_p, 1.) * transform;

    gl_Position = _destPos;
    gl_PointSize = 1. * dpr * scale;
  }
`;

export const fShader = `
  precision mediump float;

  varying vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;
