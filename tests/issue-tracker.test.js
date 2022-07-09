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
          { issues, owner, name, _id } = body

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        for (const elem of [_id, owner, name]) assert.isString(elem)
        assert.isArray(issues)
        assert.isObject(issues[0])
        assert.strictEqual(Object.keys(issues[0]).length, 5)

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
        for (const elem of [_id, owner, name]) assert.isString(elem)
        assert.strictEqual(issues.length, 2)
        for (const issue of issues) assert.isObject(issue)

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
        for (const elem of [_id, owner, name]) assert.isString(elem)
        assert.isArray(issues)
        assert.strictEqual(issues.length, 0)

        done()
      })
  })

  test(`1. GET ${ISSUES}/${TEST_DOC1.name}`, done => {
    /*
    {
  _id: null,
  issues: [
    {
      title: 'dysfunctional timer',
      text: 'timer does not proceed after first focus session',
      created_by: 'pom0doro_user',
      assigned_to: null,
      status_text: null
    }
  ],
  name: 'jsPomodoro',
  owner: 'cool_user_33'
}
    */
    chai
      .request(server)
      .get(`${ISSUES}/${TEST_DOC1.name}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { issues, owner, name, _id } = body,
          { title, text, created_by, assigned_to, status_text } = issues[0]

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)

        assert.isNull(_id)
        for (const prop of [owner, name, title, text, created_by])
          assert.isString(prop)
        for (const prop of [_id, assigned_to, status_text]) assert.isNull(prop)

        done()
      })
  })

  // test(`2. POST ${ISSUES}/${TEST_DOC1.name} (every field)`, done => {
  //   chai
  //     .request(server)
  //     .post(`${ISSUES}/${TEST_DOC1.name}`)
  //     .send()
  //     .end((err, res) => {
  //       const { status, ok, body } = res

  //       assert.isNull(err)
  //       assert.strictEqual(status, 200)
  //       assert.isTrue(ok)
  //       assert.isObject(body)

  //       done()
  //     })
  // })
})
