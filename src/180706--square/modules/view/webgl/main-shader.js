export const vShader = `
  attribute vec3  position;
  attribute vec4  color;
  uniform   mat4  mvpMatrix;
  uniform   float time;
  uniform   vec2  mouse;
  varying   vec4  vColor;

  void main(void) {
    vColor = color;

    vec3 _p = position;

    vec4 _destPos = mvpMatrix * vec4(_p, 1.);

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
