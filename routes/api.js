'use strict'
const { expect } = require('chai'),
  ConvertHandler = require('../controllers/convertHandler.js'),
  convertHandler = new ConvertHandler()

module.exports = function (app) {
  app.route('/api/convert').get((req, res) => {
    const { input } = req.query
    let amount = input?.match(/^[\d./]+/g),
      unit = input?.match(/[a-z]+$/gi)

    amount = amount ? amount[0] : '1'

    if (!unit)
      return res
        .status(400)
        .send('invalid input - please provide a unit (ex. kg, mi, lbs, m)')
    unit = unit[0]

    const divisors = amount?.match(/\//g)
    if (divisors) {
      if (divisors.length > 1)
        return res
          .status(400)
          .send('invalid number format - too many divisors: ' + amount)

      const [num, denom] = amount.split('/')
      amount = +num / +denom
    } else amount = +amount

    res.json({ inputNum: amount, inputUnit: unit })
  })
}
