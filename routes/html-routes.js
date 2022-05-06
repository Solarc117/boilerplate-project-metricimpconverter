'use strict'
const views = process.cwd() + '/views'

module.exports = function (app) {
  app.route('/').get((req, res) => {
    res.sendFile(views + '/home.html')
  })

  app.route('/metric-imperial').get((req, res) => {
    res.sendFile(views + '/metric-imperial/')
  })

  app.route('/issue-tracker').get((req, res) => {
    res.sendFile(views + '/issue-tracker/')
  })

  app.route('/personal-library').get((req, res) => {
    res.sendFile(views + '/personal-library/')
  })

  app.route('/sudoku-solver').get((req, res) => {
    res.sendFile(views + '/sudoku-solver/')
  })

  app.route('/american-british').get((req, res) => {
    res.sendFile(views + '/american-british/')
  })
}
