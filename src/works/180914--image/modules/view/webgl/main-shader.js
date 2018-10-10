export const vShader = `
  attribute vec3  position;
  attribute vec2  coord;
  uniform   mat4  mvpMatrix;
  uniform   vec2  fluctuation; // power, speed
  varying   vec2  vCoord;

  void main(void) {
    vCoord = coord;

    gl_Position = mvpMatrix * vec4(position, 1.);
  }
`;

export const fShader = `
  precision mediump float;

  uniform sampler2D texture;
  uniform float     time;
  uniform vec2      pov; // point of view
  uniform vec2      resolution;
  uniform vec2      size;
  uniform vec3      objectStatus; // power1, power2, speed
  varying vec2      vCoord;

  void main(void) {
    vec2 _p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    vec3 _os = objectStatus;
    float _t = time * .0001 * _os.z;

    float _distortion = clamp(pow(1. - length(_p - pov * size), _os.y), .1, 1.) * .5 * _os.x;

    vec4 _smpColor = texture2D(texture, vec2(
      fract(vCoord.x + (sin(_t * 3.)) * _distortion),
      fract(vCoord.y + (cos(_t * 7.)) * _distortion)
    ));

    gl_FragColor = _smpColor;
  }
`;
