const liveReloadServer = require('livereload').createServer(),
  connectLiveReload = require('connect-livereload')
module.exports = function (app) {
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/')
    }, 100)
  })
  app.use(connectLiveReload())
}
