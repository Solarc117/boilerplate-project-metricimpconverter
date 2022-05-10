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
    const { input } = req.query
    let inputVal = input?.match(/^[\d./]+/g)[0],
      inputUnit = input?.match(/[a-z]+$/gi)

    if (!inputUnit)
      return res.status(400).send('invalid input - please provide a unit')
    inputUnit = inputUnit[0]

    const divisors = inputVal.match(/\//g)

    console.log('divisors:', divisors)

    if (divisors) {
      if (divisors.length > 1)
        return res
          .status(400)
          .send('invalid number format - too many divisions: ' + inputVal)

      const [num, denom] = inputVal.split('/')
      inputVal = num / denom
    } else {
      inputVal = +inputVal
    }

    res.json({ inputNum: inputVal, inputUnit })
  })
}
