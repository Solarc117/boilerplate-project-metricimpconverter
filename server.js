'use strict'
function log() {
  console.log(...arguments)
}
console.clear()
require('dotenv').config()
const cors = require('cors'),
  bodyParser = require('body-parser'),
  express = require('express'),
  apiRoutes = require('./routes/api.js'),
  fccTestingRoutes = require('./routes/fcctesting.js'),
  htmlRoutes = require('./routes/html-routes.js'),
  runner = require('./test-runner.js'),
  app = express()
if (process.env.NODE_ENV === 'dev') require('./dev-server.js')(app)

app.use('/public', express.static(process.cwd() + '/public'))
app.use(cors({ origin: '*' })) // For FCC testing purposes only.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

htmlRoutes(app)
fccTestingRoutes(app)
apiRoutes(app)

app.use((req, res, next) => res.status(404).type('text').send('404 not found'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  log('Listening on port ' + PORT)
  if (process.env.NODE_ENV !== 'dev') return

  // Commented out timeout instead of deleting because the fcc team likely had a reason for it; I just don't understand it.
  // setTimeout(() => {
  try {
    // @ts-ignore
    runner.run()
  } catch (err) {
    console.error('Tests are not valid:', err)
  }
  // }, 1500)
})

module.exports = app // For testing.
