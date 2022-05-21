const chaiHttp = require('chai-http'),
  chai = require('chai'),
  { assert } = chai,
  server = require('../server.js')

chai.use(chaiHttp)

suite('Functional Tests', function () {
  const CONVERT_PATH = '/api/convert'

  test('1. Convert 10L: GET /api/convert', done => {
    const num = 10,
      unit = 'L',
      input = `${num}${unit}`,
      expectedNum = 2.64172,
      within = 0.01,
      expectedUnit = 'gal'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${input}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum, initUnit, returnNum, returnUnit },
        } = res

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(initNum, num)
        assert.strictEqual(initUnit, unit.toLowerCase())
        assert.approximately(returnNum, expectedNum, within)
        assert.strictEqual(returnUnit, expectedUnit)

        done()
      })
  })
})
