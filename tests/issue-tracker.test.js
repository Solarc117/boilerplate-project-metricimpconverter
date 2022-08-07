'use strict'
const { log } = console

const chaiHttp = require('chai-http'),
  chai = require('chai'),
  server = require('../server.js'),
  { assert } = chai,
  {
    TEST_DOC_1,
    TEST_DOC_2,
    TEST_DOC_3,
    TEST_DOC_4,
    TEST_DOC_5,
    TEST_DOC_6,
    TEST_DOC_7,
    TEST_DOC_8,
  } = require('../tests/issue-tracker-test-docs.json'),
  ISSUES = '/api/issues'

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

suite('🧪 \x1b[34mIssue Tracker: HTTP', () => {
  const setup1Path = `${ISSUES}/${TEST_DOC_1.project}`,
    setup2Path = `${ISSUES}/${TEST_DOC_2.project}`,
    setup3Path = `${ISSUES}/${TEST_DOC_3.project}`
  suiteSetup(() => chai.request(server).delete(ISSUES))
  suiteSetup(() => chai.request(server).put(setup1Path).send(TEST_DOC_1))
  suiteSetup(() => chai.request(server).put(setup2Path).send(TEST_DOC_2))
  suiteSetup(() => chai.request(server).put(setup3Path).send(TEST_DOC_3))

  test('suite setup 1 successful', done => {
    chai
      .request(server)
      .get(setup1Path)
      .end((err, res) => {
        const { status, ok, body: issues } = res,
          { title, assigned_to } = issues[0]

        assert.areNull(err, assigned_to)
        assert.strictEqualPairs([status, 200], [issues.length, 1])
        assert.isArray(issues)
        assert.areObjects(...issues)
        assert.isTrue(ok)
        assert.isString(title)

        done()
      })
  })

  test('suite setup 2 successful', done => {
    chai
      .request(server)
      .get(setup2Path)
      .end((err, res) => {
        const { status, ok, body: issues } = res

        assert.isNull(err)
        assert.strictEqualPairs([status, 200], [issues.length, 4])
        assert.isTrue(ok)
        assert.isArray(issues)
        assert.areObjects(...issues)

        done()
      })
  })

  test('suite setup 3 successful', done => {
    chai
      .request(server)
      .get(setup3Path)
      .end((err, res) => {
        const { status, ok, body: issues } = res

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.isArray(issues)
        assert.strictEqual(issues.length, 0)
        assert.areObjects(...issues)

        done()
      })
  })

  const test1Path = `${ISSUES}/${TEST_DOC_1.project}`
  test(`1. GET ${test1Path}`, done => {
    chai
      .request(server)
      .get(test1Path)
      .end((err, res) => {
        const { status, ok, body: issues } = res,
          { title, text, created_by, assigned_to, status_text } = issues[0]

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.areStrings(title, text, created_by)
        assert.areNull(assigned_to, status_text)

        done()
      })
  })

  const test2Path = `${ISSUES}/${TEST_DOC_4.project}`
  test(`2. create with every field except _id: POST ${test2Path}`, done => {
    chai
      .request(server)
      .post(test2Path)
      .send(TEST_DOC_4)
      .end((err, res) => {
        const { status, ok, body } = res,
          { acknowledged, insertedId } = body

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.areTrue(ok, acknowledged)
        assert.isString(insertedId)

        done()
      })
  })

  const test3Path = `${ISSUES}/${TEST_DOC_5.project}`
  test(`3. create with only required fields: POST ${test3Path}`, done => {
    chai
      .request(server)
      .post(test3Path)
      .send(TEST_DOC_5)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { acknowledged, insertedId },
        } = res

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok, acknowledged)
        assert.isString(insertedId)

        done()
      })
  })

  const test4Path = `${ISSUES}/${TEST_DOC_6.project}`
  test(`4. create with missing required fields: POST ${test4Path}`, done => {
    chai
      .request(server)
      .post(test4Path)
      .send(TEST_DOC_6)
      .end((err, res) => {
        const { status, ok, body } = res,
          { error } = body

        assert.isNull(err)
        assert.strictEqual(status, 400)
        assert.isFalse(ok)
        assert.isString(error)

        done()
      })
  })

  const test5Path = `${ISSUES}/${TEST_DOC_7.project}`
  test(`5. include _id: POST ${test5Path}`, done => {
    chai
      .request(server)
      .post(test5Path)
      .send(TEST_DOC_7)
      .end((err, res) => {
        const { status, ok, body } = res,
          { error } = body

        assert.isNull(err)
        assert.strictEqual(status, 400)
        assert.isFalse(ok)
        assert.isString(error)
        assert.include(error, '_id')

        done()
      })
  })

  const test6Path = `${ISSUES}/${TEST_DOC_1.project}`
  test(`6. GET ${test6Path}`, done => {
    chai
      .request(server)
      .get(test6Path)
      .end((err, res) => {
        const { status, ok, body: issues } = res,
          issue = issues[0],
          {
            assigned_to,
            created_by,
            created_on,
            last_updated,
            status_text,
            text,
            title,
            open,
            index,
          } = issue

        assert.areNull(err, assigned_to, status_text)
        assert.strictEqualPairs(
          [status, 200],
          [issues.length, 1],
          [Object.keys(issue).length, 9],
          [index, 0]
        )
        assert.areTrue(ok, open)
        assert.areStrings(created_by, created_on, last_updated, text, title)

        done()
      })
  })

  const test7Params = '?assigned_to',
    test7Path = `${ISSUES}/${TEST_DOC_2.project}${test7Params}`
  test(`7. view issues with one filter: GET ${test7Path}`, done => {
    chai
      .request(server)
      .get(test7Path)
      .end((err, res) => {
        const { status, ok, body: issues } = res,
          {
            title,
            text,
            created_by,
            created_on,
            last_updated,
            assigned_to,
            status_text,
          } = issues[0]

        assert.areNull(err, assigned_to, status_text)
        assert.strictEqualPairs([status, 200], [issues.length, 1])
        assert.isTrue(ok)
        assert.areStrings(title, text, created_by, created_on, last_updated)

        done()
      })
  })

  const test8Params = '?title=podcast&assigned_to=sol',
    test8Path = `${ISSUES}/${TEST_DOC_2.project}${test8Params}`
  test(`8. view issues with multiple filters: GET ${test8Path}`, done => {
    chai
      .request(server)
      .get(test8Path)
      .end((err, res) => {
        // I might want to consider using optional chaining, if destructuring from an undefined value causes my site to crash - ex:
        // issue = issues?.[0]
        // assert.isNull(issue?.status_text)
        const { status, ok, body: issues } = res,
          { title, text, created_by, assigned_to, status_text } = issues[0]

        assert.areNull(err, status_text)
        assert.strictEqualPairs([status, 200], [issues.length, 1])
        assert.isTrue(ok)
        assert.isArray(issues)
        assert.areStrings(title, text, created_by, assigned_to)

        done()
      })
  })

  const test9Params = '?index=0',
    test9Path = `${ISSUES}/${TEST_DOC_1.project}${test9Params}`
  test(`9. update one field on an issue: PATCH ${test9Path}`, done => {
    const fieldsToUpdate = {
      assigned_to: TEST_DOC_1.owner,
    }

    chai
      .request(server)
      .patch(test9Path)
      .send(fieldsToUpdate)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { acknowledged, modifiedCount },
        } = res

        assert.isNull(err)
        assert.strictEqualPairs([status, 200], [modifiedCount, 1])
        assert.areTrue(ok, acknowledged)

        done()
      })
  })

  const test10Params = '?index=2',
    test10Path = `${ISSUES}/${TEST_DOC_2.project}${test10Params}`
  test(`10. Update multiple fields: PATCH ${test10Path}`, done => {
    const fieldsToUpdate = {
      status_text: 'finished',
      open: false,
    }

    chai
      .request(server)
      .patch(test10Path)
      .send(fieldsToUpdate)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { acknowledged, modifiedCount },
        } = res

        assert.isNull(err)
        assert.strictEqualPairs([status, 200], [modifiedCount, 1])
        assert.areTrue(ok, acknowledged)

        done()
      })
  })

  const test11Params = '?index=0',
    test11Path = `${ISSUES}/${TEST_DOC_8.project}${test11Params}`
  test(`11. Update with no fields: PATCH ${test11Path}`, done => {
    chai
      .request(server)
      .patch(test11Path)
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

/**
 * @typedef Issue The element structure maintained in the database issues arrays.
 * @property {number} index A number unique to the issue (within its parent project).
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
