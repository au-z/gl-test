const glTest = require('./helpers/glTest')
const app = require('../src/index')
const http = require('../src/http')

const glCtx = {
  width: 500,
  height: 300,
}
const gl = require('gl')(glCtx.width, glCtx.height, {preserveDrawingBuffer: true})

describe('gl visual tests', () => {
  beforeAll(() => {
    http.get = jest.fn((url, responseType) =>
      glTest.fromFile(url, (originalUrl) =>
        (originalUrl.indexOf('vs') > -1) ? './app/shaders/vs.glsl' : './app/shaders/fs.glsl'))
  })
  it('should be dark gray', async () => {
    let canvas = glTest.mockCanvas(gl, {
      width: {value: 300, writable: true},
      height: {value: 150},
      clientWidth: {value: glCtx.width},
      clientHeight: {value: glCtx.height},
    })
    await app.init(canvas, gl)
    glTest.snapshotPng(gl, './test/square.sshot', glCtx.width, glCtx.height)
  })
})
