const chai = require('chai'),
  { assert } = chai,
  chaiHttp = require('chai-http'),
  ConvertHandler = require('../controllers/convertHandler.js'),
  server = require('../server.js')

chai.use(chaiHttp)

suite('Unit Tests', function () {
  const CONVERT_PATH = '/api/convert'

  test('1. Read integer input', done => {
    const integer = 3,
      unit = 'L'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${integer}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum },
        } = res

        assert.isTrue(ok)
        assert.strictEqual(status, 200)
        assert.strictEqual(initNum, integer)

        done()
      })
  })
  test('2. Read decimal input', done => {
    const decimal = 4.7,
      unit = 'gAl'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${decimal}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum },
        } = res

        assert.isTrue(ok)
        assert.strictEqual(status, 200)
        assert.strictEqual(initNum, decimal)

        done()
      })
  })

  // %2F encodes for forward slashes in urls.
  test('3. Read fractional input', done => {
    const fraction = '5/7',
      encodedFraction = fraction.replace(/\//g, '%2F'),
      unit = 'lBs'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${encodedFraction}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum },
        } = res

        assert.isTrue(ok)
        assert.strictEqual(status, 200)
        // 5 / 7 = 0.7142857142857143 (in Node)
        assert.strictEqual(initNum, 0.7142857142857143)

        done()
      })
  })

  test('4. Read fractional input with decimal', done => {
    const fraction = '2.5/6.9',
      encodedFraction = fraction.replace(/\//g, '%2F'),
      unit = 'mi'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${encodedFraction}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum },
        } = res

        assert.isTrue(ok)
        assert.strictEqual(status, 200)
        // 2.5 / 6.9 = 0.36231884057971014 (in Node)
        assert.strictEqual(initNum, 0.36231884057971014)

        done()
      })
  })

  test('5. Return an error on double fraction', done => {
    const fraction = '5.2/7/3',
      encodedFraction = fraction.replace(/\//g, '%2F'),
      unit = 'km'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${encodedFraction}${unit}`)
      .end((err, res) => {
        const { status, ok, body, text } = res

        assert.isFalse(ok)
        assert.strictEqual(status, 400)
        assert.deepEqual(body, {})
        assert.match(text, new RegExp(fraction, 'g'))

        done()
      })
  })

  test('6. Default to 1 if no numerical input provided', done => {
    const unit = 'KG'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum },
        } = res

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(initNum, 1)

        done()
      })
  })

  test('7. Read each valid input unit', done => {
    const units = ['L', 'gAl', 'Km', 'mI', 'kg', 'lbS']

    units.forEach((unit, ind) => {
      chai
        .request(server)
        .get(`${CONVERT_PATH}?input=${unit}`)
        .end((err, res) => {
          const {
            status,
            ok,
            body: { initUnit },
          } = res

          assert.strictEqual(status, 200)
          assert.isTrue(ok)
          assert.strictEqual(initUnit, unit.toLowerCase())

          if (ind === units.length - 1) done()
        })
    })
  })
})
