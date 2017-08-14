const fs = require('fs')

function loadShaders(vsUrl, fsUrl) {
  const loadVsShader = new Promise((resolve, reject) => {
    fs.readFile(vsUrl, {encoding: 'utf8'}, (e, data) => {
      e && reject(e)
      resolve(data)
    })
  })
  const loadFsShader = new Promise((resolve, reject) => {
    fs.readFile(fsUrl, {encoding: 'utf8'}, (e, data) => {
      e && reject(e)
      resolve(data)
    })
  })
  return Promise.all([loadVsShader, loadFsShader], (shaders) => {
    console.log(shaders)
  })
}

export {
  loadShaders
}
