'use strict'
const ConvertHandler = require('../controllers/convertHandler.js'),
  {
    getNum: gN,
    getUnit: gU,
    getReturnNum: gRN,
    getReturnUnit: gRU,
    getString: gS,
  } = ConvertHandler,
  getNum = gN.bind(ConvertHandler),
  getUnit = gU.bind(ConvertHandler),
  getReturnNum = gRN.bind(ConvertHandler),
  getReturnUnit = gRU.bind(ConvertHandler),
  getString = gS.bind(ConvertHandler)

module.exports = function (app) {
  app.route('/api/convert').get((req, res) => {
    const { input } = req.query,
      { err: err0, initNum } = getNum(input),
      { err: err1, initUnit } = getUnit(input),
      { err: err2, returnUnit } = getReturnUnit(initUnit),
      { err: err3, returnNum } = getReturnNum(initNum, initUnit),
      string = getString(initNum, initUnit, returnNum, returnUnit),
      errs = [err0, err1, err2, err3]

    for (const err of errs) if (err) return res.status(400).json({ err })

    res.json({
      initNum,
      initUnit,
      returnNum,
      returnUnit,
      string,
    })
  })

  app
    .route('/api/issues/:project')

    .get((req, res) => {
      const { project } = req.params
    })

    .post((req, res) => {
      const { project } = req.params
    })

    .put((req, res) => {
      const { project } = req.params
    })

    .delete((req, res) => {
      const { project } = req.params
    })
}
