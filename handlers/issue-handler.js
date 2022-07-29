'use strict'
const { log } = console

const IssuesDAO = require('../dao/issues-dao.js')

module.exports = class IssueHandler {
  /**
   * @description Calls the IssuesDAO dropTest method, and sends json to the client depicting the result.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async drop(req, res) {
    const dropResult = await IssuesDAO.dropTest()

    res.status(dropResult?.error ? 500 : 200).json(dropResult)
  }

  /**
   * @description Invokes the IssuesDAO putProject method, with the request body as an argument, and responds with the result. For testing purposes.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   * @param {Function} next The Express function to invoke the next middleware.
   */
  static async put(req, res) {
    const { body: project } = req,
      // Do not require a trycatch block for the following asynchronous method, because it itself will handle errors returned by the db.
      putResult = await IssuesDAO.putProject(project)

    res.status(putResult?.error ? 500 : 200).json(putResult)
  }

  /**
   * @description Invokes the IssuesDAO getProject method, passing the project and query object, and responds with the project's issues array, if it was found, or null. Sends an object with an error property and status code 500 if MongoDB threw an error.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async get(req, res) {
    const {
      params: { project: name },
      query,
    } = req

    for (const key of Object.keys(query))
      if (query[key].trim().length === 0) query[key] = null

    const getResult = await IssuesDAO.getProject(name, query)

    if (getResult?.error) return res.status(500).json(getResult)
    // Return null if there is no such project; or an array containing however many issues the existing project has.
    res.status(200).json(getResult === null ? getResult : getResult.issues)
  }

  /**
   * @description Invokes the IssuesDAO postProject method, and responds with the result.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async post(req, res) {
    function verifyProps(obj, props) {
      for (const prop of props)
        if (obj[prop] === undefined) {
          res.status(400).json({ err: `missing ${prop} field` })
          return false
        }
      return true
    }
    function nullifyUndefProps(obj, props) {
      for (const prop of props) if (obj[prop] === undefined) obj[prop] = null
    }
    const { body: project } = req,
      projectProps = ['name', 'owner', 'issues'],
      issueProps = {
        required: ['title', 'created_by'],
        optional: ['text', 'assigned_to', 'status_text'],
      }

    if (!verifyProps(project, projectProps)) return

    for (const issue of project.issues) {
      if (!verifyProps(issue, issueProps.required)) return
      nullifyUndefProps(issue, issueProps.optional)
    }

    const postResult = await IssuesDAO.postProject(project)

    res.status(postResult?.error ? 500 : 200).json(postResult)
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
