'use strict'
require('dotenv').config()
const { MongoClient } = require('mongodb'),
  app = require('./src/server.js'),
  IssuesDAO = require('./src/dao/issues-dao.js'),
  LibraryDAO = require('./src/dao/library-dao.js'),
  log = console.log.bind(console),
  error = console.error.bind(console),
  clear = console.clear.bind(console),
  { env } = process

clear()
// @ts-ignore
MongoClient.connect(env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async client => {
    await IssuesDAO.connect(client)
    await LibraryDAO.connect(client)

    const port = env.PORT || 3000
    app.listen(port, () => {
      log(`\x1b[32m\n🚀 Listening on port ${port}\n`)
      if (env.NODE_ENV !== 'development') return

      try {
        // @ts-ignore
        require('./mocha-runner.js').run()
      } catch (err) {
        error('\x1b[31m\nTests are not valid:', err)
      }
    })
  })
  .catch(err => error('\x1b[31m', err))
