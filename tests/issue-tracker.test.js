'use strict'

const chaiHttp = require('chai-http'),
  { ObjectId } = require('mongodb'),
  chai = require('chai'),
  server = require('../server.js'),
  { assert } = chai,
  TEST_PATH = '/api/issues/test%20owner/test%20project'

chai.use(chaiHttp)

suite('🧪 Issue Tracker', () => {
  suiteSetup(done => {
    const testDocument = {
      _id: new ObjectId('0000000197d9af3844c5dc90'),
      owner: 'test owner',
      project_issues: {
        'test project': [
          {
            title: 'test issue',
            text: 'this is a test issue',
            created_by: 'test owner',
            assigned_to: null,
            status_text: null,
          },
        ],
      },
    }

    chai.request(server).put(TEST_PATH).send(testDocument).end(done)
  })

  test('Correct setup document', done => {
    chai
      .request(server)
      .get(`${TEST_PATH}`)
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
      .get(TEST_PATH)
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
