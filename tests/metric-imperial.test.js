const chai = require('chai'),
  chaiHttp = require('chai-http'),
  server = require('../server.js'),
  cH = require('../handlers/convert-handler.js'),
  { assert } = chai,
  { IMP_MET_PAIRS } = cH,
  UNITS = IMP_MET_PAIRS.flat(),
  getNum = cH.getNum.bind(cH),
  getUnit = cH.getUnit.bind(cH),
  getReturnNum = cH.getReturnNum.bind(cH),
  getReturnUnit = cH.getReturnUnit.bind(cH),
  spellOutUnit = cH.spellOutUnit.bind(cH),
  CONVERT_PATH = '/api/convert'

chai.use(chaiHttp)

suite('🧪\x1b[33mMetric Imperial: ConvertHandler', () => {
  test('1. Read integer inputs', done => {
    const integer = 3,
      unit = 'L',
      input = `${integer}${unit}`

    const { err, initNum } = getNum(input)

    assert.isNull(err)
    assert.strictEqual(initNum, integer)

    done()
  })

  test('2. Read decimal inputs', done => {
    const decimal = 4.7,
      unit = 'gAl',
      input = `${decimal}${unit}`

    const { err, initNum } = getNum(input)

    assert.isNull(err)
    assert.strictEqual(initNum, decimal)

    done()
  })

  test('3. Read fractional inputs', done => {
    const fraction = '5/7',
      unit = 'lBs',
      input = `${fraction}${unit}`,
      // From Google.
      expectedNum = 0.71428571428,
      within = 0.01

    const { err, initNum } = getNum(input)

    assert.isNull(err)
    assert.approximately(initNum, expectedNum, within)

    done()
  })

  test('4. Read fractional inputs with decimals', done => {
    const fraction = '2.5/6.9',
      unit = 'mi',
      input = `${fraction}${unit}`,
      numberExpected = 0.36231884058,
      within = 0.01

    const { err, initNum } = getNum(input)

    assert.isNull(err)
    assert.approximately(initNum, numberExpected, within)

    done()
  })

  test('5. Return error on double fractions', done => {
    const fraction = '5.2/7/3',
      unit = 'km',
      input = `${fraction}${unit}`

    const { err, initNum } = getNum(input)

    assert.isString(err)
    assert.isNull(initNum)

    done()
  })

  test('6. Default to 1 if no numerical input provided', done => {
    const unit = 'KG',
      numExpected = 1

    const { err, initNum } = getNum(unit)

    assert.isNull(err)
    assert.strictEqual(initNum, numExpected)

    done()
  })

  test('7. Read each valid input unit', done => {
    for (const unit of UNITS) {
      const dec = 32.8,
        input = `${dec}${unit}`

      const { err, initUnit } = getUnit(input)

      assert.isNull(err)
      assert.strictEqual(initUnit, unit)
    }

    done()
  })

  test('8. Return error for invalid input units', done => {
    const unsupportedUnits = ['m', 'g', 'mg', 'yd', 'in', 'cm']

    for (const unit of unsupportedUnits) {
      const { err, initUnit } = getUnit(unit)

      assert.isString(err)
      assert.isNull(initUnit)
    }

    done()
  })

  test('9. Return correct unit for each valid input unit', done => {
    // getReturnUnit should return imp when passed met, and vice versa.
    for (const [imp, met] of IMP_MET_PAIRS) {
      const { err: err0, returnUnit: returnImp } = getReturnUnit(imp),
        { err: err1, returnUnit: returnMet } = getReturnUnit(met),
        errs = [err0, err1]

      for (const err of errs) assert.isNull(err)
      assert.strictEqual(imp, returnMet)
      assert.strictEqual(met, returnImp)
    }

    done()
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

    for (const [abbr, expectedSpell] of abbrevs)
      assert.strictEqual(spellOutUnit(abbr), expectedSpell)

    done()
  })

  test('11. Convert gal to l', done => {
    const unit = 'gal',
      expectedUnit = 'l',
      expectedNum = 3.78541

    const { err: err0, initNum } = getNum(unit),
      { err: err1, initUnit } = getUnit(unit),
      { err: err2, returnNum } = getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = getReturnUnit(initUnit),
      errs = [err0, err1, err2, err3],
      returnedExpectedPairs = [
        [initNum, 1],
        [initUnit, unit],
        [returnNum, expectedNum],
        [returnUnit, expectedUnit],
      ]

    for (const err of errs) assert.isNull(err)
    for (const [returned, expected] of returnedExpectedPairs)
      assert.strictEqual(returned, expected)

    done()
  })

  test('12. Convert l to gal', done => {
    const num = 0.397,
      unit = 'l',
      input = `${num}${unit}`,
      expectedNum = 0.10487635421262162,
      expectedUnit = 'gal'

    const { err: err0, initNum } = getNum(input),
      { err: err1, initUnit } = getUnit(input),
      { err: err2, returnNum } = getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = getReturnUnit(initUnit),
      errs = [err0, err1, err2, err3],
      returnedExpectedPairs = [
        [initNum, num],
        [initUnit, unit],
        [returnNum, expectedNum],
        [returnUnit, expectedUnit],
      ]

    for (const err of errs) assert.isNull(err)
    for (const [returned, expected] of returnedExpectedPairs)
      assert.strictEqual(returned, expected)

    done()
  })

  test('13. Convert mi to km', done => {
    const num = 32.0,
      unit = 'mi',
      input = `${num}${unit}`,
      expectedNum = 51.49888,
      expectedUnit = 'km'

    const { err: err0, initNum } = getNum(input),
      { err: err1, initUnit } = getUnit(input),
      { err: err2, returnNum } = getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = getReturnUnit(initUnit),
      errs = [err0, err1, err2, err3],
      returnedExpectedPairs = [
        [initNum, num],
        [initUnit, unit],
        [returnNum, expectedNum],
        [returnUnit, expectedUnit],
      ]

    for (const err of errs) assert.isNull(err)
    for (const [returned, expected] of returnedExpectedPairs)
      assert.strictEqual(returned, expected)

    done()
  })

  test('14. Convert km to mi', done => {
    const num = 1.1,
      unit = 'km',
      input = `${num}${unit}`,
      expectedNum = 0.6835100103147875,
      expectedUnit = 'mi'

    const { err: err0, initNum } = getNum(input),
      { err: err1, initUnit } = getUnit(input),
      { err: err2, returnNum } = getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = getReturnUnit(initUnit),
      errs = [err0, err1, err2, err3],
      returnedExpectedPairs = [
        [initNum, num],
        [initUnit, unit],
        [returnNum, expectedNum],
        [returnUnit, expectedUnit],
      ]

    for (const err of errs) assert.isNull(err)
    for (const [returned, expected] of returnedExpectedPairs)
      assert.strictEqual(returned, expected)

    done()
  })

  test('15. Convert lbs to kg', done => {
    const num = 9.701239,
      unit = 'lbs',
      input = `${num}${unit}`,
      expectedNum = 4.400404400487999,
      expectedUnit = 'kg'

    const { err: err0, initNum } = getNum(input),
      { err: err1, initUnit } = getUnit(input),
      { err: err2, returnNum } = getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = getReturnUnit(initUnit),
      errs = [err0, err1, err2, err3],
      returnedExpectedPairs = [
        [initNum, num],
        [initUnit, unit],
        [returnNum, expectedNum],
        [returnUnit, expectedUnit],
      ]

    for (const err of errs) assert.isNull(err)
    for (const [returned, expected] of returnedExpectedPairs)
      assert.strictEqual(returned, expected)

    done()
  })

  test('16. Convert kg to lbs', done => {
    const num = 0.000002,
      unit = 'kg',
      input = `${num}${unit}`,
      expectedNum = 0.000004409248840367555,
      expectedUnit = 'lbs'

    const { err: err0, initNum } = getNum(input),
      { err: err1, initUnit } = getUnit(input),
      { err: err2, returnNum } = getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = getReturnUnit(initUnit),
      errs = [err0, err1, err2, err3],
      returnedExpectedPairs = [
        [initNum, num],
        [initUnit, unit],
        [returnNum, expectedNum],
        [returnUnit, expectedUnit],
      ]

    for (const err of errs) assert.isNull(err)
    for (const [returned, expected] of returnedExpectedPairs)
      assert.strictEqual(returned, expected)

    done()
  })
})

suite('🧪\x1b[33mMetric Imperial: HTTP', () => {
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
