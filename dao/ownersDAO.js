const { log, error } = console
let owners

module.exports = class OwnersDAO {
  static async injectDB(client) {
    if (owners) return

    try {
      owners = await client.db('issue-tracker').collection('owners')
      log('\x1b[32m', '\n🍃 connected to owners collection')
    } catch (err) {
      error(
        '\x1b[31m',
        `Unable to establish a collection handle in moviesDAO: ${err}`
      )
    }
  }

  static async getIssues()
}
