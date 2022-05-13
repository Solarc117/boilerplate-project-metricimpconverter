'use strict'
require('dotenv').config()
const { expect } = require('chai'),
  // expect = require('chai').expect,
  apiRoutes = require('./routes/api.js'),
  fccTestingRoutes = require('./routes/fcctesting.js'),
  express = require('express'),
  app = express(),
  htmlRoutes = require('./routes/html-routes.js'),
  middleware = require('./routes/middleware.js'),
  runner = require('./test-runner.js')
if (process.env.NODE_ENV === 'dev') require('./dev-server.js')(app)

console.clear()

middleware(app, express)
htmlRoutes(app)
fccTestingRoutes(app)
// Routing for API.
apiRoutes(app)

app.use((req, res, next) => {
  res.status(404).type('text').send('404 not found')
})

const PORT = process.env.PORT || 3000
function log() {
  console.log(...arguments)
}
app.listen(PORT, () => {
  log('Listening on port ' + PORT)
  if (process.env.NODE_ENV !== 'dev') return

  setTimeout(() => {
    try {
      // @ts-ignore
      runner.run()
    } catch (err) {
      console.error('Tests are not valid:', err)
    }
  }, 1500)
})

module.exports = app // For testing.
