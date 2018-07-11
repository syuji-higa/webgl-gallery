export const vShader = `
  attribute vec3  position;
  attribute vec4  color;
  uniform   float blur;
  varying   vec4  vColor;

  void main(void) {
    vec3 _p = position;

    vColor = vec4(color.xyz, color.w * blur);

    vec4 _destPos = vec4(_p, 1.);

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
