'use strict'
const { expect } = require('chai'),
  ConvertHandler = require('../controllers/convertHandler.js'),
  convertHandler = new ConvertHandler()
/**
 * @description Pure function; turns a string of fraction format (ex. '5/7') into a decimal.
 * @param {string} frcStr A string representing a fraction.
 * @returns {number} The decimal that would equate to the fraction in the string argument passed.
 */
function fractionalStrToDec(frcStr) {
  const paramType = typeof frcStr
  if (paramType !== 'string')
    throw new TypeError('frcStr arg not of type string: ' + paramType)
  const [num, denom] = frcStr.split('/')
  // @ts-ignore
  return num / denom
}

module.exports = function (app) {
  app.route('/api/convert').get((req, res) => {
    const { input } = req.query,
      inputUnit = input.match(/[a-z]+$/i)[0]
    let inputVal = input.match(/^[\d./]+/)[0]

    // Check if inputVal contains a '/' - if so, split using that, and
    // divide the first num (numerator) by the second (denom)

    if (inputVal.match(/\//)) {
      const [num, denom] = inputVal.split('/')
      inputVal = num / denom
    } else {
      inputVal = +inputVal
    }

    res.json({ inputNum: inputVal, inputUnit })
  })
}
