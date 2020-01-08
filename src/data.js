const fs = require("fs")
const path = require("path")

// valid image etensions
const IMAGE_EXTENSIONS = [".jpg", ".jpeg"]

// folders that should not be included in training data
let LABELS_BLACKLIST = ["interstellar_blue_1", "interstellar_blue_2", /*"interstellar_orange",*/ "xecafuturism_1", "xecafuturism_2"]
// LABELS_BLACKLIST = []

const MAX_IMAGES_PER_LABEL = 100 // dogs/cats contain 12.000 images..

const getTrainingData = () => {
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
    resolve({images, imagePaths, imageLabels})
  })
}

module.exports = {getTrainingData}
