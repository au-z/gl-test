const fs = require('fs')
const PNG = require('pngjs2').PNG

function fromFile(url, pathMapFn) {
  const path = pathMapFn(url)
  return new Promise((resolve, reject) => {
    fs.readFile(path, {encoding: 'utf8'}, (e, data) => {
      e && reject(e)
      resolve(data)
    })
  })
}

function mockCanvas(gl, defineProperties) {
  let canvas = document.createElement('canvas')
  for(const key in defineProperties) {
    const properties = {...defineProperties[key], writable: true}
    Object.defineProperty(canvas, key, properties)
  }
  Object.defineProperty(gl, 'canvas', {value: canvas})
}

function snapshotPng(gl, path, width, height) {
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  let png = new PNG({width: width, height: height})
  png.data = pixels

  return new Promise((resolve, reject) => {
    png.pack()
    .pipe(fs.createWriteStream(__dirname + path + '.png'))
    .on('finish', () => resolve(path))
  })
}

export {
  fromFile,
  mockCanvas,
  snapshotPng,
}
