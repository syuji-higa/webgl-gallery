export const vShader = `
  attribute vec3  position;
  uniform   mat4  mvpMatrix;
  uniform   float time;
  uniform   vec2  pov; // point of view
  uniform   vec4  color;
  uniform   vec2  fluctuation; // power, speed
  uniform   vec2  sparkle; // power, speed
  varying   vec4  vColor;

  void main(void) {
    vec3 _p = position;

    float _sparkleSpeed = time * .01 * sparkle.y;
    float _sparkle = max(sin(dot(_p.x, _p.y) * 2. + _sparkleSpeed), 0.) * sparkle.x;

    vColor = color + _sparkle;

    float _fluctuationSpeed = time * .01 * fluctuation.y;
    vec2 _fluctuation = vec2(
      ((sin(_p.y * 5. + _fluctuationSpeed)) - .5) * fluctuation.x,
      ((sin(_p.x * 5. + _fluctuationSpeed)) - .5) * fluctuation.x
    );

    mat4 transform = mat4(
      1. + _fluctuation.x, 0., 0., 0.,
      0. + _fluctuation.y, 1., 0., 0.,
      0., 0., 1., 0.,
      0., 0., 0., 1.
    );

    vec4 _destPos = mvpMatrix * vec4(_p, 1.) * transform;

    gl_Position = _destPos;
  }
`;

export const fShader = `
  precision mediump float;

  varying vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;
