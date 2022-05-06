'use strict'
const { expect } = require('chai'),
  ConvertHandler = require('../controllers/convertHandler.js'),
  convertHandler = new ConvertHandler()

module.exports = function (app) {
  app.route('/api/convert').get((req, res) => {
    const { input } = req.query,
      inputNum = +input.match(/^\d+/)[0],
      inputUnit = input.match(/[a-z]+$/i)[0]
    res.json({ inputNum, inputUnit })
  })
}
