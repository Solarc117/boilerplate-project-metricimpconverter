'use strict'
const { expect } = require('chai'),
  ConvertHandler = require('../controllers/convertHandler.js')

module.exports = function (app) {
  app.route('/api/convert').get((req, res) => {
    function clientErr(err) {
      return res.status(400).send(err)
    }
    const { input } = req.query,
      { err: err0, initNum } = ConvertHandler.getNum(input),
      { err: err1, initUnit } = ConvertHandler.getUnit(input),
      { err: err2, returnUnit } = ConvertHandler.getReturnUnit(initUnit),
      { err: err3, returnNum } = ConvertHandler.getReturnNum(initNum, initUnit)

    return err0
      ? clientErr(err0)
      : err1
      ? clientErr(err1)
      : err2
      ? clientErr(err2)
      : err3
      ? clientErr(err3)
      : res.json({
          initNum,
          initUnit,
          returnNum,
          returnUnit,
          // string,
        })
  })
}
