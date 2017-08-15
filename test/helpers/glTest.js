const fs = require('fs')
const path = require('path')
const looksSame = require('looks-same')
const PNG = require('pngjs2').PNG

const SPEC_POSTFIX = '.spec'
const HEAD_POSTFIX = '.head'
const DIFF_POSTFIX = '.diff'
const SNAPSHOT_POSTFIX = (process.env.TEST_MODE === 'update') ? SPEC_POSTFIX : HEAD_POSTFIX

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

function snapshotPng(gl, imagePath, width, height) {
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  let png = new PNG({width: width, height: height})
  png.data = pixels

  return new Promise((resolve, reject) => {
    png.pack()
    .pipe(fs.createWriteStream(imagePath))
    .on('finish', () => resolve(imagePath))
  })
}

function imageParity(gl, dirName, imageName, strict = true, errorDiff = true) {
  if(!gl.canvas.clientWidth || !gl.canvas.clientHeight) {
    throw new Error('Canvas does not have clientWidth and clientHeight')
  }

  // when updating, reference and current file paths should be the same to guarantee parity
  const reference = path.resolve(dirName, imageName) + SPEC_POSTFIX + '.png'
  const current = path.resolve(dirName, imageName) + SNAPSHOT_POSTFIX + '.png'
  const diff = path.resolve(dirName, './output', (imageName + DIFF_POSTFIX + '.png'))

  return new Promise(async (resolve, reject) => {
    snapshotPng(gl, current, gl.canvas.clientWidth, gl.canvas.clientHeight)
      .then((savedFile) => diffImage(reference, current, diff, strict, errorDiff))
      .then(resolve)
  })
}

function diffImage(reference, current, diff, strict = true, errorDiff = true) {
  return new Promise((resolve, reject) => {
    looksSame(reference, current, {strict: strict}, (error, equal) => {
      error && reject(error)
      if(!equal && errorDiff) {
        looksSame.createDiff({reference, current, diff, highlightColor: '#ff00ff', strict}, (e) => reject(e))
      } else {
        fs.unlink(diff)
      }
      resolve(equal)
    })
  })
}

export {
  fromFile,
  imageParity,
  mockCanvas,
  snapshotPng,
}
