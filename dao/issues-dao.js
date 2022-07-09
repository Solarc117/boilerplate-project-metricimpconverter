const { log, error } = console,
  { env } = process
let db

// 📄 I don't yet know the difference between declaring owners as a global variable in this file (the current setup), and declaring it as a property in the IssuesDAO class.
module.exports = class IssuesDAO {
  /**
   * @description Impure; attempts to assign the "issue-tracker" db's "owners" collection to the global "owners" variable, if the global variable is undefined; logs a message if a connection is already established.
   * @param {object} client The MongoDB project under which the issue-tracker database and owners collection are located.
   */
  static async injectDB(client) {
    const collection = env.NODE_ENV === 'dev' ? 'test' : 'projects'

    if (db)
      return log(
        `connection to ${collection} collection previously established`
      )

    try {
      db = await client.db('issue-tracker').collection(collection)
      log(`\x1b[32m\n🍃 connected to ${collection} collection`)
    } catch (err) {
      error(
        `\x1b[31m\nunable to establish a collection handle in IssuesDAO: ${err}`
      )
    }
  }

  /**
   * @description Drops the test collection if currently connected to it.
   * @returns {object | null} The result of the drop operation, or an object containing an error property if the operation failed or was unable to execute.
   */
  static async dropTest() {
    if (env.NODE_ENV !== 'dev')
      return {
        error: `unable to drop ${db} collection in a production environment`,
      }

    let dropResult

    try {
      dropResult = await db.drop()
    } catch (err) {
      error(`unsuccessful drop command on ${db} collection: ${err}`)
      return { error: err }
    }

    return dropResult
  }

  /**
   * @description A method that creates an upsert call (update if it exists, create if it doesn't) to the db with the doc argument passed.
   * @param {object} doc The document to the upserted into the collection.
   * @returns {object | null} The collection.updateOne response object, if the attempt was successful, or an object containing an error property if the attempt failed.
   */
  static async putProject(doc) {
    const filter = { _id: doc._id },
      operators = { $set: { ...doc } },
      options = { upsert: true }
    let updateResult

    try {
      updateResult = await db.updateOne(filter, operators, options)
    } catch (err) {
      error(`\x1b[31m\nerror updating ${db} collection: ${err}`)
      return { error: err }
    }

    return updateResult
  }

  /**
   * @description A method that fetches any documents from the connected collection matching the passed filter fields.
   * @param {object} projectName The project name of the document.
   * @returns {object | Array} An object containing an error property if the find method fails, or an array pertaining to the respective project's issues.
   */
  static async getProject(projectName) {
    const query = { name: projectName }
    let result

    try {
      result = await db.findOne(query)
    } catch (err) {
      error(`\x1b[31m\nerror querying ${db} collection: ${err}`)
      return { error: err }
    }

    return result
  }
}
