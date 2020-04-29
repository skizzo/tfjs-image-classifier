// https://thekevinscott.com/image-classification-with-javascript/

const tf = require("@tensorflow/tfjs")
const tfnode = require("@tensorflow/tfjs-node")
const fs = require("fs")
const path = require("path")

const {log, spaced} = require("./log")
const {getTrainingData} = require("./data")

const labelsObject = require("../data/imagenet_labels.json")
let labels = []
Object.keys(labelsObject).map((label) => labels.push(label))

///////////////////////////////////////////////////////////////////////////////
const trainerMobilenet = {
  pretrainedModel: null, // mobilenet_v1_0.25_224

  pretrainedModelOwn: null, // trained with own images
  trainingData: null,
  model: null, // trained model ..
  fitInfoModel: null, // .. and its history
  imageLabels: null, // folder names in /images

  init: async () => {
    log("Loading Model..")
    this.pretrainedModel = await tf.loadLayersModel("https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json")
    log("Loading Model done.")
    await trainerMobilenet.trainImages()
    return {success: true}
  },

  trainImages: async (epochs = 20) => {
    const layer = this.pretrainedModel.getLayer("conv_pw_13_relu")
    this.pretrainedModelOwn = tf.model({
      inputs: this.pretrainedModel.inputs,
      outputs: layer.output,
    })

    this.trainingData = await getTrainingData({epochs})
    const {images, imagePaths, imageLabels} = this.trainingData
    this.imageLabels = imageLabels

    log("Training Images..")

    const modelJsonPathByHash = path.join(__dirname, `../models/${this.trainingData.hash}/model.json`)
    if (fs.existsSync(modelJsonPathByHash)) {
      log(`Loading Model from saved models (Hash: ${this.trainingData.hash})!`)
      this.model = await tf.loadLayersModel(`file://${modelJsonPathByHash}`)
    } else {
      log(`Loading Images and Labels (Hash: ${this.trainingData.hash})..`)
      const xs = await loadImages(imagePaths, this.pretrainedModelOwn)
      const ys = addLabels(this.imageLabels)

      const classes = getLabelsAsObject(this.imageLabels)
      let classLength = Object.keys(classes).length

      log("Getting Model..")
      this.model = getModel(classLength)

      log("Fitting Model..")
      this.fitInfoModel = await this.model.fit(xs, ys, {
        //
        epochs,
        shuffle: true,
        callbacks: {
          //
          onEpochEnd: (epoch, logs) => {
            console.log(` Epoch #${epoch}: ${JSON.stringify(logs)}`)
            // console.log(logs.loss)
          },
        },
      })
      // debugger
      // log("Final accuracy", this.fitInfoModel.history.acc)

      log("Saving Model..")
      const pathModelSave = path.join(__dirname, `../models/${this.trainingData.hash}`)
      await this.model.save(`file://${pathModelSave}`)

      // TODO: Now convert this to .tflite

      log("Training Images done.")
    }
    return {success: true}
  },

  classify: async (imageCheckFilename, expectedLabel = "") => {
    // log(`Classifying image '${imageCheckFilename}'..`)
    const imagePath = path.join(__dirname, `../images/validation/${imageCheckFilename}`)
    const imageExists = fs.existsSync(imagePath)
    if (!imageExists) {
      return {error: "image-not-found"}
    } else {
      const USE_TRAINING_DATA = true
      if (USE_TRAINING_DATA) {
        const {label, labelIndex} = await makePrediction(this.model, this.pretrainedModelOwn, this.imageLabels, imagePath)
        if (!!expectedLabel && label != expectedLabel) {
          console.error(`Not received expected label '${expectedLabel}'.`)
        }
        return {imageCheckFilename, labelIndex, label}
      } else {
        // using pretrained model
        const img = await loadImage(imagePath)
        const processedImage = loadAndProcessImage(img)
        const prediction = this.pretrainedModel.predict(processedImage)
        const labelIndex = prediction.as1D().argMax().dataSync()[0] // prettier-ignore
        const label = labelsObject[labelIndex]
        // console.log("label: " + label)
        return {label, labelIndex}
      }
    }
  },
}

const loadImage = (imagePath) =>
  new Promise((resolve) => {
    //  node version
    const imageBuffer = fs.readFileSync(imagePath)
    const tfimage = tfnode.node.decodeImage(imageBuffer) // tfnode.node.decodeImage() : Given the encoded bytes of an image, it returns a 3D or 4D tensor of the decoded image. Supports BMP, GIF, JPEG and PNG formats.
    resolve(tfimage)

    //  browser version
    // const img = new Image();
    // img.src = src;
    // img.onload = () => resolve(tf.fromPixels(img));
    // img.onerror = (err) => reject(err);
  })

