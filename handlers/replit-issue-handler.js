'use strict'
const { log, warn } = console

const { ObjectId } = require('mongodb'),
  IssuesDAO = require('../dao/issues-dao.js')
/**
 * @description A utility function to generate UTC date strings from the current date.
 * @returns {string} A UTC string of the current date.
 */
function now() {
  return new Date().toUTCString()
}

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
    const { body: project } = req
    function updateIssueDates(project) {
      if (Array.isArray(project?.issues))
        for (const issue of project.issues) {
          const rightNow = now()
          if (issue.created_on === undefined) issue.created_on = rightNow
          issue.last_updated = rightNow
        }
    }

    updateIssueDates(project)

    // Do not require a trycatch block for the following asynchronous method, because it itself will handle errors returned by the db.
    const putResult = await IssuesDAO.putProject(project)

    res.status(putResult?.error ? 500 : 200).json(putResult)
  }

  /**
   * @description Invokes the IssuesDAO getProject method, passing the project name, and responds with the project's issues array (if it was found) or null. Sends an object with an error property and status code 500 if MongoDB threw an error.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async get(req, res) {
    const {
      params: { project: name },
      query,
    } = req
    function filterIssues(issues = [], queries = {}) {
      const queryKeys = Object.keys(queries)
      // To prevent data mutation and keep this function "pure", we create a copy of issues with the spread operator instead of acting on the parameter, since the Array filter() method creates a shallow copy of the array argument, which can lead to unexpected behaviour.
      return [...issues].filter(issue => {
        for (const key of queryKeys) {
          const query = queries[key],
            issueField = issue[key]

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
    function queryAndIssuesValid(DAOResult, queryObj) {
      return (
        Array.isArray(DAOResult?.issues) &&
        queryObj !== null &&
        typeof queryObj === 'object' &&
        Object.keys(queryObj).length > 0
      )
    }
    function nullifyEmptyStringProps(obj) {
      for (const key of Object.keys(obj)) {
        const val = obj[key]
        if (typeof val === 'string' && val.trim().length === 0) obj[key] = null
      }
    }

    nullifyEmptyStringProps(query)

    const getResult = await IssuesDAO.getProject(name)

    if (getResult?.error) return res.status(500).json(getResult)

    // I will filter the issues array after finding a match, but will keep in mind the possibility of integrating the pipeline for this functionality - maybe reformat the document structure to each individually represent an issue, and have the collection represent the project?
    if (queryAndIssuesValid(getResult, query))
      getResult.issues = filterIssues(getResult.issues, query)

    // Return null if there is no such project, or an array containing however many issues the existing project has.
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

    if (Array.isArray(project?.issues))
      for (const issue of project.issues) issue.created_on = now()

    if (project._id !== undefined)
      warn(`overriding _id property on project of type ${typeof project._id}`)
    project._id = new ObjectId()

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
