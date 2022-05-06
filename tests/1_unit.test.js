const chai = require('chai'),
  { assert } = chai,
  chaiHttp = require('chai-http'),
  ConvertHandler = require('../controllers/convertHandler.js'),
  convertHandler = new ConvertHandler(),
  server = require('../server.js')

chai.use(chaiHttp)

suite('Unit Tests', function () {
  test('can read integer input', done => {
    const integer = 3,
      unit = 'mi'

    chai
      .request(server)
      .get(`/api/convert?input=${integer}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { inputNum },
        } = res

        assert.isTrue(ok)
        assert.strictEqual(status, 200)
        assert.strictEqual(inputNum, integer)
        done()
      })
  })

  test('can read a decimal input', done => {
    const decimal = 4.7,
      unit = 'kg'

    chai
      .request(server)
      .get(`/api/convert?input=${decimal}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { inputNum },
        } = res

        assert.isTrue(ok)
        assert.strictEqual(status, 200)
        assert.strictEqual(inputNum, decimal)
        done()
      })
  })
})
