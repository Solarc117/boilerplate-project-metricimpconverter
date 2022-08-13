'use strict'
const { log, error } = console

const { ObjectId } = require('mongodb'),
  { env } = process,
  COLLECTION = env.NODE_ENV === 'dev' ? 'test' : 'books'

let db

module.exports = class LibraryDAO {
  /**
   * @description Impure; attempts to assign the "issue-tracker" db's "owners" collection to the global "owners" variable, if the global variable is undefined; logs a message if a connection is already established.
   * @async
   * @param {object} client The MongoDB project under which the personal-library database and test/books collections are located.
   */
  static async injectDB(client) {
    if (db)
      return log(
        `connection to ${COLLECTION} collection previously established`
      )

    try {
      db = await client.db('personal-library').collection(COLLECTION)
    } catch (err) {
      error(
        `\x1b[31m\nunable to establish a collection handle in LibraryDAO:`,
        err
      )
    }

    log(`\x1b[32m\n📚 LibraryDAO connected to ${COLLECTION} collection`)
  }

  /**
   * @description Attemps to fetch all books from the current collection.
   * @returns {object | null} The result of the find operation.
   */
  static async getBooks() {
    let cursor

    try {
      cursor = await db.find()
    } catch (err) {
      error('\x1b[31m', err)
      return { error: err.message }
    }

    const books = await cursor.toArray()

    return books
  }

  /**
   * @description Attempts to post the received book to the currently connected collection.
   * @param {Book} book The book to post.
   */
  static async postBook(book) {
    let postBookResult

    try {
      postBookResult = await db.insertOne(book)
    } catch (err) {
      error('\x1b[31m', err)
      return { error: err.message }
    }

    return postBookResult
  }

  /**
   * @description Drops the currently connected collection.
   */
  static async deleteAll() {
    let dropResult

    try {
      dropResult = await db.drop()
    } catch (err) {
      error('\x1b[31m', err)
      return { error: err.message }
    }

    return dropResult
  }
}

/**
 * @typedef Book
 * @property {ObjectId} _id
 * @property {string} title
 * @property {number} commentscount An Integer.
 * @property {[string]} comments An array containing comment strings.
 */
