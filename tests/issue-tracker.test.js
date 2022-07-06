'use strict'

const chaiHttp = require('chai-http'),
  { ObjectId } = require('mongodb'),
  chai = require('chai'),
  server = require('../server.js'),
  { assert } = chai,
  TEST_PATH = '/api/issues/test%20owner/test%20project'

chai.use(chaiHttp)

suite('🧪\x1b[34mIssue Tracker: HTTP', () => {
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

  test('Successful suite setup', done => {
    chai
      .request(server)
      .get(TEST_PATH)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { _events, _eventsCount },
        } = res

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.isObject(_events)
        assert.isNumber(_eventsCount)

        done()
      })
  })

  test(`1. GET ${TEST_PATH}`, done => {
    chai
      .request(server)
      .get(TEST_PATH)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { _events, _eventsCount },
        } = res

        assert.isNull(err)
        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.isObject(_events)
        assert.isNumber(_eventsCount)

        done()
      })
  })
})
