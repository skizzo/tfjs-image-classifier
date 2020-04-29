// taken from: https://becominghuman.ai/image-classification-machine-learning-in-node-js-with-tensorflow-js-dd8e20ba5024

// const tf = require("@tensorflow/tfjs")
// const mobilenet = require("@tensorflow-models/mobilenet")
// const tfnode = require("@tensorflow/tfjs-node")
// const fs = require("fs")

const trainerKnn = require("./src/trainerKnn.js")
const {log} = require("./src/log")

console.log("Starting training..")

const main = async () => {
  const initResult = await trainerKnn.init()
  log(JSON.stringify(initResult))

  // const classifyRes = await trainerKnn.classify("images/validation/blue2_01.jpg")
  const classifyRes = await trainerKnn.classify("images/validation/InterstellarOrange_500_700-11July2017.jpg")
  log(JSON.stringify(classifyRes, null, 2))

  return true
}

main().then(() => {
  log("Done with knn.js.")
})

/*
const tf = require("@tensorflow/tfjs")
const mobilenet = require("@tensorflow-models/mobilenet")
const tfnode = require("@tensorflow/tfjs-node")
const fs = require("fs")

const readImage = (path) => {
  const imageBuffer = fs.readFileSync(path)
  const tfimage = tfnode.node.decodeImage(imageBuffer)
  return tfimage
}

const imageClassification = async (path) => {
  const image = readImage(path)
  const mobilenetModel = await mobilenet.load()
  const predictions = await mobilenetModel.classify(image)
  console.log("Classification Results:")
  console.log(JSON.stringify(predictions, null, 2))
}

if (process.argv.length !== 3) {
  throw new Error("Incorrect arguments: node classify.js <IMAGE_FILE>")
}

imageClassification(process.argv[2] || "images/validation/blue2_01.jpg")
*/
