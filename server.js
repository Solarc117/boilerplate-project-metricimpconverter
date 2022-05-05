'use strict'
require('dotenv').config()
const bodyParser = require('body-parser'),
  { expect } = require('chai'),
  // expect = require('chai').expect,
  cors = require('cors'),
  apiRoutes = require('./routes/api.js'),
  fccTestingRoutes = require('./routes/fcctesting.js'),
  runner = require('./test-runner'),
  express = require('express'),
  app = express()
// For development: browser auto-refresh.
if (process.env.NODE_ENV === 'dev') require('./dev-server')(app)

function log() {
  console.log(...arguments)
}

app.use('/public', express.static(process.cwd() + '/public'))
app.use(cors({ origin: '*' })) // For FCC testing purposes only.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const views = process.cwd() + '/views'

// Index page (static HTML).
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

// For FCC testing purposes.
fccTestingRoutes(app)

// Routing for API.
apiRoutes(app)

// 404 Not Found Middleware.
app.use((req, res, next) => {
  res.status(404).type('text').send('404 not Found')
})

// Start our server and tests!
const port = process.env.PORT || 3000
app.listen(port, () => {
  log('Listening on port ' + port)
  if (process.env.NODE_ENV !== 'dev') return

  log('Running Tests...')
  setTimeout(() => {
    // @ts-ignore
    runner.run().catch(err => console.error('Tests are not valid:', err))
    // try {
    //   // @ts-ignore
    //   runner.run()
    // } catch (e) {
    //   console.error('Tests are not valid:', e)
    // }
  }, 1500)
})

module.exports = app // For testing.
