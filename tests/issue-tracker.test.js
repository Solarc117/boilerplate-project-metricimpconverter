'use strict'
const { log } = console
function now() {
  return new Date().toUTCString()
}
const chaiHttp = require('chai-http'),
  chai = require('chai'),
  server = require('../server.js'),
  { assert } = chai,
  TEST_DOC1 = {
    name: 'jsPomodoro',
    owner: 'cool_user_33',
    issues: [
      {
        title: 'dysfunctional timer',
        text: 'timer does not proceed after first focus session',
        created_by: 'pom0doro_user',
        assigned_to: null,
        status_text: null,
      },
    ],
  },
  TEST_DOC2 = {
    name: 'huberman_lab_transcripts',
    owner: 'solarc117',
    issues: [
      {
        title: 'podcast 37 missing',
        text: 'solarc please add the transcripts from episode 37',
        created_by: 'keenLearner139',
        assigned_to: 'solarc117',
        status_text: null,
      },
      {
        title: 'episode 22 typos',
        text: "i've read this episode for 10s and already found 30 typos, someone please fix",
        created_by: 'abg112',
        assigned_to: null,
        status_text: null,
      },
      {
        title: 'episode 1 typo',
        text: 'there is a typo on the transcript of episode 1',
        created_by: 'solarc117',
        assigned_to: 'solarc117',
        status_text: 'processing',
      },
      {
        title: 'inaccuracy in episode 30',
        text: 'in the second chapter, Dr. Huberman makes an inaccurate statement. We should note this in the transcript',
        created_by: 'coder-coder',
        assigned_to: 'solarc117',
        status_text: null,
      },
    ],
  },
  TEST_DOC3 = {
    name: 'python-algs',
    owner: 'fcc_learner_:)',
    issues: [],
  },
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
  suiteSetup(() => chai.request(server).delete(ISSUES))
  const setup1Path = `${ISSUES}/${TEST_DOC1.name}`,
    setup2Path = `${ISSUES}/${TEST_DOC2.name}`,
    setup3Path = `${ISSUES}/${TEST_DOC3.name}`
  suiteSetup(() => chai.request(server).put(setup1Path).send(TEST_DOC1))
  suiteSetup(() => chai.request(server).put(setup2Path).send(TEST_DOC2))
  suiteSetup(() => chai.request(server).put(setup3Path).send(TEST_DOC3))

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

  const test1Path = `${ISSUES}/${TEST_DOC1.name}`
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

  const user = 'johnny123',
    newProject = {
      name: 'cpp-chess',
      owner: user,
      issues: [
        {
          title: "knight doesn't jump over other pieces",
          created_by: user,
          text: 'the knight is unable to jump over pawns at the beginning of a game',
          assigned_to: 'anyone',
          status_text: 'under development',
        },
      ],
    },
    test2Path = `${ISSUES}/${newProject.name}`
  test(`2. create with every field except _id: POST ${test2Path}`, done => {
    chai
      .request(server)
      .post(test2Path)
      .send(newProject)
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

  const user2 = 'frank_ocean_fan',
    newProject2 = {
      name: 'blonde-track-list',
      owner: user2,
      issues: [
        {
          title: 'missing lyrics for "Nikes" track',
          created_by: user2,
        },
      ],
    },
    test3Path = `${ISSUES}/${newProject2.name}`
  test(`3. create with only required fields: POST ${test3Path}`, done => {
    chai
      .request(server)
      .post(test3Path)
      .send(newProject2)
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

  const newProject4 = {
      name: 'react-calculator',
      issues: [],
    },
    test4Path = `${ISSUES}/${newProject4.name}`
  test(`4. create with missing required fields: POST ${test4Path}`, done => {
    chai
      .request(server)
      .post(test4Path)
      .send(newProject4)
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

  const user5 = 'random_coder',
    newProject5 = {
      _id: 123456,
      name: 'js website',
      owner: user5,
      issues: [],
    },
    test5Path = `${ISSUES}/${newProject5.name}`
  test(`5. include _id: POST ${test5Path}`, done => {
    chai
      .request(server)
      .post(test5Path)
      .send(newProject5)
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

  const test6Path = `${ISSUES}/${TEST_DOC1.name}`
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
          } = issue

        assert.areNull(err, assigned_to, status_text)
        assert.strictEqualPairs(
          [status, 200],
          [issues.length, 1],
          [Object.keys(issue).length, 7]
        )
        assert.isTrue(ok)
        assert.areStrings(created_by, created_on, last_updated, text, title)

        done()
      })
  })

  const test7Params = '?assigned_to',
    test7Path = `${ISSUES}/${TEST_DOC2.name}${test7Params}`
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
    test8Path = `${ISSUES}/${TEST_DOC2.name}${test8Params}`
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

  const test9Path = `${ISSUES}/${TEST_DOC1.name}`
  test(`9. update one field: PATCH ${test9Path}`, done => {
    const updateObj = {
      _id: TEST_DOC1._id,
    }
    done()
    // chai.request(server).patch(test8Path).send()
  })
})

/**
 * @typedef Issue The element structure maintained in the database issues arrays.
 * @property {string} title The title of the issue.
 * @property {string} created_by The user that created the issue.
 * .
 * @property {string} [text] Text describing in further detail the issue.
 * @property {string | null} [assigned_to] The user responsible for addressing the issue.
 * @property {string | null} [status_text] Brief describtion the current state of the issue.
 * @property {string} created_on The date the issue was created, in UTC.
 * @property {string} last_updated The date the issue was last updated, in UTC.
 */

/**
 * @typedef Project The document structure in the database projects collection.
 * @property {string} _id The project's unique identifier.
 * @property {string} name The project's name.
 * @property {string} owner The project owner.
 * @property {[Issue]} issues An array containing
 */
