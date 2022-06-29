'use strict'

const chaiHttp = require('chai-http'),
  { ObjectId } = require('mongodb'),
  chai = require('chai'),
  server = require('../server.js'),
  { assert } = chai,
  ISSUES_PATH = '/api/issues/solarc117/issue-tracker-test'

chai.use(chaiHttp)

suite('🧪 Issue Tracker', () => {
  suiteSetup(done => {
    chai
      .request(server)
      .put(ISSUES_PATH)
      .send({
        _id: new ObjectId(1),
        owner: 'solarc117',
        projects: [
          {
            name: 'issue-tracker-test',
            issues: [
              {
                title: 'test-issue',
                text: 'this is a test issue',
                created_by: 'solarc117',
                assigned_to: null,
                status_text: null,
              },
            ],
          },
        ],
      })
      .end(done)
  })

  test('Correct setup document', done => {
    chai
      .request(server)
      .get(ISSUES_PATH)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { targetOwner },
        } = res

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.isNotNull(targetOwner)

        done()
      })
  })

  test('1. GET /api/issues/:owner/:project', done => {
    chai
      .request(server)
      .get(ISSUES_PATH)
      .end((err, res) => {
        const { status, ok, body } = res

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        // assert.strictEqual(body, EXPECTED_BODY)
        done()
      })
  })

  // test('2. Create an issue with only required fields: POST /api/issues/{project}', done => {
  //   const _id = new ObjectId().toString()

  //   chai
  //     .request(server)
  //     // Need to encode spaces w/%20
  //     .post(`${ISSUES_PATH}&title=test%20issue%20#${_id}`)
  //     .end((err, res) => {
  //       const { status, ok, body } = res

  //       assert.strictEqual(status, 200)
  //       assert.isTrue(ok)
  //       // assert.strictEqual(body, EXPECTED_BODY)
  //     })
  // })
})
