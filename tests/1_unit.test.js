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
    for (const [ind, unit] of UNITS.entries()) {
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
    }
  })

  test('8. Return error for invalid input units', done => {
    const unsupportedUnits = ['m', 'g', 'mg', 'yd', 'in', 'cm']

    for (const [ind, unit] of unsupportedUnits.entries()) {
      chai
        .request(server)
        .get(`${CONVERT_PATH}?input=${unit}`)
        .end((err, res) => {
          const { status, ok, body, text } = res

          assert.strictEqual(status, 400)
          assert.isFalse(ok)
          assert.deepEqual(body, {})
          assert.isString(text)

          if (ind === unsupportedUnits.length - 1) done()
        })
    }
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

          /* Comparison is executed first, THEN counter is incremented, meaning the updated operator is compared at the NEXT iteration. This is why timesToRun is decremented by 1. Same as: 
          counter++
          if (counter === timesToRun) done() */
          if (counter++ === timesToRun - 1) done()
        })
    }

    for (const pair of UNIT_PAIRS) {
      checkUnitPair(pair[0], pair[1])
      checkUnitPair(pair[1], pair[0])
    }
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

    for (const [ind, abbFull] of abbrevs.entries()) {
      const [abbr, spellExp] = abbFull,
        { err, spelledUnit } = ConvertHandler.spellOutUnit(abbr)

      assert.isNull(err)
      assert.strictEqual(spelledUnit, spellExp)

      if (ind === abbrevs.length - 1) done()
    }
  })

  test('11. Convert gal to l', done => {
    const unit = 'gal',
      expectedUnit = 'l',
      expectedNum = 3.78541

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
        assert.strictEqual(returnNum, expectedNum)
        assert.strictEqual(returnUnit, expectedUnit)

        done()
      })
  })

  test('12. Convert l to gal', done => {
    const num = 0.397,
      unit = 'l',
      expectedNum = 0.10487635421262162,
      expectedUnit = 'gal'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${num}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum, initUnit, returnNum, returnUnit },
        } = res

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(initNum, num)
        assert.strictEqual(initUnit, unit)
        assert.strictEqual(returnNum, expectedNum)
        assert.strictEqual(returnUnit, expectedUnit)

        done()
      })
  })

  test('13. Convert mi to km', done => {
    const num = 32.0,
      unit = 'mi',
      expectedNum = 51.49888,
      expectedUnit = 'km'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${num}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum, initUnit, returnNum, returnUnit },
        } = res

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(initNum, num)
        assert.strictEqual(initUnit, unit)
        assert.strictEqual(returnNum, expectedNum)
        assert.strictEqual(returnUnit, expectedUnit)

        done()
      })
  })

  test('14. Convert km to mi', done => {
    const num = 1.1,
      unit = 'km',
      expectedNum = 0.6835100103147875,
      expectedUnit = 'mi'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${num}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum, initUnit, returnNum, returnUnit },
        } = res

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(initNum, num)
        assert.strictEqual(initUnit, unit)
        assert.strictEqual(returnNum, expectedNum)
        assert.strictEqual(returnUnit, expectedUnit)

        done()
      })
  })

  test('15. Convert lbs to kg', done => {
    const num = 9.701239,
      unit = 'lbs',
      expectedNum = 4.400404400487999,
      expectedUnit = 'kg'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${num}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum, initUnit, returnNum, returnUnit },
        } = res

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(initNum, num)
        assert.strictEqual(initUnit, unit)
        assert.strictEqual(returnNum, expectedNum)
        assert.strictEqual(returnUnit, expectedUnit)

        done()
      })
  })

  test('16. Convert kg to lbs', done => {
    const num = 0.000002,
      unit = 'kg',
      expectedNum = 0.000004409248840367555,
      expectedUnit = 'lbs'

    chai
      .request(server)
      .get(`${CONVERT_PATH}?input=${num}${unit}`)
      .end((err, res) => {
        const {
          status,
          ok,
          body: { initNum, initUnit, returnNum, returnUnit },
        } = res

        assert.strictEqual(status, 200)
        assert.isTrue(ok)
        assert.strictEqual(initNum, num)
        assert.strictEqual(initUnit, unit)
        assert.strictEqual(returnNum, expectedNum)
        assert.strictEqual(returnUnit, expectedUnit)

        done()
      })
  })
})
