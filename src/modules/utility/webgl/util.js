import { toTowPower } from '../../model/math';

/**
 * webgl util
 */

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} type - ['vertex'|'fragment']
 * @param {string} shader
 */
export const createShader = (gl, type, shader) => {
  let _shader = null;
  switch (type) {
    case 'vertex': {
      _shader = gl.createShader(gl.VERTEX_SHADER);
      break;
    }
    case 'fragment': {
      _shader = gl.createShader(gl.FRAGMENT_SHADER);
      break;
    }
  }

  gl.shaderSource(_shader, shader);
  gl.compileShader(_shader);

  if (gl.getShaderParameter(_shader, gl.COMPILE_STATUS)) {
    return _shader;
  } else {
    throw new Error(gl.getShaderInfoLog(_shader));
  }
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vs - vertex shader
 * @param {WebGLShader} fs - fragment shader
 * @return {WebGLProgram}
 */
export const createProgram = (gl, vs, fs) => {
  const _program = gl.createProgram();

  gl.attachShader(_program, vs);
  gl.attachShader(_program, fs);

  gl.linkProgram(_program);

  return _program;
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
export const useProgram = (gl, program) => {
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(program);
    return program;
  } else {
    throw new Error(gl.getProgramInfoLog(program));
  }
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {Array} data
 * @param {?number} [drow]
 * @return {WebGLBuffer}
 */
export const createVbo = (gl, data, drow = null) => {
  const _vbo = gl.createBuffer();
  const _drow = drow || gl.STATIC_DRAW;

  gl.bindBuffer(gl.ARRAY_BUFFER, _vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), _drow);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return _vbo;
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {Array} data
 * @return {WebGLBuffer}
 */
export const createIbo = (gl, data) => {
  const _ibo = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return _ibo;
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {Element} img
 * @param {Object} [opts]
 * @param {number} [opts.dpr] - float
 * @param {?number} [opts.maxSize] - int
 */
export const createTexture = (gl, img, opts) => {
  const { dpr, maxSize } = Object.assign({ dpr: 1, maxSize: null }, opts);

  const _w = img.naturalWidth;
  const _h = img.naturalHeight;
  const _canvasW = _w * dpr;
  const _canvasH = _h * dpr;
  const _maxTextureSize = maxSize || gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const _size = Math.min(
    toTowPower(Math.max(_canvasW, _canvasH)),
    _maxTextureSize,
  );
  if (_canvasW !== _canvasH || _canvasW !== _size) {
    const _$canvas = document.createElement('canvas');
    _$canvas.height = _$canvas.width = _size;
    _$canvas.getContext('2d').drawImage(img, 0, 0, _w, _h, 0, 0, _size, _size);
    img = _$canvas;
  }

  const _tex = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, _tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return {
    texture: _tex,
    originalWidth: _w,
    originalHeight: _h,
  };
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {number} width
 * @param {number} height
 * @return {Object}
 * @property {WebGLRenderbuffer} d
 * @property {WebGLFramebuffer} f
 * @property {WebGLTexture} t
 */
export const createFramebuffer = (gl, width, height) => {
  const _frameBuffer = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, _frameBuffer);

  const _depthRenderBuffer = gl.createRenderbuffer();

  gl.bindRenderbuffer(gl.RENDERBUFFER, _depthRenderBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    _depthRenderBuffer,
  );

  const _fTexture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, _fTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    _fTexture,
    0,
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return {
    f: _frameBuffer,
    d: _depthRenderBuffer,
    t: _fTexture,
  };
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {number} index
 * @param {number} size
 * @param {Object} [opts]
 * @param {} [opts.type]
 * @param {boolean} [opts.normalized]
 * @param {number} [opts.stride]
 * @param {number} [opts.offset]
 */
export const enableAttribute = (gl, index, size, opts = {}) => {
  const { type, normalized, stride, offset } = Object.assign(
    {
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
    },
    opts,
  );

  gl.enableVertexAttribArray(index);
  gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
};
