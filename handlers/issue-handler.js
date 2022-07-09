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
    log(dropResult)

    res.status(dropResult?.error ? 500 : 200).json(dropResult)
  }

  /**
   * @description Invokes the IssuesDAO putDocument method, with the request body as an argument. For testing purposes.
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
   * @description Invokes the IssuesDAO getOwner method, and sends the result to the client.
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
}
