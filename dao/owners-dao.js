const { log, error } = console
let owners

// 📄 I don't yet know the difference between declaring owners as a global variable in this file (the current setup), and declaring it as a property in the OwnersDAO class.
module.exports = class OwnersDAO {
  /**
   * @description Impure; attempts to assign the "issue-tracker" db's "owners" collection to the global "owners" variable, if the global variable is undefined; logs a message if a connection is already established.
   * @param {object} client The MongoDB project under which the issue-tracker database and owners collection are located. 
   */
  static async injectDB(client) {
    if (owners) return log('connection to owners collection previously established')

    try {
      owners = await client.db('issue-tracker').collection('owners')
      log('\x1b[32m', '\n🍃 connected to owners collection')
    } catch (err) {
      error(
        `\x1b[31mUnable to establish a collection handle in ownersDAO: ${err}`
      )
    }
  }
  /**
   * @description A method that creates an upsert call (update if it exists, create if it doesn't) to the db. 
   */
  static async putIssue(owner, document) {}
}
