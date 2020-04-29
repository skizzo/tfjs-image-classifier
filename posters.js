// const tf = require("@tensorflow/tfjs")
// const mobilenet = require("@tensorflow-models/mobilenet")
// const tfnode = require("@tensorflow/tfjs-node")
// const fs = require("fs")

const trainerPosters = require("./src/trainerPosters.js")
const {log} = require("./src/log")

console.log("Starting training..")

const main = async () => {
  const initResult = await trainerPosters.init()
  log(JSON.stringify(initResult))

  /*
  const resMobile1 = await trainerPosters.classify("mobile/android-android-phone-blur-248528.jpg", "mobile")
  log(JSON.stringify(resMobile1, null, 2))

  const resMobile2 = await trainerPosters.classify("mobile/blur-display-electronics-174938.jpg", "mobile")
  log(JSON.stringify(resMobile2, null, 2))

  const resNotebook1 = await trainerPosters.classify("notebook/blank-book-pages-desk-531844.jpg", "notebook")
  log(JSON.stringify(resNotebook1, null, 2))

  const resNotebook2 = await trainerPosters.classify("notebook/blank-diary-flower-957201.jpg", "notebook")
  log(JSON.stringify(resNotebook2, null, 2))

  const resWood1 = await trainerPosters.classify("wood/abstract-antique-backdrop-164005.jpg", "wood")
  log(JSON.stringify(resWood1, null, 2))

  const resWood2 = await trainerPosters.classify("wood/background-board-brown-326311.jpg", "wood")
  log(JSON.stringify(resWood2, null, 2))

  const resBunny = await trainerPosters.classify("bunny.jpeg", "x_bunny")
  log(JSON.stringify(resBunny, null, 2))

  // const resOrange = await trainerPosters.classify("orange_01.jpg", "interstellar_orange")
  const resOrange = await trainerPosters.classify("InterstellarOrange_500_700-11July2017.jpg", "interstellar_orange")
  log(JSON.stringify(resOrange, null, 2))

  // Cats & Dogs

  const catsDogsTests = [
    //
    {f: "1", l: "dog"},
    {f: "2", l: "dog"},
    {f: "3", l: "dog"},
    {f: "4", l: "dog"},
    {f: "5", l: "cat"},
    {f: "6", l: "cat"},
    {f: "7", l: "cat"},
    {f: "8", l: "cat"},
    {f: "9", l: "cat"},
    {f: "10", l: "cat"},
    {f: "11", l: "cat"},
    {f: "12", l: "dog"},
  ]

  for (const cdt of catsDogsTests) {
    const {f, l} = cdt
    const resCd = await trainerPosters.classify(`catsdogs/${f}.jpg`, l)
    log(JSON.stringify(resCd, null, 2))
  }

  // const resDrum = await trainerPosters.classify("drum.jpg")
  // log(JSON.stringify(resDrum, null, 2))
  */

  return true
}

main().then(() => {
  log("Done with posters.js.")
})
