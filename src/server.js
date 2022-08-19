'use strict'
const { env } = process

const cors = require('cors'),
  bodyParser = require('body-parser'),
  express = require('express'),
  // @ts-ignore
  apiRouter = require('./routes/api.js'),
  fccTestingRoutes = require('./routes/fcctesting.js'),
  htmlRouter = require('./routes/html-router.js'),
  app = express()
if (env.NODE_ENV === 'dev') require('../dev/live-reload.js')(app)

app.set('json spaces', 2)

app.use('/public', express.static(process.cwd() + '/public'))
app.use(cors({ origin: '*' })) // For FCC testing purposes only.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

fccTestingRoutes(app)
app.use(htmlRouter)
app.use('/api', apiRouter)
app.use('*', (_, res) => res.status(404).json({ error: '404 not found' }))

module.exports = app // For testing.
