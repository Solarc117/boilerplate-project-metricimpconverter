const chai = require('chai'),
  chaiHttp = require('chai-http'),
  server = require('../src/server.js'),
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
  test(`1. GET ${BOOKS}`, done => {
    chai.request(server).get(BOOKS).end((err, res) => {
      const { status, ok, body } = res
      
      assert.isNull(err)
      assert.strictEqual(status, 200)
      assert.isTrue(ok)
      assert.isAtLeast(Array.isArray(body) ? body.length : Object.keys(body).length, 1)

      done()
    })
  })
})
