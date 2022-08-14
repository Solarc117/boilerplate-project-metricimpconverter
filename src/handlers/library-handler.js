'use strict'
const { log, error } = console

const { ObjectId } = require('mongodb'),
  LibraryDAO = require('../dao/library-dao.js')

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
  static async createBook(req, res) {
    const { body: book } = req,
      { title } = book

    if (typeof title !== 'string')
      return res.status(400).json({ error: 'missing title field' })

    if (title.trim().length === 0)
      return res.status(400).json({
        error: `invalid book title ${title} - must have at least one non-whitespace character`,
      })

    if (!Array.isArray(book.comments)) {
      book.comments = []
      book.commentscount = 0
    }

    book.commentscount = book.comments.length

    const result = await LibraryDAO.postBook(book)

    res.status(result?.error ? 500 : 200).json(result)
  }

  /**
   * @description Adds a comment to the book with the passed _id.
   * @param {object} req The Express request object.
   * @param {object} res The Express response object.
   */
  static async addComment(req, res) {
    const {
      body: { id, comment },
    } = req

    log(req.body)

    log(id, comment)
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