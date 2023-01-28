'use strict'
const { ObjectId } = require('mongodb'),
  sanitize = require('mongo-sanitize'),
  IssuesDAO = require('../dao/issues-dao.js')

module.exports = class IssueHandler {
  1
  /**
   * @description Calls the IssuesDAO dropTest method, and sends json to the client depicting the result.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async drop(req, res) {
    const dropResult = await IssuesDAO.dropTest()

    dropResult?.error
      ? res.status(500).json({ error: 'could not drop test collection' })
      : res.status(200).json({ success: true })
  }

  /**
   * @description Fetches all projects in database, and returns their names.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async getProjects(req, res) {
    const result = await IssuesDAO.fetchProjects()

    Array.isArray(result)
      ? res.status(200).json(result)
      : res.status(500).json({ error: 'could not fetch projects' })
  }

  /**
   * @description Attempts to post the received project to the database. Automatically assigns a new ObjectId to new projects.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async postProject(req, res) {
    const {
      params: { owner: o, project: p },
    } = req

    for (const value of [o, p])
      if (typeof value !== 'string' || value.length === 0)
        return res
          .status(400)
          .json({ error: 'please provide valid project and owner values' })

    const owner = sanitize(o),
      project = sanitize(p),
      postResult = await IssuesDAO.createProject(project, owner)

    // @ts-ignore
    res.status(postResult?.error ? 500 : 200).json(postResult)
  }

  /**
   * @description Fetches a project from the database using its title. Responds with null if no match was found, or otherwise with the project's issues. Filters the issues array if any queries were passed. Responds with an error object and status code 500 if a server error is encountered.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async getProjectIssues(req, res) {
    function filterIssues(issues = [], queries = {}) {
      const queryKeys = Object.keys(queries)

      // To prevent data mutation and keep this function "pure", we create a copy of issues with the spread operator instead of acting on the parameter, since the Array.filter method creates a shallow copy of the array argument, which can lead to unexpected behaviour.
      return [...issues].filter(issue => {
        for (const queryKey of queryKeys) {
          const queryValue =
              queryKey === 'created_on' || queryKey === 'last_updated'
                ? queries[queryKey].replace(/-/g, '/')
                : queries[queryKey],
            issueValue = issue[queryKey]

          return queryKey === 'open' ||
            queryKey === 'created_on' ||
            queryKey === 'last_updated'
            ? queryValue === issueValue
            : !!issueValue.match(new RegExp(queryValue, 'i'))
        }
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
    function deleteEmptyStringProperties(object) {
      for (const key of Object.keys(object)) {
        const value = object[key]

        if (typeof value === 'string' && value.length === 0) delete object[key]
      }
    }
    const {
        params: { project: projectName },
        query: issueQueries,
      } = req,
      sanitizedProjectName = sanitize(projectName)
    deleteEmptyStringProperties(issueQueries)

    if (
      typeof issueQueries.index === 'string' &&
      issueQueries.index.length > 0
    ) {
      if (issueQueries.index.match(/[^\d]/g))
        return res
          .status(400)
          .json({ error: 'invalid index - please enter a positive integer' })

      const issueIndex = +issueQueries.index,
        result = await IssuesDAO.fetchProject(sanitizedProjectName, issueIndex)

      // @ts-ignore
      if (typeof result?.error === 'string')
        return res
          .status(500)
          .json({ error: `could not fetch issue at index ${issueIndex}` })

      // @ts-ignore
      return res.status(200).json(result?.issue || {})
    }

    if (typeof issueQueries.open === 'string' && issueQueries.open.length > 0)
      issueQueries.open = issueQueries.open === 'true'

    for (const key of ['created_on', 'last_updated'])
      if (issueQueries[key]?.length > 0)
        // YYYY-DD-MM -> YYYY/MM/DD
        issueQueries[key] = issueQueries[key].replace(
          /(\d{2,})-(\d{1,})-(\d{1,})/,
          '$1/$3/$2'
        )

    const result = await IssuesDAO.fetchProject(sanitizedProjectName)

    // @ts-ignore
    if (typeof result?.error === 'string')
      return res.status(500).json({ error: 'could not get issues' })

    if (queryAndIssuesValid(result, issueQueries))
      // @ts-ignore
      result.issues = filterIssues(
        // @ts-ignore
        result.issues,
        issueQueries
      )

    // Return null if there is no such project; or an array containing however many issues the existing project has.
    // @ts-ignore
    res.status(200).json(result?.issues || null)
  }

  /**
   * @description Attempts to append an issue to a project. Creates the project if it does not exist.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async appendIssue(req, res) {
    const {
        body: issue,
        params: { project: p },
      } = req,
      project = sanitize(p),
      openType = typeof issue.open,
      requiredProperties = {
        strings: [
          'title',
          'text',
          'created_by',
          'assigned_to',
          'status_text',
          'created_on',
          'last_updated',
        ],
        booleans: ['open'],
      }
    sanitize(issue)

    for (const stringProperty of requiredProperties.strings)
      if (typeof issue[stringProperty] !== 'string') issue[stringProperty] = ''
    for (const booleanProperty of requiredProperties.booleans)
      if (typeof issue[booleanProperty] !== 'boolean')
        issue[booleanProperty] = true

    if (openType !== 'boolean' && openType !== 'undefined')
      return res.status(400).json({
        error: `unexpected open property of type ${openType} on project - expected a boolean or undefined`,
      })

    // Do not require a trycatch block for the following asynchronous method, because it itself will handle errors returned by the db and return an object with an error property.
    // this.#updateIssueDates(issue) does not work in node/express project, but it does in next?
    const issueWithUpdatedDates = IssueHandler.#updateIssueDates(issue),
      result = await IssuesDAO.createIssue(issueWithUpdatedDates, project)

    // Remember to verify that all error properties the DAO returns are SERVER, and not CLIENT errors. DAO should only be dealing with server errors at this point; client errors (bad requests) should be handled by the handler.
    result?.error
      ? res.status(500).json({ error: 'could not submit issue' })
      : res.status(200).json({
          success: true,
        })
  }

  /**
   * @description Attempts to update a single issue of the specified index, under the specified project. May only update title, text, assigned_to, status_text, and/or open properties of issues.
   * @param {object} req The Express request body.
   * @param {object} res The Express response body.
   */
  static async updateIssue(req, res) {
    const {
        body: issue,
        query: { index },
        params: { project: p },
      } = req,
      project = sanitize(p)
    sanitize(issue)
    issue.open = issue.open !== undefined
    let patchResult

    for (const prop of ['created_by', 'created_on', 'last_updated'])
      if (issue[prop] !== undefined)
        return res.status(400).json({
          error: `unexpected property ${prop} on issue update - this property cannot be updated`,
        })

    if (Object.keys(issue).length === 0)
      return res.status(400).json({
        error: 'no update fields passed - please include at least one field',
      })

    if (!IssueHandler.#validateIndex(index))
      return res
        .status(400)
        .json({ error: 'invalid index - please provide a whole number' })

    issue.last_updated = new Date().toLocaleDateString()
    patchResult = await IssuesDAO.updateIssue({ project, index }, issue)

    res.status(patchResult?.error ? 500 : 200).json(patchResult)
  }

  /**
   * @description Attempts to delete the specified issue of the specified project from the database.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async deleteIssue(req, res) {
    const { project: p } = req.params,
      { index } = req.body,
      project = sanitize(p)
    let deleteResult

    if (typeof project !== 'string' || project.length === 0)
      return res.status(400).json({
        error: 'please provide a valid project name',
      })

    if (!IssueHandler.#validateIndex(index))
      return res
        .status(400)
        .json({ error: 'please provide a whole number index' })

    deleteResult = await IssuesDAO.deleteIssue(project, +index)
    res.status(deleteResult?.error ? 500 : 200).json(deleteResult)
  }

  /**
   * @description Returns a new issue, with the last_updated property set to the current date. Assings the current date to created_on if that property is invalid.
   * @param {Issue} issue The issue to update.
   * @returns {Issue} A copy of the issue argument, with updated last_updated & created_on properties.
   * @impure Mutates the object argument.
   */
  static #updateIssueDates(issue) {
    const today = new Date().toLocaleDateString()

    if (!issue.created_on?.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/))
      issue.created_on = today
    issue.last_updated = today

    return issue
  }

  /**
   * @description Matches index against a numeric character regular expression.
   * @param {number|string} index
   * @returns {boolean}
   */
  static #validateIndex(index) {
    if (typeof index !== 'number' && typeof index !== 'string') return false

    return /^\d+$/.test(`${index}`)
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
