const chaiHttp = require('chai-http'),
  chai = require('chai'),
  { assert } = chai,
  server = require('../server.js'),
  CONVERT_PATH = '/api/convert'

chai.use(chaiHttp)

suite('Functional Tests', function () {
  test('1. Convert 10L: GET /api/convert', done => {
    const num = 10,
      unit = 'L',
      input = `${num}${unit}`,
      expectedNum = 2.64172,
      within = 0.01,
      expectedUnit = 'gal',
      stringRegex = /^10 litres converts to 2.64[0-9]* gallons$/

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${input}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { initNum, initUnit, returnNum, returnUnit, string } = body

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(Object.keys(body).length, 5)
        assert.strictEqual(initNum, num)
        assert.strictEqual(initUnit, unit.toLowerCase())
        assert.approximately(returnNum, expectedNum, within)
        assert.strictEqual(returnUnit, expectedUnit)
        assert.match(string, stringRegex)

        done()
      })
  })

  // Invalid number.
  test('2. Convert 32g: GET /api/convert', done => {
    const num = 32,
      unit = 'g',
      input = `${num}${unit}`

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${input}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { err: err0 } = body

        assert.strictEqual(status, 400)
        assert.isFalse(ok)
        assert.strictEqual(Object.keys(body).length, 1)
        assert.isString(err0)

        done()
      })
  })

  // Invalid number.
  test('3. Convert 3/7.2/4kg: GET /api/convert', done => {
    const num = '3/7.2/4',
      unit = 'kg',
      input = `${num}${unit}`

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${input}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { err: err0 } = body

        assert.strictEqual(status, 400)
        assert.isFalse(ok)
        assert.strictEqual(Object.keys(body).length, 1)
        assert.isString(err0)

        done()
      })
  })

  // Invalid unit.
  test('4. Convert 3/7.2/4kilomegagram: GET /api/convert', done => {
    const num = '3/7.2/4',
      unit = 'kilomegagram',
      input = `${num}${unit}`

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${input}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { err: err0 } = body

        assert.strictEqual(status, 400)
        assert.isFalse(ok)
        assert.strictEqual(Object.keys(body).length, 1)
        assert.isString(err0)

        done()
      })
  })

  test('5. Convert kg: GET /api/convert', done => {
    const unit = 'kg',
      expectedNum = 2.20462,
      within = 0.01,
      expectedUnit = 'lbs',
      stringRegex = /^1 kilograms converts to 2.2[0-9]* pounds$/

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${unit}`)
      .end((err, res) => {
        const { status, ok, body } = res,
          { initNum, initUnit, returnNum, returnUnit, string } = body

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(Object.keys(body).length, 5)
        assert.strictEqual(initNum, 1)
        assert.strictEqual(initUnit, unit.toLowerCase())
        assert.approximately(returnNum, expectedNum, within)
        assert.strictEqual(returnUnit, expectedUnit)
        assert.match(string, stringRegex)

        done()
      })
  })
})
