const { log } = console,
  { env } = process
const COLLECTION = env.NODE_ENV === 'dev' ? 'test' : 'projects'
let db

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
    } catch (err) {
      error(
        `\x1b[31m\nunable to establish a collection handle in IssuesDAO:`,
        err
      )
    }

    log(`\x1b[32m\n🍃 connected to ${COLLECTION} collection`)
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
   * @description Attempts to fetch a single Project document matching the passed project name.
   * @async
   * @param {string} name The name of the project.
   * @returns {{ err: string } | Project | null} An object containing an error property if the find method fails, or a document or null depending on whether a match was found.
   */
  static async fetchProject(project) {
    // I will filter the issues array after finding a match, but will keep in mind the possibility of integrating the pipeline for this functionality - maybe reformat the document structure to each individually represent an issue, and have the collection represent the project?
    const query = { project }
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
   * @description Creates an upsert call to the db with the project argument passed. For testing purposes.
   * @async
   * @param {Project} project The document to be upserted into the collection.
   * @returns {object | null} The collection.updateOne response, or an object containing an error property if the attempt failed.
   */
  static async upsertProject(project) {
    const query = { project: project.project },
      operators = { $set: { ...project } },
      options = { upsert: true }
    let result

    try {
      result = await db.updateOne(query, operators, options)
    } catch (err) {
      error(`\x1b[31m\nerror upserting ${COLLECTION} collection:`, err)
      return { error: err.message }
    }

    return result
  }

  /**
   * @description Attempts to post (upload) the passed object to the connected collection.
   * @async
   * @param {Project} project The object to post to the respective collection.
   * @returns {null | { error: string } | { acknowledged: string, insertedId: string | null | undefined }}
   */
  static async createProject(project) {
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

  /**
   * @description Attempts to update a single issue in the database.
   * @async
   * @param {object} query An object containing the index of the issue to update, and the title of the project that the issue pertains to.
   * @param {object} fieldsToUpdate The fields of the issue to update, containing their new values.
   */
  static async updateProject(query, fieldsToUpdate) {
    const { project, index } = query,
      filter = { project },
      command = {
        $set: {},
      }

    for (const key of Object.keys(fieldsToUpdate))
      command.$set[`issues.${index}.${key}`] = fieldsToUpdate[key]

    let result

    try {
      result = await db.updateOne(filter, command)
    } catch (err) {
      error(
        `\x1b[31m\nunable to update document in ${COLLECTION} collection:`,
        err
      )
      return { error: err.message }
    }

    return result
  }

  /**
   * @description Deletes a single issue from a project using its index
   * @async.
   * @param {number} index The index of the issue to delete.
   */
  static async deleteProject(project, index) {
    const filter = { project },
      deleteCommand = {
        $pull: {
          issues: {
            index,
          },
        },
      },
      indexEditCommand = {
        $inc: {
          'issues.$[issue].index': -1,
        },
      },
      indexEditOptions = {
        arrayFilters: [
          {
            'issue.index': {
              $gt: index,
            },
          },
        ],
      }
    let deleteResult, indexEditResult

    try {
      // I am aware that this could result in buggy behaviour, if one call succeeds and another doesn't. I could look into using an aggreagation pipeline, OR even making another http call that simply resets ALL index values in the given project's issues array, IF this delete call is successful. I think the latter is more do-able.
      deleteResult = await db.updateOne(filter, deleteCommand)
      // Attempt to edit the issue indexes only if the delete operation succeeded.
      if (deleteResult?.modifiedCount === 1)
        indexEditResult = await db.updateOne(
          filter,
          indexEditCommand,
          indexEditOptions
        )
    } catch (err) {
      error(
        `\x1b[31m\nunable to delete issue in ${COLLECTION} collection:`,
        err
      )
      return { error: err.message }
    }

    if (deleteResult === null) return null
    if (indexEditResult === null) {
      error(
        `\x1b[31m\n⚠️ could not update ${project} indexes - need to reset index values`
      )
      return {
        error:
          'successful delete operation, but unsuccessful index update operation',
      }
    }

    return deleteResult
  }
}

/**
 * @typedef Issue The element structure maintained in the database issues arrays.
 * @property {number} index A number unique to the issue (within its parent project).
 * @property {string} title The title of the issue.
 * @property {string} created_by The user that created the issue.
 * @property {string | null} text Text describing in further detail the issue.
 * @property {string | null} assigned_to The user responsible for addressing the issue.
 * @property {string | null} status_text Brief describtion the current state of the issue.
 * @property {boolean} open A boolean indicating whether the issue is open (to be addressed) or closed (resolved).
 * @property {string} created_on The UTC date the issue was created on.
 * @property {string} last_updated The UTC date the issue was last updated.
 */

/**
 * @typedef Project The document structure in the database projects collection.
 * @property {string} _id The project's unique identifier.
 * @property {string} project The project's title.
 * @property {string} owner The project owner.
 * @property {[Issue]} issues An array containing Issue objects for each issue in the project.
 */
