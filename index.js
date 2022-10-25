'use strict'
const { log, error, clear } = console,
  { env } = process
clear()

const { MongoClient } = require('mongodb'),
  app = require('./src/server.js'),
  IssuesDAO = require('./src/dao/issues-dao.js'),
  LibraryDAO = require('./src/dao/library-dao.js')

MongoClient.connect(env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async client => {
    await IssuesDAO.injectDB(client)
    await LibraryDAO.injectDB(client)

    const port = env.PORT || 3000
    app.listen(port, () => {
      log(`\x1b[32m\n🚀 Listening on port ${port}\n`)
      if (env.NODE_ENV !== 'dev') return

      try {
        require('./test-runner.js').run()
      } catch (err) {
        error('\x1b[31m\nTests are not valid:', err)
      }
    })
  })
  .catch(err => error('\x1b[31m', err))
