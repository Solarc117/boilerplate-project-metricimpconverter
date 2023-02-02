'use strict'
require('dotenv').config()
const chaiHttp = require('chai-http'),
  chai = require('chai'),
  server = require('../src/server.js'),
  assert = require('./modified-assert.js'),
  americanBritishSentences = require('./json/american-british-sentences.json'),
  TRANSLATOR_API = '/api/translate'
chai.use(chaiHttp)

suite('🧪 American/British Translator: HTTP', () => {
  /**
   * @description Semantic sugar for chai HTTP tests.
   * @param {string} name The name of the test.
   * @param {'get' | 'put' | 'post' | 'patch' | 'delete'} method The method of the request.
   * @param {URL | string} api The URL instance pointing to the api endpoint.
   * @param {object} body The data to send, in case of a method besides 'get'.
   * @param {object} expectedResponse The expected values of certain response properties. */
  function runTest(name, method, api, body, expectedResponse) {
    function callback(done) {
      method === 'get'
        ? chai
            .request(server)
            // @ts-ignore
            .get(api?.href || api)
            .end((error, response) => {
              if (error) return assert.fail(error)
              for (const key of Object.keys(expectedResponse)) {
                const value = response[key],
                  expectedValue = expectedResponse[key]-

                expectedValue instanceof Object
                  ? assert.deepEqual(value, expectedValue)
                  : assert.strictEqual(value, expectedValue)
              }

              done()
            })
        : chai
            .request(server)
            // @ts-ignore
            [method](api?.href || api)
            .send(body)
            .end((error, response) => {
              if (error) return assert.fail(error)
              for (const key of Object.keys(expectedResponse)) {
                const value = response[key],
                  expectedValue = expectedResponse[key]

                expectedValue instanceof Object
                  ? assert.deepEqual(value, expectedValue)
                  : assert.strictEqual(value, expectedValue)
              }

              done()
            })
    }

    test(name, callback)
  }
  /**
   * @param {'american' | 'british'} from
   * @param {'american' | 'british'} locale
   * @modifies testCount - incrememts the testCoutn variable by 1 whenever called.
   * @returns {string} */
  function testName(from, locale) {
    return `${testCount++}. ${
      from === 'american' ? 'American text' : 'British text'
    } with "${locale}" locale`
  }
  let testCount = 1
  for (const [americanSentence, britishSentence] of americanBritishSentences) {
    /** @type {'american' | 'british'} */
    let currentLocale = 'american'
    runTest(
      testName('american', currentLocale),
      'post',
      `${TRANSLATOR_API}?locale=${currentLocale}`,
      {
        text: americanSentence,
      },
      {
        status: 200,
        ok: true,
        body: {
          translation: americanSentence,
        },
      }
    )
    runTest(
      testName('british', currentLocale),
      'post',
      `${TRANSLATOR_API}?locale=${currentLocale}`,
      {
        text: britishSentence,
      },
      {
        status: 200,
        ok: true,
        body: {
          translation: americanSentence,
        },
      }
    )

    currentLocale = 'british'
    runTest(
      testName('american', currentLocale),
      'post',
      `${TRANSLATOR_API}?locale=${currentLocale}`,
      {
        text: americanSentence,
      },
      {
        status: 200,
        ok: true,
        body: {
          translation: britishSentence,
        },
      }
    )
    runTest(
      testName('british', currentLocale),
      'post',
      `${TRANSLATOR_API}?locale=${currentLocale}`,
      {
        text: britishSentence,
      },
      {
        status: 200,
        ok: true,
        body: {
          translation: britishSentence,
        },
      }
    )
  }
})
