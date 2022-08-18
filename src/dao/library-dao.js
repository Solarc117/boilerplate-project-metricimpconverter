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
   * @async
   * @returns {object | Array} The result of the find operation.
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
   * @async
   * @param {Book} book The book to post.
   * @returns {object} The result of the insert operation.
   */
  static async insertBook(book) {
    let postBookResult

    try {
      postBookResult = await db.insertOne(book)
    } catch (err) {
      error('\x1b[31m', err)
      return { error: err.message }
    }

    return { _id: postBookResult.insertedId, title: book.title }
  }

  /**
   * @description Attempts to fetch a single book document from the connected collection, using its _id.
   * @param {string} _id The id of the book to fetch.
   * @async
   * @returns {object} The book document, or an empty object if no document was found.
   */
  static async getBookById(_id) {
    const query = {
      _id: new ObjectId(_id),
    }
    let result

    try {
      result = await db.findOne(query)
    } catch (err) {
      error('\x1b[31m', err)
      return { error: err.message }
    }

    return result === null ? {} : result
  }

  /**
   * @description Appends the passed comment to the comments array of the book with the passed id, and increments commentcount.
   * @async
   * @param {string} _id The id of the book to append to.
   * @param {string} comment The comment to append.
   * @returns {object} The result of the update operation.
   */
  static async appendComment(_id, comment) {
    const query = { _id: new ObjectId(_id) },
      update = {
        $push: {
          comments: comment,
        },
        $inc: {
          commentcount: 1,
        },
      },
      options = {
        returnDocument: 'after',
      }
    let updateResult

    try {
      updateResult = await db.findOneAndUpdate(query, update, options)
    } catch (err) {
      error('\x1b[31m', err)
      return { error: err.message }
    }

    return updateResult
  }

  /**
   * @description Attempts to delete a single book from the database using its _id.
   * @async
   * @param {string} _id The _id of the book to delete.
   * @returns {object} The result of the delete operation.
   */
  static async deleteSingle(_id) {
    const query = { _id: new ObjectId(_id) }
    let result

    try {
      result = await db.deleteOne(query)
    } catch (err) {
      error('\x1b[31m', err)
      return { error: err.message }
    }

    return result
  }

  /**
   * @description Drops the currently connected collection.
   * @async
   * @returns {object | boolean} The result of the drop operation, or an object containing an error property in the case of a server error.
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
 * @property {number} commentcount An Integer.
 * @property {[string]} comments An array containing comment strings.
 */
