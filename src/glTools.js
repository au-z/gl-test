let glm = require('../lib/glmatrix/gl-matrix.min')
let http = require('./http')

export default (function () {
  let clearColor
  let matrixStack = []
  let gl

  /**
   * @param {Object} canvas the canvas
   * @param {Array<number>} _clearColor the clear color rgba array
   * @param {*} vsUrl vertex shader url
   * @param {*} fsUrl fragment shader url
   * @param {*} _gl optional gl context
   * @return {Promise} a promise resolving the gl context and shader program
   */
  function initGL(canvas, _clearColor, vsUrl, fsUrl, _gl) {
    try {
      if(_gl) {
        gl = _gl
      } else {
        gl = canvas.getContext('webgl')
      }
      clearColor = _clearColor || [0.1, 0.1, 0.1, 1.0]
      gl.viewportWidth = canvas.width
      gl.viewportHeight = canvas.height
    } catch (e) {
      if (!gl) window.alert('Could not init WebGL. Sorry. :(')
    }
    return new Promise(function(resolve, reject) {
      initShaders(vsUrl, fsUrl)
        .then(function(program) {
          resolve({gl: gl, shaderProgram: program})
        }, reject)
    })
  }

  function linkShaders(program, shaderInputs) {
    if(shaderInputs.attributes && shaderInputs.attributes.length > 0) {
      program.attributes = {}
      shaderInputs.attributes.map((attrib) => attribToProgram(attrib, program))
    }
    if(shaderInputs.uniforms && shaderInputs.uniforms.length > 0) {
      program.uniforms = {}
      shaderInputs.uniforms.map((uniform) => uniformToProgram(uniform, program))
    }
  }

  function attribToProgram(attrib, program) {
    program.attributes[attrib] = gl.getAttribLocation(program, attrib)
    if(program.attributes[attrib] === null) {
      throw new Error('Could not link to shader attribute ' + attrib + '. Check your shaders!')
    }
    gl.enableVertexAttribArray(program.attributes[attrib])
  }

  function uniformToProgram(uniform, program) {
    program.uniforms[uniform] = gl.getUniformLocation(program, uniform)
    if(program.uniforms[uniform] === null) {
      throw new Error('Could not link to shader uniform ' + uniform + '. Check your shaders!')
    }
  }

  function drawGL(pMatrix) {
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3])
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // set up projection matrix
    glm.mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)
  }

  function initShaders(vsUrl, fsUrl) {
    return new Promise(function(resolve, reject) {
      const loadVertShader = http.get(vsUrl, 'text')
      const loadFragShader = http.get(fsUrl, 'text')
      Promise.all([loadVertShader, loadFragShader])
        .then((shaders) => createProgram(...shaders))
        .then(resolve, reject)
    })
  }

  function createProgram(vertShader, fragShader) {
    return new Promise(function(resolve, reject) {
      const program = gl.createProgram()
      gl.attachShader(program, compileShader(vertShader, 'vertex'))
      gl.attachShader(program, compileShader(fragShader, 'fragment'))

      gl.linkProgram(program)

      if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        reject(Error('Could not init shaders'))
      }
      gl.useProgram(program)
      resolve(program)
    })
  }

  function compileShader(shaderScript, shaderType) {
    if(!shaderScript) {
      throw new Error('No shader script found in shader response.')
    }

    let shader
    if(shaderType === 'fragment') {
      shader = gl.createShader(gl.FRAGMENT_SHADER)
    }else if(shaderType === 'vertex') {
      shader = gl.createShader(gl.VERTEX_SHADER)
    }else{
      throw new Error('Shader type not recognized')
    }

    gl.shaderSource(shader, shaderScript)
    gl.compileShader(shader)

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader))
      return null
    }
    return shader
  }

  function resize() {
    const realToCSSPixels = window.devicePixelRatio || 1
    const displayWidth = Math.floor(gl.canvas.clientWidth * realToCSSPixels)
    const displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels)
    if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
      gl.canvas.width = displayWidth
      gl.canvas.height = displayHeight
      gl.viewportWidth = gl.canvas.width
      gl.viewportHeight = gl.canvas.height
    }
  }

  function pushMatrix(matrix) {
    const copy = glm.mat4.create()
    glm.mat4.set(matrix, copy)
    matrixStack.push(copy)
  }

  function popMatrix() {
    if(matrixStack.length === 0) {
      throw Error('Invalid popMatrix on a matrix of length 0!')
    }
    return matrixStack.pop()
  }

  return {
    initGL: initGL,
    linkShaders: linkShaders,
    drawGL: drawGL,
    resize: resize,
    pushMatrix: pushMatrix,
    popMatrix: popMatrix
  }
})()
