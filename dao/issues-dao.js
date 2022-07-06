const { log, error } = console
let owners

// 📄 I don't yet know the difference between declaring owners as a global variable in this file (the current setup), and declaring it as a property in the IssuesDAO class.
module.exports = class IssuesDAO {
  /**
   * @description Impure; attempts to assign the "issue-tracker" db's "owners" collection to the global "owners" variable, if the global variable is undefined; logs a message if a connection is already established.
   * @param {object} client The MongoDB project under which the issue-tracker database and owners collection are located.
   */
  static async injectDB(client) {
    if (owners)
      return log('connection to owners collection previously established')

    try {
      owners = await client.db('issue-tracker').collection('owners')
      log('\x1b[32m\n🍃 connected to owners collection')
    } catch (err) {
      error(
        `\x1b[31m\nunable to establish a collection handle in IssuesDAO: ${err}`
      )
    }
  }
  /**
   * @description A method that creates an upsert call (update if it exists, create if it doesn't) to the db with the doc argument passed.
   * @param {object} doc The document to the upserted into the collection.
   * @returns {object} The collection.updateOne response object, if the attempt was successful, or an object containing an error property if the attempt failed.
   */
  static async putDocument(doc) {
    const filter = { _id: doc._id },
      operators = { $set: { ...doc } },
      options = { upsert: true }

    let updateResult
    try {
      updateResult = await owners.updateOne(filter, operators, options)
    } catch (err) {
      error(`\x1b[31m\nerror updating owners collection: ${err}`)
      return { error: err }
    }

    return updateResult
  }

  /**
   * @description A method that fetches any documents from the owners collection matching the passed filter fields.
   * @param {object} query An object containing the fields that should be matched.
   * @returns {}
   */
  static async getDocument(query) {

    let findResult
    try {
      findResult = await owners.find(query)
    } catch (err) {
      error(`\x1b[31m\nerror querying owners collection: ${err}`)
      return { error: err }
    }

    return findResult
  }
}
