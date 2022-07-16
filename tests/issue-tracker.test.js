'use strict'

const chaiHttp = require('chai-http'),
  { ObjectId } = require('mongodb'),
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
    _id: '12345',
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
    ],
  },
  TEST_DOC3 = {
    _id: new ObjectId('0000000197d9af3844c5dc92'),
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
assert.strictEqualities = function (...pairs) {
  for (const [v1, v2] of pairs) assert.strictEqual(v1, v2)
}

chai.use(chaiHttp)

suite('🧪\x1b[34mIssue Tracker: HTTP', () => {
  suiteSetup(() => chai.request(server).delete(ISSUES))
  suiteSetup(() =>
    chai.request(server).put(`${ISSUES}/${TEST_DOC1.name}`).send(TEST_DOC1)
  )
  suiteSetup(() =>
    chai.request(server).put(`${ISSUES}/${TEST_DOC2.name}`).send(TEST_DOC2)
  )
  suiteSetup(() =>
    chai.request(server).put(`${ISSUES}/${TEST_DOC3.name}`).send(TEST_DOC3)
  )

  test('suite setup 1 successful', done => {
    chai
      .request(server)
      .get(`${ISSUES}/${TEST_DOC1.name}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { issues, owner, _id } = body,
          { title, assigned_to } = issues[0]

        assert.areNull(err, _id, assigned_to)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.areStrings(owner, title)

        done()
      })
  })
  test('suite setup 2 successful', done => {
    chai
      .request(server)
      .get(`${ISSUES}/${TEST_DOC2.name}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { issues, owner, name, _id } = body

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.areStrings(_id, owner, name)
        assert.strictEqual(issues.length, 2)
        assert.areObjects(...issues)

        done()
      })
  })
  test('suite setup 3 successful', done => {
    chai
      .request(server)
      .get(`${ISSUES}/${TEST_DOC3.name}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { issues, owner, name, _id } = body

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.areStrings(_id, owner, name)
        assert.isArray(issues)
        assert.strictEqual(issues.length, 0)

        done()
      })
  })

  const test1Path = `${ISSUES}/${TEST_DOC1.name}`
  test(`1. GET ${test1Path}`, done => {
    chai
      .request(server)
      .get(test1Path)
      .end((err, res) => {
        const { status, ok, body } = res,
          { issues, owner, name, _id } = body,
          { title, text, created_by, assigned_to, status_text } = issues[0]

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)

        assert.isNull(_id)
        assert.areStrings(owner, name, title, text, created_by)
        assert.areNull(_id, assigned_to, status_text)

        done()
      })
  })

  const newId = new ObjectId(),
    user = 'johnny123',
    newProject = {
      _id: newId,
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
  test(`2. POST ${test2Path} (every field)`, done => {
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
        assert.strictEqual(insertedId, newId.toString())

        done()
      })
  })

  const newId2 = new ObjectId(),
    user2 = 'frank_ocean_fan',
    newProject2 = {
      _id: newId2,
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
  test(`3. POST /api/issues/${test3Path} (only required fields)`, done => {
    chai
      .request(server)
      .post(test3Path)
      .send(newProject2)
      .end(() =>
        chai
          .request(server)
          .get(test3Path)
          .end((err, res) => {
            const { status, ok, body } = res,
              { _id, name, owner, issues } = body,
              { title, created_by, text, assigned_to, status_text } = issues[0]

            assert.areNull(err, text, assigned_to, status_text)
            assert.strictEqualities([status, 200], [_id, newId2.toString()])
            assert.isTrue(ok)
            assert.areStrings(name, owner, title, created_by)

            done()
          })
      )
  })
})

/**
 * @typedef Issue The element structure maintained in the database issues arrays.
 * @property {string} title The title of the issue.
 * @property {string} created_by The user that created the issue.
 * @property {string} [text] Text describing in further detail the issue.
 * @property {string | null} [assigned_to] The user responsible for addressing the issue.
 * @property {string | null} [status_text] Brief describtion the current state of the issue.
 */

/**
 * @typedef Project The document structure in the database projects collection.
 * @property {string} _id The project's unique identifier.
 * @property {string} name The project's name.
 * @property {string} owner The project owner.
 * @property {[Issue]} issues An array containing
 */
