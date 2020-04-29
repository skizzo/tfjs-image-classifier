//  https://codelabs.developers.google.com/codelabs/tensorflowjs-teachablemachine-codelab/index.html#6
//  https://becominghuman.ai/image-classification-machine-learning-in-node-js-with-tensorflow-js-dd8e20ba5024

const fs = require("fs")
const path = require("path")
const tf = require("@tensorflow/tfjs")
const mobilenet = require("@tensorflow-models/mobilenet")
const knnClassifier = require("@tensorflow-models/knn-classifier")
const tfnode = require("@tensorflow/tfjs-node")
// const sharp = require("sharp")

const {log} = require("./log")
const {getTrainingData} = require("./data")

const USE_CUSTOM_TRAINING_DATA = true

let net = null
let classifier = null
const trainerKnn = {
  classify: (imageCheckFilename, extraParams = {}) => {
    return new Promise((resolve) => {
      const imagePath = path.join(__dirname, `../${imageCheckFilename}`)
      const imageExists = fs.existsSync(imagePath)
      if (!imageExists) {
        resolve({success: false, error: "input-file-not-found", imageCheckFilename})
      } else {
        const imageBuffer = fs.readFileSync(imagePath)
        const imageTensor = tfnode.node.decodeImage(imageBuffer)

        if (USE_CUSTOM_TRAINING_DATA) {
          const activation = net.infer(imageTensor, "conv_preds")
          classifier.predictClass(activation).then((result) => {
            resolve({success: true, imageCheckFilename, ...extraParams, result})
          })
        } else {
          net.classify(imageTensor).then((result) => {
            resolve({success: true, imageCheckFilename, ...extraParams, result})
          })
        }
      }
    })
  },

  init: () => {
    return new Promise((resolve) => {
      log(`Loading MobileNet..`)
      mobilenet.load().then((netLoaded) => {
        log(`Loading MobileNet done.`)
        net = netLoaded

        log(`Creating KNN classifier..`)
        classifier = knnClassifier.create()

        log(`Getting Training Data..`)
        getTrainingData().then((trainingDatas) => {
          let imagesTotal = 0

          if (USE_CUSTOM_TRAINING_DATA) {
            for (const trainingData of trainingDatas.images) {
              const {dir, imagesInDir} = trainingData
              for (const image of imagesInDir) {
                log(`Training with image ${dir}/${image}..`)
                const imagePath = path.join(__dirname, `../images/training/${dir}/${image}`)
                const imageBuffer = fs.readFileSync(imagePath)
                const imageTensor = tfnode.node.decodeImage(imageBuffer)
                const activation = net.infer(imageTensor, "conv_preds")
                const classId = dir
                classifier.addExample(activation, classId)
                imageTensor.dispose()
                imagesTotal++
              }
            }
          }
          resolve({success: true, imagesTotal})
        })
      })
    })
  },
}

module.exports = trainerKnn
