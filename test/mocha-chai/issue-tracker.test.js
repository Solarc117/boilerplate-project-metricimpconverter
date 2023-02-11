// @ts-nocheck
'use strict'
require('dotenv').config()
const chaiHttp = require('chai-http'),
  chai = require('chai'),
  server = require('../../src/server.js'),
  assert = require('../modified-assert.js'),
  runHttpTest = require('../http-tester.js'),
  [
    TEST_DOC_1,
    TEST_DOC_2,
    TEST_DOC_3,
    TEST_DOC_4,
    TEST_DOC_5,
    TEST_DOC_6,
    TEST_DOC_7,
    TEST_DOC_8,
  ] = require('./json/issue-tracker-test-docs.json'),
  ISSUES_API = '/api/issues'
chai.use(chaiHttp)

before(async function () {
  const testDocs = [
      TEST_DOC_1,
      TEST_DOC_2,
      TEST_DOC_3,
      TEST_DOC_4,
      TEST_DOC_5,
      TEST_DOC_6,
      TEST_DOC_8,
    ],
    initialIssueDocumentIndexes = [0, 1, 2, 6]

  await chai.request(server).delete(ISSUES_API)
  for (const [index, { owner, project, issues }] of testDocs.entries()) {
    await chai
      .request(server)
      .post(`${ISSUES_API}/projects/${owner}/${project}`)
    if (!initialIssueDocumentIndexes.includes(index)) continue
    for (const issue of issues)
      await chai.request(server).post(`${ISSUES_API}/${project}`).send(issue)
  }
})

suite('🧪 Issue Tracker: HTTP\n', () => {
  let testNumber = 1

  for (const [project, issueCount] of [
    [TEST_DOC_1.project, 1],
    [TEST_DOC_2.project, 4],
    [TEST_DOC_3.project, 0],
    [TEST_DOC_8.project, 3],
  ]) {
    const path = `${ISSUES_API}/${project}`
    runHttpTest(
      `${testNumber++}. GET ${path}`,
      'get',
      path,
      ({ status, ok, body: issues }) => {
        assert.strictEqualPairs(
          [status, 200],
          [ok, true],
          [issues.length, issueCount]
        )
        assert.isArray(issues)
        for (const issue of issues)
          assert.strictEqual(Object.keys(issue).length, 8)
      }
    )
  }

  /** @type {{ description: string, method: HTTPMethod, api: string, asserter: object | Function, body: object  }[]} */
  const testDetails = [
    {
      description: 'Create with every field except _id',
      method: 'post',
      api: `${ISSUES_API}/${TEST_DOC_4.project}`,
      asserter: { status: 200, ok: true, body: { success: true } },
      body: TEST_DOC_4.issues[0],
    },
    {
      description: 'Create with only required fields',
      method: 'post',
      api: `${ISSUES_API}/${TEST_DOC_5.project}`,
      asserter: { status: 200, ok: true, body: { success: true } },
      body: TEST_DOC_5.issues[0],
    },
    {
      description: 'Create with missing required fields',
      method: 'post',
      api: `${ISSUES_API}/${TEST_DOC_6.project}`,
      asserter({ status, ok, body: { error } }) {
        assert.strictEqual(status, 400)
        assert.isFalse(ok)
        assert.isString(error)
      },
      body: {},
    },
    {
      description: 'Include _id field in project (should be ignored)',
      method: 'post',
      api: `${ISSUES_API}/projects/${TEST_DOC_7.owner}/${TEST_DOC_7.project}`,
      asserter({ status, ok, body: { acknowledged, insertedId } }) {
        assert.strictEqual(status, 200)
        assert.areTrue(ok, acknowledged)
        assert.isString(insertedId)
      },
      body: TEST_DOC_7,
    },
    {
      description: 'View issues with one filter',
      method: 'get',
      api: `${ISSUES_API}/${TEST_DOC_2.project}?assigned_to=117`,
      asserter({ status, ok, body: issues }) {
        assert.strictEqualPairs([status, 200], [issues.length, 3])
        assert.isTrue(ok)
        for (const { title, assigned_to, open } of issues) {
          assert.areStrings(title)
          assert.isTrue(title.length > 0)
          assert.strictEqual(assigned_to, 'solarc117')
          assert.isBoolean(open)
        }
      },
    },
    {
      description: 'View issues with multiple filters',
      method: 'get',
      api: `${ISSUES_API}/${TEST_DOC_2.project}?title=podcast&assigned_to=sol`,
      asserter({ status, ok, body: issues }) {
        const { title, text, assigned_to } = issues[0]

        assert.strictEqualPairs([status, 200], [ok, true], [issues.length, 1])
        assert.areStrings(title, text, assigned_to)
        assert.areTrue(
          title.length > 0,
          text.length > 0,
          assigned_to.length > 0
        )
      },
    },
    {
      description: 'Update one field on an issue',
      method: 'patch',
      api: `${ISSUES_API}/${TEST_DOC_1.project}?index=0`,
      asserter({ status, ok, body: { acknowledged, modifiedCount } }) {
        assert.strictEqualPairs([status, 200], [modifiedCount, 1])
        assert.areTrue(ok, acknowledged)
      },
      body: {
        assigned_to: TEST_DOC_1.owner,
      },
    },
    {
      description: 'Update multiple fields',
      method: 'patch',
      api: `${ISSUES_API}/${TEST_DOC_2.project}?index=2`,
      asserter({ status, ok, body: { acknowledged, modifiedCount } }) {
        assert.strictEqualPairs([status, 200], [modifiedCount, 1])
        assert.areTrue(ok, acknowledged)
      },
      body: {
        status_text: 'finished',
        open: false,
      },
    },
    {
      description: 'Update with no fields',
      method: 'patch',
      api: `${ISSUES_API}/${TEST_DOC_8.project}?index=0`,
      asserter({ status, ok, body: { error } }) {
        assert.strictEqual(status, 400)
        assert.isFalse(ok)
        assert.isString(error)
      },
    },
    {
      description: '',
      method: 'delete',
      api: `${ISSUES_API}/${TEST_DOC_8.project}?index=1`,
      asserter({ status, ok, body: { acknowledged, modifiedCount } }) {
        assert.strictEqualPairs([status, 200], [modifiedCount, 1])
        assert.areTrue(ok, acknowledged)
      },
    },
  ]
  for (const { description, method, api, asserter, body } of testDetails)
    runHttpTest(
      `${testNumber++}. ${description}: ${method.toUpperCase()} ${api}`,
      method,
      api,
      asserter,
      body
    )
})

/**
 * @typedef Issue The element structure maintained in the database issues arrays.
 * @property {string} title The title of the issue.
 * @property {string} created_by The user that created the issue.
 * @property {string} text Text describing in further detail the issue.
 * @property {string} assigned_to The user responsible for addressing the issue.
 * @property {string} status_text Brief describtion the current state of the issue.
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

/**
 * @typedef {'get' | 'put' | 'post' | 'patch' | 'delete' | 'head' | 'connect' | 'options' | 'trace'} HTTPMethod
 */
