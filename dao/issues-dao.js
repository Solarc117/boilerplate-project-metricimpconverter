const { log, error } = console,
  { env } = process,
  COLLECTION = env.NODE_ENV === 'dev' ? 'test' : 'projects'
let db

// 📄 I don't yet know the difference between declaring owners as a global variable in this file (the current setup), and declaring it as a property in the IssuesDAO class.
module.exports = class IssuesDAO {
  /**
   * @description Impure; attempts to assign the "issue-tracker" db's "owners" collection to the global "owners" variable, if the global variable is undefined; logs a message if a connection is already established.
   * @param {object} client The MongoDB project under which the issue-tracker database and owners collection are located.
   */
  static async injectDB(client) {
    if (db)
      return log(
        `connection to ${COLLECTION} collection previously established`
      )

    try {
      db = await client.db('issue-tracker').collection(COLLECTION)
      log(`\x1b[32m\n🍃 connected to ${COLLECTION} collection`)
    } catch (err) {
      error(
        `\x1b[31m\nunable to establish a collection handle in IssuesDAO:`,
        err
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
        error: `\x1b[31m\nunable to drop ${COLLECTION} collection in a production environment`,
      }

    let dropResult

    try {
      dropResult = await db.drop()
    } catch (err) {
      error(
        `\x1b[31m\nunsuccessful drop command on ${COLLECTION} collection:`,
        err
      )
      return { error: err.message }
    }

    return dropResult
  }

  /**
   * @description Creates an upsert call to the db with the project argument passed.
   * @param {Project} project The document to be upserted into the collection.
   * @returns {object | null} The collection.updateOne response object, if the attempt was successful, or an object containing an error property if the attempt failed.
   */
  static async putProject(project) {
    const filter = { _id: project._id },
      operators = { $set: { ...project } },
      options = { upsert: true }
    let updateResult

    try {
      updateResult = await db.updateOne(filter, operators, options)
    } catch (err) {
      error(`\x1b[31m\nerror updating ${COLLECTION} collection:`, err)
      return { error: err.message }
    }

    return updateResult
  }

  /**
   * @description Attempts to fetch any documents from the connected collection matching the passed filter fields.
   * @param {string} name The  name of the project.
   * @returns {object | Project | null} An object containing an error property if the find method fails, or a document or null depending on whether a match was found.
   */
  static async getProject(name) {
    const query = { name }
    let result

    try {
      result = await db.findOne(query)
    } catch (err) {
      error(`\x1b[31m\nerror querying ${COLLECTION} collection:`, err)
      return { error: err.message }
    }

    return result
  }

  /**
   * @description Attempts to post the passed object to the connected collection.
   * @param {Project} project The object to post to the respective collection.
   */
  static async postProject(project) {
    let result

    try {
      result = await db.insertOne(project)
    } catch (err) {
      error(
        `\x1b[31m\nunable to insert document in ${COLLECTION} collection:`,
        err
      )
      return { error: err.message }
    }

    return result
  }
}

/**
 * @typedef Issue The element structure maintained in the database issues arrays.
 * @property {string} title The title of the issue.
 * @property {string} created_by The user that created the issue.
 * @property {string | null} [text] Text describing in further detail the issue.
 * @property {string | null} [assigned_to] The user responsible for addressing the issue.
 * @property {string | null} [status_text] Brief describtion the current state of the issue.
 */

/**
 * @typedef Project The document structure in the database projects collection.
 * @property {string} _id The project's unique identifier.
 * @property {string} name The project's name.
 * @property {string} owner The project owner.
 * @property {[Issue]} issues An array containing
 */
