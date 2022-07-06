'use strict'
const { assert } = console

const IssuesDAO = require('../dao/issues-dao.js')

module.exports = class IssueHandler {
  /**
   * @description Invokes the IssuesDAO putDocument method, with the request body as an argument. For testing purposes.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   * @param {Function} next The Express function to invoke the next middleware.
   */
  static async putDocumentRequest(req, res) {
    const { body: doc } = req,
      // Do not require a trycatch block for the following asynchronous method, because it itself will handle errors returned by the db.
      putResult = await IssuesDAO.putDocument(doc)

    res.status(putResult.error ? 500 : 200).json(putResult)
  }

  /**
   * @description Invokes the IssuesDAO getOwner method, and sends the result to the client.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async getDocumentRequest(req, res) {
    const { body: query } = req,
      getResult = await IssuesDAO.getDocument(query)

    res.status(getResult.error ? 500 : 200).json(getResult)
  }
}
