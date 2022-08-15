const { log } = console

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  server = require('../src/server.js'),
  [
    TEST_DOC_1,
    TEST_DOC_2,
    TEST_DOC_3,
    TEST_DOC_4,
    TEST_DOC_5,
  ] = require('./personal-library-test-docs.json'),
  { assert } = chai,
  BOOKS = '/api/books'

/**
 * @description Asserts that arguments passed are null.
 * @param {...any} vals Values to assert.
 */
assert.areNull = function (...vals) {
  for (const v of vals) assert.isNull(v)
}
/**
 * @description Asserts that arguments passed are strings.
 * @param  {...any} vals Values to assert.
 */
assert.areStrings = function (...vals) {
  for (const v of vals) assert.isString(v)
}
/**
 * @description Asserts that arguments passed are objects.
 * @param  {...any} vals Values to assert.
 */
assert.areObjects = function (...vals) {
  for (const v of vals) assert.isObject(v)
}
/**
 * @description Asserts that arguments passed are true booleans.
 * @param  {...any} vals Values to assert.
 */
assert.areTrue = function (...vals) {
  for (const v of vals) assert.isTrue(v)
}
/**
 * @description Asserts strict equality for both elements in each array passed.
 * @param  {...any} pairs Arrays containing values to compare.
 */
assert.strictEqualPairs = function (...pairs) {
  for (const [v1, v2] of pairs) assert.strictEqual(v1, v2)
}

chai.use(chaiHttp)

suite('🧪 \x1b[35mPersonal Library: HTTP', () => {
  suiteSetup(() => chai.request(server).delete(BOOKS))
  suiteSetup(() => chai.request(server).post(BOOKS).send(TEST_DOC_1))
  suiteSetup(() => chai.request(server).post(BOOKS).send(TEST_DOC_2))
  suiteSetup(() => chai.request(server).post(BOOKS).send(TEST_DOC_3))

  test(`1. GET ${BOOKS}, and POST ${BOOKS}/:_id`, done => {
    chai
      .request(server)
      .get(BOOKS)
      .end((err, res) => {
        const { status, ok, body: books } = res,
          { _id } = books?.[2]

        assert.isNull(err)
        assert.strictEqualPairs(
          [status, 200],
          [books.length, 3],
          [books[2].commentcount, 0]
        )
        assert.isTrue(ok)

        const test4Path = `${BOOKS}/${_id}`,
          test4Body = {
            comment: "don't know this book :/",
          }
        chai
          .request(server)
          .post(test4Path)
          .send(test4Body)
          .end((err, res) => {
            const {
              status,
              ok,
              body: { _id, title, commentcount, comments },
            } = res

            assert.isNull(err)
            assert.strictEqualPairs([status, 200], [commentcount, comments.length])
            assert.isTrue(ok)
            assert.areStrings(_id, title, ...comments)

            done()
          })
      })
  })

  test(`3. create a valid book: POST ${BOOKS}`, done => {
    chai
      .request(server)
      .post(BOOKS)
      .send(TEST_DOC_4)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { acknowledged, insertedId },
        } = res

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.areTrue(ok, acknowledged)
        assert.isString(insertedId)

        done()
      })
  })

  test(`4. create an invalid book: POST ${BOOKS}`, done => {
    chai
      .request(server)
      .post(BOOKS)
      .send(TEST_DOC_5)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { error },
        } = res

        assert.isNull(err)
        assert.strictEqual(status, 400)
        assert.isFalse(ok)
        assert.isString(error)

        done()
      })
  })
})
