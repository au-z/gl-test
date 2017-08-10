const app = require('../src/index.js')

const glCtx = {
  width: 20,
  height: 20,
}
const gl = require('gl')(glCtx.width, glCtx.height, {preserveDrawingBuffer: true})

describe('gl visual tests', () => {
  it('should be dark gray', () => {
    // app.init('gl', gl)
    gl.clearColor(0.1, 0.1, 0.1, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const pixels = new Uint8Array(glCtx.width * glCtx.height * 4)
    gl.readPixels(0, 0, glCtx.width, glCtx.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    // Write a ppm header
    process.stdout.write(['P3\n# gl.ppm\n', glCtx.width, ' ', glCtx.height, '\n255\n'].join(''))
    for(let i = 0; i < pixels.length; i += 4) {
      for(let j = 0; j < 3; ++j) {
        process.stdout.write(pixels[i+j] + ' ')
      }
    }
  })
})
