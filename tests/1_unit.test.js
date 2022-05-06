const chai = require('chai'),
  { assert } = chai,
  chaiHttp = require('chai-http'),
  ConvertHandler = require('../controllers/convertHandler.js'),
  convertHandler = new ConvertHandler(),
  server = require('../server.js')

chai.use(chaiHttp)

suite('Unit Tests', function () {
  test('can read integer input', done => {
    console.log('hi from unit-tests')
    const integer = 3,
      unit = 'mi'

    chai
      .request(server)
      .get(`/api/convert?input=${integer}${unit}`)
      .end((err, res) => {
        console.log('res:', res)

        assert.equal(res.status, 200)
        // assert.equal(res.text, '3')
        done()
      })
  })
})
