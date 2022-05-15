'use strict'
const { expect } = require('chai'),
  ConvertHandler = require('../controllers/convertHandler.js')

module.exports = function (app) {
  app.route('/api/convert').get((req, res) => {
    const { input } = req.query,
      { err: getNumErr, initNum } = ConvertHandler.getNum(input),
      { err: getUnitErr, initUnit } = ConvertHandler.getUnit(input)

    if (getNumErr) return res.status(400).send(getNumErr)
    if (getUnitErr) return res.status(400).send(getUnitErr)

    res.json({
      initNum,
      initUnit,
      // returnNum, returnUnit, string,
    })
  })
}
