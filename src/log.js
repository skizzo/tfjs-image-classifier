const spaced = (txt, amount = 7, fill = " ") => {
  let txtNew = txt + ""
  while (txtNew.length < amount) {
    txtNew = fill + txtNew
  }
  return txtNew
}

let startMs = 0
const log = (msg) => {
  if (!startMs) {
    startMs = new Date().getTime()
  }
  const diffMs = new Date().getTime() - startMs
  console.log(`${spaced(diffMs)}ms: ${msg}`)
}

module.exports = {log, spaced}
