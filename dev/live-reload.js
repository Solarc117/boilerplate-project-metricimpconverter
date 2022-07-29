'use strict'
const liveReloadServer = require('livereload').createServer(),
  connectLiveReload = require('connect-livereload')

module.exports = function (app) {
  liveReloadServer.server.once(
    'connection',
    // () => liveReloadServer.refresh('/')
    // Unsure of what purpose setTimeout serves here.
    () => setTimeout(() => liveReloadServer.refresh('/'), 100)
  )
  app.use(connectLiveReload())
}
