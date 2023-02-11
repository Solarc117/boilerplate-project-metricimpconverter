const chai = require('chai'),
  chaiHttp = require('chai-http'),
  server = require('../src/server.js'),
  assert = require('./modified-assert.js')
chai.use(chaiHttp)

module.exports =
  /**
   * @description Semantic sugar for chai HTTP tests.
   * @param {string} name The name of the test.
   * @param {'get' | 'put' | 'post' | 'patch' | 'delete' | 'head' | 'connect' | 'options' | 'trace'} method The method of the request.
   * @param {URL | string} api The URL instance, or string, pointing to the api endpoint.
   * @param {object | Function} asserter An object or function. If an object, strictEqual (if not an instance of Object) or deepEqual is called on each of its properties, and the respective property of the response object. If more accurate assertions of the response are desired, an end function is passed, to be called with the response object as an argument.
   * @param {object} [body] The data to send, in case of a method that accepts a body (POST, PUT, CONNECT or PATCH). Ignored in other methods.
   */
  function runHttpTest(name, method, api, asserter, body) {
    function callback(done) {
      const bodyMethodRegexes = [/post/i, /put/i, /connect/i, /patch/i]
      bodyMethodRegexes.some(regex => regex.test(method))
        ? chai
            .request(server)
            // @ts-ignore
            [method](api?.href || api)
            .send(body)
            .end((error, response) => {
              if (error) return assert.fail(error)
              if (asserter instanceof Function) {
                asserter(response)
                return done()
              }

              for (const key of Object.keys(asserter)) {
                const value = response[key],
                  expectedValue = asserter[key]

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
            .end((error, response) => {
              if (error) return assert.fail(error)
              if (asserter instanceof Function) {
                asserter(response)
                return done()
              }

              for (const key of Object.keys(asserter)) {
                const value = response[key],
                  expectedValue = asserter[key]

                expectedValue instanceof Object
                  ? assert.deepEqual(value, expectedValue)
                  : assert.strictEqual(value, expectedValue)
              }

              done()
            })
    }

    test(name, callback)
  }
