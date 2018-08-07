export const vShader = `
  attribute vec3  position;
  attribute vec2  coord;
  uniform   mat4  mvpMatrix;
  uniform   float time;
  uniform   vec2  pov; // point of view
  uniform   vec2  fluctuation; // power, speed
  varying   vec2  vCoord;
  varying   float vTime;

  void main(void) {
    vCoord = coord;

    vec3 _p = position;

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

  uniform sampler2D texture;
  varying vec2      vCoord;

  void main(void) {
    vec4 _smpColor = texture2D(texture, vCoord);

    gl_FragColor = _smpColor;
  }
`;
