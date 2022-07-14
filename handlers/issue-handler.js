'use strict'
const { log } = console

const IssuesDAO = require('../dao/issues-dao.js')

module.exports = class IssueHandler {
  /**
   * @description Calls the IssuesDAO dropTest method, and sends json to the client depicting the result.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async dropTestRequest(req, res) {
    const dropResult = await IssuesDAO.dropTest()

    res.status(dropResult?.error ? 500 : 200).json(dropResult)
  }

  /**
   * @description Invokes the IssuesDAO putProject method, with the request body as an argument, and responds with the result. For testing purposes.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   * @param {Function} next The Express function to invoke the next middleware.
   */
  static async putProjectRequest(req, res) {
    const { body: project } = req,
      // Do not require a trycatch block for the following asynchronous method, because it itself will handle errors returned by the db.
      putResult = await IssuesDAO.putProject(project)

    res.status(putResult?.error ? 500 : 200).json(putResult)
  }

  /**
   * @description Invokes the IssuesDAO getProject method, and responds with the result.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async getProjectRequest(req, res) {
    const {
        params: { project },
      } = req,
      getResult = await IssuesDAO.getProject(project)

    res.status(getResult?.error ? 500 : 200).json(getResult)
  }

  /**
   * @description Invokes the IssuesDAO postProject method, and responds with the result.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async postProjectRequest(req, res) {
    const { body: project } = req,
      postResult = await IssuesDAO.postProject(project)

    res.status(postResult?.error ? 500 : 200).json(postResult)
  }
}
