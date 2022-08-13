'use strict'
const { log, error } = console

const LibraryDAO = require('../dao/library-dao.js')

module.exports = class LibraryHandler {
  /**
   * @description Fetches all books.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async get(req, res) {
    const result = await LibraryDAO.getBooks()

    res.status(result?.error ? 500 : 200).json(result)
  }

  /**
   * @description Attempts to post the received resources to the database.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async post(req, res) {
    const { body: book } = req,
      result = await LibraryDAO.postBook(book)

    res.status(result?.error ? 500 : 200).json(result)
  }
  
  /**
   * @description Deletes all books.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async delete(req, res) {
    const result = await LibraryDAO.deleteAll()
    
    res.status(result?.error ? 500 : 200).json(result)
  }
}
