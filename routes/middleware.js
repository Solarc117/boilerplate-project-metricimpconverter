'use strict'
const cors = require('cors'),
  bodyParser = require('body-parser')

module.exports = function (app, express) {
  app.use('/public', express.static(process.cwd() + '/public'))

  app.use(cors({ origin: '*' })) // For FCC testing purposes only.

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
}
