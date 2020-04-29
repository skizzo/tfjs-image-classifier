// https://becominghuman.ai/lets-build-our-own-image-classification-machine-learning-on-the-web-with-tensorflow-js-mobilenet-19aca0664c98

const mobilenet = require("@tensorflow-models/mobilenet")
const knnClassifier = require("@tensorflow-models/knn-classifier")
const tfnode = require("@tensorflow/tfjs-node")

const {log} = require("./log")

const createKNNClassifier = async () => {
  log("Loading KNN Classifier")
  return await knnClassifier.create()
}
const createMobileNetModel = async () => {
  log("Loading Mobilenet Model")
  return await mobilenet.load()
}

const trainerPosters = {
  init: async () => {
    const mobilenetModel = await createMobileNetModel()
    const knnClassifierModel = await createKNNClassifier()
    // const webcamInput = await createWebcamInput();
    debugger
    return {success: true}
  },
}

module.exports = trainerPosters
