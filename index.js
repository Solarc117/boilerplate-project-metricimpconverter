'use strict'
const { log, error, clear } = console,
  { env } = process
clear()

const { MongoClient } = require('mongodb'),
  app = require('./server.js'),
  runner = require('./test-runner.js'),
  IssuesDAO = require('./dao/issues-dao.js')

MongoClient.connect(env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async client => {
    await IssuesDAO.injectDB(client)

    const port = env.PORT || 3000
    app.listen(port, () => {
      log('\x1b[32m', '\n🚀 listening on port ' + port)
      if (env.NODE_ENV !== 'dev') return

      try {
        runner.run()
      } catch (e) {
        error('\x1b[31m', 'Tests are not valid:', e)
      }
    })
  })
  .catch(err => error('\x1b[31m', err))
