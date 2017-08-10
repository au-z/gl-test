let glm = require('../lib/glmatrix/gl-matrix.min')
import GL from './glTools'

export function init(canvasId, _gl = null) {
  let gl
  let sp
  let mvMatrix = glm.mat4.create()
  let pMatrix = glm.mat4.create()
  const canvas = document.getElementById(canvasId || 'gl')
  if(_gl) {
    console.log('injecting custom gl context!')
  }
  gl = _gl || canvas.getContext('webgl')

  GL.initGL(canvas, [0.1, 0.1, 0.1, 1.0], '/shaders/vs.glsl', '/shaders/fs.glsl', gl)
    .then(render)
    .catch((e) => console.error(e))

  function render(glTools) {
    gl = glTools.gl
    sp = glTools.shaderProgram
    setupShaders()
    initBuffers()
    glm.mat4.translate(pMatrix, pMatrix, glm.vec3.create(1.0, 1.0, 1.0))
    tick()
  }

  // eslint-disable-next-line
  let triangleVertexPositionBuffer
  // eslint-disable-next-line
  let squareVertexPositionBuffer

  // from learningwebgl.com
  function initBuffers() {
    triangleVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)
    let vertices = [
      0.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    triangleVertexPositionBuffer.itemSize = 3
    triangleVertexPositionBuffer.numItems = 3

    squareVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer)
    vertices = [
      1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    squareVertexPositionBuffer.itemSize = 3
    squareVertexPositionBuffer.numItems = 4
  }

  // from learningwebgl.com
  function drawBuffers(mvMatrix) {
    glm.mat4.identity(mvMatrix)
    glm.mat4.translate(mvMatrix, mvMatrix, [-1.5, 0.0, -7.0])
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)
    gl.vertexAttribPointer(sp.attributes.aVertexPosition, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    sp.setMatrixUniforms()
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems)

    glm.mat4.translate(mvMatrix, mvMatrix, [3.0, 0.0, 0.0])
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer)
    gl.vertexAttribPointer(sp.attributes.aVertexPosition, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    sp.setMatrixUniforms()
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems)
  }

  function setupShaders() {
    GL.linkShaders(sp, {
      attributes: ['aVertexPosition'],
      uniforms: ['uPMatrix', 'uMVMatrix'],
    })
    sp.setMatrixUniforms = () => {
      gl.uniformMatrix4fv(sp.uniforms.uPMatrix, false, pMatrix)
      gl.uniformMatrix4fv(sp.uniforms.uMVMatrix, false, mvMatrix)
    }
  }

  function tick(){
    requestAnimationFrame(tick)
    drawScene()
    // animate()
  }

  function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    GL.resize()
    GL.drawGL(pMatrix)
    drawBuffers(mvMatrix)
  }

  return {
    getGL: () => gl,
    getSP: () => sp,
  }
}