const cropImage = (img) => {
  const width = img.shape[0]
  const height = img.shape[1]

  // use the shorter side as the size to which we will crop
  const shorterSide = Math.min(img.shape[0], img.shape[1])

  // calculate beginning and ending crop points
  const startingHeight = (height - shorterSide) / 2
  const startingWidth = (width - shorterSide) / 2
  const endingHeight = startingHeight + shorterSide
  const endingWidth = startingWidth + shorterSide

  // return image data cropped to those points
  return img.slice([startingWidth, startingHeight, 0], [endingWidth, endingHeight, 3])
}

const resizeImage = (image) => tf.image.resizeBilinear(image, [224, 224])

const batchImage = (image) => {
  // Expand our tensor to have an additional dimension, whose size is 1
  const batchedImage = image.expandDims(0)
  // Turn pixel data into a float between -1 and 1.
  return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)) // prettier-ignore
}

const loadAndProcessImage = (image) => {
  const croppedImage = cropImage(image)
  const resizedImage = resizeImage(croppedImage)
  const batchedImage = batchImage(resizedImage)
  return batchedImage
}

const loadImages = (imagePaths, pretrainedModel) => {
  let promise = Promise.resolve()
  const startMs = new Date().getTime()
  const imagesTotal = imagePaths.length
  for (let i = 0; i < imagePaths.length; i++) {
    const image = imagePaths[i]
    promise = promise.then((data) => {
      return loadImage(image).then((loadedImage) => {
        return tf.tidy(() => {
          const processedImage = loadAndProcessImage(loadedImage)
          const prediction = pretrainedModel.predict(processedImage)

          const diffMs = new Date().getTime() - startMs
          const msPerItem = diffMs / (i + 1)
          const imagesLeft = imagesTotal - (i + 1)
          const msLeft = imagesLeft * msPerItem
          const sLeft = msLeft / 1000
          log(`Image ${spaced(i + 1, 3)}/${imagePaths.length} loaded: ${image}, ${imagesLeft} images left, ${Math.ceil(sLeft)}s left, ${Math.round(msPerItem)}ms/image.`)

          if (data) {
            const newData = data.concat(prediction)
            data.dispose()
            return newData
          }
          return tf.keep(prediction)
        })
      })
    })
  }

  return promise
}

const oneHot = (labelIndex, classLength) => tf.tidy(() => tf.oneHot(tf.tensor1d([labelIndex]).toInt(), classLength))

const getLabelsAsObject = (labelsParam) => {
  let labelObject = {}
  for (let i = 0; i < labelsParam.length; i++) {
    const label = labelsParam[i]
    if (labelObject[label] === undefined) {
      labelObject[label] = Object.keys(labelObject).length
    }
  }
  return labelObject
}

const addLabels = (labelsParam) =>
  tf.tidy(() => {
    const classes = getLabelsAsObject(labelsParam)
    let classLength = Object.keys(classes).length
    let ys
    for (let i = 0; i < labelsParam.length; i++) {
      const label = labelsParam[i]
      const labelIndex = classes[label]
      const y = oneHot(labelIndex, classLength)
      if (i === 0) {
        ys = y
      } else {
        ys = ys.concat(y, 0)
      }
    }
    return ys
  })

const makePrediction = (model, pretrainedModel, imageLabels, imagePath) =>
  new Promise((resolve) => {
    loadImage(imagePath)
      .then((loadedImage) => loadAndProcessImage(loadedImage))
      .then((loadedImage) => {
        const activatedImage = pretrainedModel.predict(loadedImage)
        loadedImage.dispose()
        return activatedImage
      })
      .then((activatedImage) => {
        const prediction = model.predict(activatedImage)
        const labelIndex = prediction.as1D().argMax().dataSync()[0] // prettier-ignore

        let label = imageLabels.length > labelIndex ? imageLabels[labelIndex] : null // not correct
        const classes = getLabelsAsObject(imageLabels)
        label = Object.keys(classes)[labelIndex]
        // debugger
        prediction.dispose()
        activatedImage.dispose()
        resolve({label, labelIndex})
      })
  })

const getModel = (numberOfClasses) => {
  const model = tf.sequential({
    layers: [
      tf.layers.flatten({inputShape: [7, 7, 256]}),
      tf.layers.dense({
        units: 100,
        activation: "relu",
        kernelInitializer: "varianceScaling",
        useBias: true,
      }),
      tf.layers.dense({
        units: numberOfClasses,
        kernelInitializer: "varianceScaling",
        useBias: false,
        activation: "softmax",
      }),
    ],
  })
  model.compile({
    optimizer: tf.train.adam(0.0001),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  })
  return model
}

module.exports = trainerMobilenet
