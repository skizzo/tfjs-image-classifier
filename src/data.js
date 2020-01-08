const fs = require("fs")
const path = require("path")

// valid image etensions
const IMAGE_EXTENSIONS = [".jpg", ".jpeg"]

// folders that should not be included in training data
let LABELS_BLACKLIST = ["interstellar_blue_1", "interstellar_blue_2", /*"interstellar_orange",*/ "xecafuturism_1", "xecafuturism_2"]
// LABELS_BLACKLIST = []

const MAX_IMAGES_PER_LABEL = 1000 // dogs/cats contain 12.000 images..

const hashCode = (s) => {
  return s.split("").reduce(function(a, b) {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
}

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
function hashFnv32a(str, asString, seed) {
  /*jshint bitwise:false */
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
    const trainingDataSerializedHash = hashCode(trainingDataSerialized)
    const trainingDataSerializedHash2 = hashFnv32a(trainingDataSerialized, true, 1)
    resolve({...trainingData, hash: trainingDataSerializedHash2})
  })
}

module.exports = {getTrainingData}
