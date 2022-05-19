const chai = require('chai'),
  { assert } = chai,
  chaiHttp = require('chai-http'),
  ConvertHandler = require('../controllers/convertHandler.js'),
  server = require('../server.js')

chai.use(chaiHttp)

suite('Unit Tests', function () {
  const CONVERT_PATH = '/api/convert',
    { UNIT_PAIRS } = ConvertHandler,
    UNITS = UNIT_PAIRS.flat()

  test('1. Read integer inputs', done => {
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
  test('2. Read decimal inputs', done => {
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
  test('3. Read fractional inputs', done => {
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

  test('4. Read fractional inputs with decimals', done => {
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

  test('5. Return error on double fractions', done => {
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
    UNITS.forEach((unit, ind) => {
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

          if (ind === UNITS.length - 1) done()
        })
    })
  })

  test('8. Return error for invalid input units', done => {
    const unsupportedUnits = ['m', 'g', 'mg', 'yd', 'in', 'cm']

    unsupportedUnits.forEach((unit, ind) => {
      chai
        .request(server)
        .get(`${CONVERT_PATH}?input=${unit}`)
        .end((err, res) => {
          const { status, ok, body, text } = res

          assert.strictEqual(status, 400)
          assert.isFalse(ok)
          assert.deepEqual(body, {})
          assert.strictEqual(
            text,
            'please provide one of the supported units at the end of your input: kg, lbs, km, mi, l or gal'
          )

          if (ind === unsupportedUnits.length - 1) done()
        })
    })
  })

  test('9. Return correct unit for each valid input unit', done => {
    const timesToRun = UNIT_PAIRS.length * 2
    let counter = 0
    function checkUnitPair(unitSent, unitExpected) {
      chai
        .request(server)
        .get(`${CONVERT_PATH}?input=${unitSent}`)
        .end((err, res) => {
          const {
            status,
            ok,
            body: { initUnit, returnUnit },
          } = res

          assert.strictEqual(status, 200)
          assert.isTrue(ok)
          assert.strictEqual(initUnit, unitSent)
          assert.strictEqual(returnUnit, unitExpected)

          counter++
          if (counter === timesToRun) done()
        })
    }

    UNIT_PAIRS.forEach(pair => {
      checkUnitPair(pair[0], pair[1])
      checkUnitPair(pair[1], pair[0])
    })
  })

  test('10. Return spelled-out string unit for each valid input unit', done => {
    const abbrevs = [
      ['kg', 'kilograms'],
      ['l', 'litres'],
      ['km', 'kilometres'],
      ['lbs', 'pounds'],
      ['gal', 'gallons'],
      ['mi', 'miles'],
    ]

    abbrevs.forEach((abbFull, ind) => {
      const [abbr, spellExp] = abbFull,
        { err, spelledUnit } = ConvertHandler.spellOutUnit(abbr)

      assert.isNull(err)
      assert.strictEqual(spelledUnit, spellExp)

      if (ind === abbrevs.length - 1) done()
    })
  })

  test('11. Convert gal to l', done => {
    const unit = 'gal',
      expectedUnit = 'l',
      { GAL_TO_L } = ConvertHandler

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initUnit, initNum, returnNum, returnUnit },
        } = res

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(initNum, 1)
        assert.strictEqual(initUnit, unit)
        assert.strictEqual(returnNum, GAL_TO_L)
        assert.strictEqual(returnUnit, expectedUnit)

        done()
      })
  })
})
