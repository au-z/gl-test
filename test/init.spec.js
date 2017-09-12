const app = require('../src/index')
const http = require('../src/http')
const jestGl = require('jest-gl')()

const width = 500
const height = 300

const gl = require('gl')(width, height, {preserveDrawingBuffer: true})
let canvas

describe('gl visual tests', () => {
  beforeAll(() => {
    http.get = jest.fn((url, responseType) =>
      jestGl.fromFile(url, (originalUrl) =>
        (originalUrl.indexOf('vs') > -1) ? './app/shaders/vs.glsl' : './app/shaders/fs.glsl'))

    canvas = jestGl.mockCanvas(gl, {
      width: {value: 300},
      height: {value: 150},
      clientWidth: {value: width},
      clientHeight: {value: height},
    })
  })
  it('initializes with a square and triangle', async () => {
    await app.init(canvas, gl)
    let parity = await jestGl.imageParity(gl, __dirname, 'init', true, true)
    expect(parity).toBe(true)
  })
})
