'use strict'
const { expect } = require('chai'),
  ConvertHandler = require('../controllers/convertHandler.js')

module.exports = function (app) {
  app.route('/api/convert').get((req, res) => {
    const { input } = req.query,
      { error, inputNum } = ConvertHandler.getNum(input)

    if (error) return res.status(400).send(error)

    res.json({
      inputNum,
      // , initUnit, returnNum, returnUnit, string
    })
  })
}
