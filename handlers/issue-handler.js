'use strict'
const { log, warn } = console

const { ObjectId } = require('mongodb'),
  IssuesDAO = require('../dao/issues-dao.js')

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
   * @description Fetches a project from the database using its title. Responds with null if no match was found, or otherwise with the project's issues. Filters the issues array if any queries were passed. Responds with an error object and status code 500 if a server error is encountered.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async get(req, res) {
    function filterIssues(issues = [], queries = {}) {
      const queryKeys = Object.keys(queries)
      // To prevent data mutation and keep this function "pure", we create a copy of issues with the spread operator instead of acting on the parameter, since the Array.filter method creates a shallow copy of the array argument, which can lead to unexpected behaviour.
      return [...issues].filter(issue => {
        for (const key of queryKeys) {
          const query = queries[key],
            queryType = typeof query,
            issueField = issue[key]

          if (
            (query === null && issueField !== null) ||
            (queryType === 'number' && query !== issueField) ||
            (queryType === 'string' &&
              !issueField.match(new RegExp(query, 'i')))
          )
            return false
        }
        return true
      })
    }
    function queryAndIssuesValid(DAOResult, queryObj) {
      return (
        Array.isArray(DAOResult?.issues) &&
        queryObj !== null &&
        typeof queryObj === 'object' &&
        Object.keys(queryObj).length > 0
      )
    }
    function nullifyEmptyStringProps(obj) {
      for (const key of Object.keys(obj))
        if (obj[key]?.trim?.().length === 0) obj[key] = null

      return obj
    }
    const {
      params: { project },
      query,
    } = req
    let getResult

    if (typeof query.index === 'string') query.index = +query.index

    getResult = await IssuesDAO.fetchProject(project)

    if (queryAndIssuesValid(getResult, query))
      getResult.issues = filterIssues(
        getResult.issues,
        nullifyEmptyStringProps(query)
      )

    if (getResult?.error) return res.status(500).json(getResult)
    // Return null if there is no such project; or an array containing however many issues the existing project has.
    res.status(200).json(getResult === null ? getResult : getResult.issues)
  }

  /**
   * @description Invokes the IssuesDAO putProject method, with the request body as an argument, and responds with the result. For testing purposes.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   * @param {Function} next The Express function to invoke the next middleware.
   */
  static async put(req, res) {
    function updateAllIssueDates(project) {
      if (!Array.isArray(project?.issues)) return

      const now = new Date().toUTCString()
      for (const [i, issue] of project.issues.entries()) {
        if (issue.created_on === undefined) issue.created_on = now
        issue.last_updated = now
        issue.index = i
      }
    }
    const { body: project } = req
    let putResult

    if (project._id !== undefined)
      return res.status(400).json({
        error: `unexpected _id property of type ${typeof project._id} on project - it is automatically assigned`,
      })

    if (Array.isArray(project.issues))
      for (const issue of project.issues)
        if (issue?.index !== undefined)
          return res.status(400).json({
            error: `unexpected index property of type ${typeof issue.index} on project - it is automatically assigned`,
          })

    const openType = typeof project?.open
    if (openType !== 'boolean' && openType !== 'undefined')
      return res.status(400).json({
        error: `unexpected open property of type ${openType} on project - expected a boolean or undefined`,
      })

    updateAllIssueDates(project)

    // Do not require a trycatch block for the following asynchronous method, because it itself will handle errors returned by the db and return an object with an error property.
    putResult = await IssuesDAO.upsertProject(project)

    // Remember to verify that all error properties the DAO returns are SERVER, and not CLIENT errors. DAO should only be dealing with server errors at this point; client errors (bad requests) should be handled by the handler.
    res.status(putResult?.error ? 500 : 200).json(putResult)
  }

  /**
   * @description Attempts to post the received project to the database. Automatically assigns a new ObjectId to new projects.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async post(req, res) {
    function objHasProps(obj, props) {
      for (const prop of props)
        if (obj[prop] === undefined) {
          res.status(400).json({ error: `missing ${prop} field` })
          return false
        }

      return true
    }
    function nullifyUndefProps(obj, props) {
      for (const prop of props) if (obj[prop] === undefined) obj[prop] = null
    }
    function verifyAndFormatIssues(project) {
      if (!Array.isArray(project?.issues)) return true

      const now = new Date().toUTCString()
      for (const [i, issue] of project.issues.entries()) {
        if (!objHasProps(issue, issueProps.required)) return false
        issue.created_on = now
        issue.index = i
        nullifyUndefProps(issue, issueProps.optional)
      }

      return true
    }
    const { body: project } = req,
      projectProps = ['project', 'owner', 'issues'],
      issueProps = {
        required: ['title', 'created_by'],
        optional: ['text', 'assigned_to', 'status_text'],
      }
    let postResult

    if (!objHasProps(project, projectProps)) return

    for (const prop of ['_id', 'open', 'index'])
      if (project[prop] !== undefined)
        return res.status(400).json({
          error: `unexpected ${prop} property of type ${typeof project[
            prop
          ]} on project - it is automatically assigned`,
        })
      else project[prop] = prop === '_id' ? new ObjectId() : true

    if (!verifyAndFormatIssues(project)) return

    postResult = await IssuesDAO.createProject(project)

    res.status(postResult?.error ? 500 : 200).json(postResult)
  }

  /**
   * @description Attempts to update a single issue of the specified index, under the specified project. May only update title, text, assigned_to, status_text, and/or open properties of issues.
   * @param {object} req The Express request body.
   * @param {object} res The Express response body.
   */
  static async patch(req, res) {
    const {
        body,
        params: { project },
        query: { index },
      } = req,
      query = { project }
    query.index = +index
    let patchResult

    for (const prop of ['index', 'created_by', 'created_on', 'last_updated'])
      if (body.prop !== undefined)
        return res.status(400).json({
          error: `unexpected property ${prop} on issue update - this property cannot be updated`,
        })

    if (Object.keys(body).length === 0)
      return res.status(400).json({
        error: 'no update fields passed - please include at least one field',
      })

    patchResult = await IssuesDAO.updateProject(query, body)

    res.status(patchResult?.error ? 500 : 200).json(patchResult)
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
