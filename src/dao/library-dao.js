'use strict'
const { log, error } = console,
  { env } = process,
  COLLECTION = env.NODE_ENV === 'dev' ? 'test' : 'books'
let db

module.exports = class LibraryDAO {
  /**
   * @description Impure; attempts to assign the "issue-tracker" db's "owners" collection to the global "owners" variable, if the global variable is undefined; logs a message if a connection is already established.
   * @async
   * @param {object} client The MongoDB project under which the personal-library database and test/books collections are located.
   */
  static async injectDB(client) {
    if (db)
      return log(
        `connection to ${COLLECTION} collection previously established`
      )

    try {
      db = await client.db('personal-library').collection(COLLECTION)
    } catch (err) {
      error(
        `\x1b[31m\nunable to establish a collection handle in LibraryDAO:`,
        err
      )
    }

    log(`\x1b[32m\n📚 LibraryDAO connected to ${COLLECTION} collection`)
  }
}
