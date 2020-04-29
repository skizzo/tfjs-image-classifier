//  https://medium.com/@rossbulat/tensorflow-js-linear-regression-with-webpack-and-es6-classes-6182dd7e3522

const trainerLinear = require("./src/trainerLinear.js")
const {log} = require("./src/log")

console.log("Starting linear..")

const main = async () => {
  const initResult = await trainerLinear.init()
  log(JSON.stringify(initResult))

  /*
  const resMobile1 = await trainerMobilenet.classify("mobile/android-android-phone-blur-248528.jpg", "mobile")
  log(JSON.stringify(resMobile1, null, 2))

  const resMobile2 = await trainerMobilenet.classify("mobile/blur-display-electronics-174938.jpg", "mobile")
  log(JSON.stringify(resMobile2, null, 2))

  const resNotebook1 = await trainerMobilenet.classify("notebook/blank-book-pages-desk-531844.jpg", "notebook")
  log(JSON.stringify(resNotebook1, null, 2))

  const resNotebook2 = await trainerMobilenet.classify("notebook/blank-diary-flower-957201.jpg", "notebook")
  log(JSON.stringify(resNotebook2, null, 2))

  const resWood1 = await trainerMobilenet.classify("wood/abstract-antique-backdrop-164005.jpg", "wood")
  log(JSON.stringify(resWood1, null, 2))

  const resWood2 = await trainerMobilenet.classify("wood/background-board-brown-326311.jpg", "wood")
  log(JSON.stringify(resWood2, null, 2))

  const resBunny = await trainerMobilenet.classify("bunny.jpeg", "x_bunny")
  log(JSON.stringify(resBunny, null, 2))

  const resOrange = await trainerMobilenet.classify("InterstellarOrange_500_700-11July2017.jpg", "interstellar_orange")
  log(JSON.stringify(resOrange, null, 2))

  const resOrange2 = await trainerMobilenet.classify("orange_01.jpg", "interstellar_orange")
  log(JSON.stringify(resOrange2, null, 2))

  // Cats & Dogs
  const TEST_CATS_DOGS = false
  if (TEST_CATS_DOGS) {
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
      const resCd = await trainerMobilenet.classify(`catsdogs/${f}.jpg`, l)
      log(JSON.stringify(resCd, null, 2))
    }
  }
  */
  return true
}

main().then(() => {
  log("Done with linear.js.")
})
