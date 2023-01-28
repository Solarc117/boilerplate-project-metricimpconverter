'use strict'
require('dotenv').config()
const log = console.log.bind(console),
  error = console.error.bind(console),
  { env } = process,
  COLLECTION = env.NODE_ENV === 'production' ? 'projects' : 'test'
let DB

// 📄 I don't yet know the difference between declaring DB as a global variable in this file (the current setup), and declaring it as a property in the IssuesDAO class.
module.exports = class IssuesDAO {
  1
  /**
   * @description Impure; attempts to assign the "issue-tracker" db's "projects" or "test" collection to the argument, if undefined. Logs a message if a connection is already established.
   * @returns {Promise<void>}
   */
  static async connect(client) {
    if (DB)
      return log(
        `IssuesDAO connection to ${COLLECTION} collection already established`
      )

    try {
      DB = await client.db('issue-tracker').collection(COLLECTION)

      log(`IssuesDAO connected to ${COLLECTION} collection`)
    } catch (error) {
      error(`unable to connect IssuesDAO to ${COLLECTION} collection:`, error)
    }
  }

  /**
   * @description Attempts to fetch all projects in db, & returns their titles.
   * @returns {Promise<[string] | { error: string }>}
   */
  static async fetchProjects() {
    try {
      const result = await DB.find(
        {},
        {
          projection: {
            _id: 0,
            project: 1,
          },
        }
      ).toArray()

      return result
    } catch (err) {
      error('error fetching projects:', err)

      return { error: err.message }
    }
  }

  /**
   * @description Attempts to fetch a single Project document matching the passed project name. If an index argument exists, returns the issue under said index.
   * @param {string} projectName The name of the project.
   * @param {number} [issueIndex] The index of a single issue to project, if any.
   * @returns {Promise<{ error: string } | Project | null>} An object containing an error property if the find method fails, or a document or null depending on whether a match was found.
   */
  static async fetchProject(projectName, issueIndex) {
    // Filters the issues array after finding a match. Might be possibile to integrate a pipeline for this functionality - maybe reformat the document structure to each individually represent an issue, and have the collection represent the project?
    try {
      const matchProject = {
          $match: {
            project: projectName,
          },
        },
        getIssueAtIndex = {
          $project: {
            _id: 0,
            issue: {
              $arrayElemAt: ['$issues', issueIndex],
            },
          },
        },
        pipeline = [matchProject]
      if (typeof issueIndex === 'number')
        // @ts-ignore
        pipeline.push(getIssueAtIndex)

      const result = await DB.aggregate(pipeline).toArray()

      return result[0]
    } catch (err) {
      error(`error querying ${COLLECTION} collection:`, err)
      return { error: err.message }
    }
  }

  /**
   * @description Appends the issue to the project argument, creating the project document if it does not exist.
   * @param {Issue} issue The issue object to append.
   * @param {string} project The name of the project to be upserted into the collection.
   * @returns {Promise<object>} The collection.updateOne response, or an object containing an error property if the attempt failed.
   */
  static async createIssue(issue, project) {
    try {
      const query = { project },
        operators = {
          $push: {
            issues: issue,
          },
        },
        updateResult = await DB.updateOne(query, operators)

      return updateResult
    } catch (err) {
      error(`error creating new issue in ${COLLECTION} collection:`, err)
      return { error: err.message }
    }
  }

  /**
   * @description Attempts to post a new project document to the connected collection.
   * @param {string} project The name of the project.
   * @param {string} owner The owner of the project.
   * @returns {Promise<null | { error: string } | { acknowledged: string, insertedId: string | null | undefined }>}
   */
  static async createProject(project, owner) {
    try {
      const result = await DB.insertOne({ project, owner, issues: [] })

      return result
    } catch (err) {
      error(`unable to insert document in ${COLLECTION} collection:`, err)
      return { error: err.message }
    }
  }

  /**
   * @description Attempts to update a single issue in the database.
   * @param {{ project: string, index: string | number }} query An object containing the index of the issue to update, and the title of the project that the issue pertains to.
   * @param {object} fieldsToUpdate The fields of the issue to update, containing their new values.
   * @returns {Promise<object>} The result of the update operation. Contains an "error" property in case of an error, detailing its message.
   */
  static async updateIssue(query, fieldsToUpdate) {
    const { project, index } = query,
      filter = { project },
      command = {
        $set: {},
      }

    for (const key of Object.keys(fieldsToUpdate))
      command.$set[`issues.${index}.${key}`] = fieldsToUpdate[key]

    try {
      const result = await DB.updateOne(filter, command)

      return result
    } catch (err) {
      error(`unable to update document in ${COLLECTION} collection:`, err)
      return { error: err.message }
    }
  }

  /**
   * @description Deletes the issue at the given index from a project.
   * @param {string} project The name of the project that the issue pertains to.
   * @param {number} index The index of the issue to delete.
   * @returns {Promise<object | null>} The result of the operaton.
   */
  static async deleteIssue(project, index) {
    const deleteIssuePipeline = [
      {
        $replaceWith: {
          $setField: {
            field: 'issues',
            input: '$$ROOT',
            value: {
              $cond: {
                if: { $eq: [{ $size: '$issues' }, 0] },
                then: [],
                else:
                  index === 0
                    ? {
                        $slice: ['$issues', 1, { $size: '$issues' }],
                      }
                    : {
                        $concatArrays: [
                          { $slice: ['$issues', 0, index] },
                          {
                            $slice: [
                              '$issues',
                              index + 1,
                              { $size: '$issues' },
                            ],
                          },
                        ],
                      },
              },
            },
          },
        },
      },
    ]

    try {
      const deleteResult = await DB.updateOne({ project }, deleteIssuePipeline)

      return deleteResult
    } catch (err) {
      error(`unable to delete issue in ${COLLECTION} collection:`, err)
      return { error: err.message }
    }
  }

  /**
   * @description Drops the test collection if currently connected to it.
   * @returns {Promise<object | null>} The result of the drop operation, or an object containing an error property if the operation failed or was unable to execute.
   */
  static async dropTest() {
    if (process.env.NODE_ENV !== 'development')
      return {
        error: `unable to drop ${COLLECTION} collection in a production environment`,
      }

    try {
      const dropResult = await DB.drop()

      return dropResult
    } catch (err) {
      if (err.codeName === 'NamespaceNotFound')
        return log(`${COLLECTION} collection does not exist`)

      error(`unsuccessful drop command on ${COLLECTION} collection:`, err)
      return { error: err.message }
    }
  }
}

/**
 * @typedef Issue The element structure maintained in the database issues arrays.
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
