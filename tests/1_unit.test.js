const chai = require('chai'),
  { assert } = chai,
  chaiHttp = require('chai-http'),
  ConvertHandler = require('../controllers/convertHandler.js'),
  convertHandler = new ConvertHandler(),
  server = require('../server.js')

chai.use(chaiHttp)

suite('Unit Tests', function () {
  const convertPath = '/api/convert'

  test('correctly read integer input', done => {
    const integer = 3,
      unit = 'mi'

    chai
      .request(server)
      .get(`${convertPath}?input=${integer}${unit}`)
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

  test('correctly read a decimal input', done => {
    const decimal = 4.7,
      unit = 'kg'

    chai
      .request(server)
      .get(`${convertPath}?input=${decimal}${unit}`)
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

  test('correctly read a fractional input', done => {
    const fraction = '5/7',
      unit = 'lbs'

    chai
      .request(server)
      .get(`${convertPath}?input=${fraction}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { inputNum },
        } = res

        assert.isTrue(ok)
        assert.strictEqual(status, 200)
        // 5/7 = 0.7142857142857143 (in node)
        assert.strictEqual(inputNum, 0.7142857142857143)
      })
  })
})
