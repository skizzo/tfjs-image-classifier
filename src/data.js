const fs = require("fs")
const path = require("path")

// valid image etensions
const IMAGE_EXTENSIONS = [".jpg", ".jpeg"]

// folders that should not be included in training data
let LABELS_BLACKLIST = ["interstellar_blue_1", "interstellar_blue_2", /*"interstellar_orange",*/ "xecafuturism_1", "xecafuturism_2"]
LABELS_BLACKLIST = ["notebook", "mobile", "wood", "cat", "dog"]

const MAX_IMAGES_PER_LABEL = 10 // dogs/cats contain 12.000 images..

const hashFnv32a = (str, asString, seed) => {
  var i,
    l,
    hval = seed === undefined ? 0x811c9dc5 : seed

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }
  if (asString) {
    // Convert to 8 digit hex string
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8)
  }
  return hval >>> 0
}

const serialize = (obj) => {
  if (Array.isArray(obj)) {
    return JSON.stringify(obj.map((i) => serialize(i)))
  } else if (typeof obj === "object" && obj !== null) {
    return Object.keys(obj)
      .sort()
      .map((k) => `${k}:${serialize(obj[k])}`)
      .join("|")
  }
  return obj
}

const getTrainingData = (extraData = {}) => {
  return new Promise((resolve) => {
    let images = [] // Array of Objects: {dir, imagesInDir}
    let imagePaths = [] // Array of Strings, equal the amount of total images
    let imageLabels = [] // Array of Strings, equal the amount of total images

    for (const dir of fs.readdirSync(path.join(__dirname, "../images/training"))) {
      if (fs.statSync(path.join(__dirname, `../images/training/${dir}`)).isDirectory()) {
        if (LABELS_BLACKLIST.indexOf(dir) === -1) {
          const filesInDir = fs.readdirSync(path.join(__dirname, `../images/training/${dir}`))
          if (!!filesInDir.length) {
            let imagesInDir = []
            let amountAdded = 0
            for (const file of filesInDir) {
              if (MAX_IMAGES_PER_LABEL != -1 && amountAdded < MAX_IMAGES_PER_LABEL) {
                if (IMAGE_EXTENSIONS.indexOf(path.extname(file)) != -1) {
                  imagesInDir.push(file)
                  imagePaths.push(path.join(__dirname, `../images/training/${dir}/${file}`))
                  imageLabels.push(dir)
                  amountAdded++
                }
              }
            }
            images.push({dir, imagesInDir})
          }
        }
      }
    }
    const trainingData = {images, imagePaths, imageLabels}
    const trainingDataSerialized = serialize({...trainingData, ...extraData})
    const hash = hashFnv32a(trainingDataSerialized, true, 1)
    resolve({...trainingData, hash})
  })
}

module.exports = {getTrainingData}
