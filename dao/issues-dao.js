const { log, error } = console,
  { env } = process,
  COLLECTION = env.NODE_ENV === 'dev' ? 'test' : 'projects'
let db
/**
 * @description A utility function to generate UTC date strings from the current date.
 * @returns {string} A UTC string of the current date.
 */
function now() {
  return new Date().toUTCString()
}

// 📄 I don't yet know the difference between declaring owners as a global variable in this file (the current setup), and declaring it as a property in the IssuesDAO class.
module.exports = class IssuesDAO {
  /**
   * @description Impure; attempts to assign the "issue-tracker" db's "owners" collection to the global "owners" variable, if the global variable is undefined; logs a message if a connection is already established.
   * @async
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
   * @async
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
   * @description Creates an upsert call to the db with the project argument passed. For testing purposes.
   * @async
   * @param {Project} project The document to be upserted into the collection.
   * @returns {object | null} The collection.updateOne response object, if the attempt was successful, or an object containing an error property if the attempt failed.
   */
  static async putProject(project) {
    const filter = { _id: project._id },
      operators = { $set: { ...project } },
      options = { upsert: true }
    if (Array.isArray(project?.issues))
      for (const issue of project.issues) {
        const rightNow = now()
        if (issue.created_on === undefined) issue.created_on = rightNow
        issue.last_updated = rightNow
      }
    let result

    try {
      result = await db.updateOne(filter, operators, options)
    } catch (err) {
      error(`\x1b[31m\nerror updating ${COLLECTION} collection:`, err)
      return { error: err.message }
    }

    return result
  }

  /**
   * @description Attempts to fetch any documents from the connected collection matching the passed filter fields.
   * @async
   * @param {string} name The name of the project.
   * @param {object} query An object containing the query params from the url.
   * @returns {{ err: string } | Project | null} An object containing an error property if the find method fails, or a document or null depending on whether a match was found.
   */
  static async getProject(name, issueQueries) {
    /**
     * @description Returns a new array, containing only the issues that matched all the queries.
     * @param {array} issues The issues to filter.
     * @param {object} queries The queries to filter the issues with.
     */
    function filterIssues(issues = [], queries = {}) {
      const queryKeys = Object.keys(queries)
      // To prevent data mutation and keep this function "pure", we create a copy of issues with the spread operator instead of acting on the parameter, since the Array.filter method creates a shallow copy of the array argument, which can lead to unexpected behaviour.
      return [...issues].filter(issue => {
        for (const key of queryKeys) {
          const query = queries[key],
            issueField = issue[key]

          // (typeof query === 'string' && !issueField.includes(query))
          if (
            (query === null && issueField !== null) ||
            (typeof query === 'string' &&
              !issueField.match(new RegExp(query, 'i')))
          )
            return false
        }
        return true
      })
    }
    // I will filter the issues array after finding a match, but will keep in mind the possibility of integrating the pipeline for this functionality - maybe reformat the document structure to each individually represent an issue, and have the collection represent the project?
    const query = { name }
    let result

    try {
      result = await db.findOne(query)
    } catch (err) {
      error(`\x1b[31m\nerror querying ${COLLECTION} collection:`, err)
      return { error: err.message }
    }

    if (
      Array.isArray(result?.issues) &&
      issueQueries !== null &&
      typeof issueQueries === 'object' &&
      Object.keys(issueQueries).length > 0
    )
      result.issues = filterIssues(result.issues, issueQueries)

    return result
  }

  /**
   * @description Attempts to post (update) the passed object to the connected collection.
   * @async
   * @param {Project} project The object to post to the respective collection.
   */
  static async postProject(project) {
    if (Array.isArray(project?.issues))
      for (const issue of project.issues)
        issue.created_on = new Date().toUTCString()
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
 * @property {string} [created_by] The user that created the issue.
 * @property {string} [created_on] The UTC date the issue was created on.
 * @property {string} [last_updated] The UTC date the issue was last updated.
 * @property {string | null} [text] Text describing in further detail the issue.
 * @property {string | null} [assigned_to] The user responsible for addressing the issue.
 * @property {string | null} [status_text] Brief describtion the current state of the issue.
 */

/**
 * @typedef Project The document structure in the database projects collection.
 * @property {string} _id The project's unique identifier.
 * @property {string} name The project's name.
 * @property {string} owner The project owner.
 * @property {[Issue]} issues An array containing Issue objects for each issue in the project.
 */
