const fs = require('fs')
const app = require('../src/index')
const PNG = require('pngjs2').PNG

const glCtx = {
  width: 200,
  height: 200,
}
const gl = require('gl')(glCtx.width, glCtx.height, {preserveDrawingBuffer: true})

describe('gl visual tests', () => {
  it('should be dark gray', () => {
    gl.clearColor(0.2, 0.2, 0.2, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    let canvas = document.createElement('canvas')
    app.init(canvas, gl)
    const pixels = new Uint8Array(glCtx.width * glCtx.height * 4)
    gl.readPixels(0, 0, glCtx.width, glCtx.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    let png = new PNG({width: glCtx.width, height: glCtx.height})
    png.data = pixels

    png.pack()
      .pipe(fs.createWriteStream(__dirname + '/square.sshot.png'))
      .on('finish', () => console.log('done!'))
  })
})
