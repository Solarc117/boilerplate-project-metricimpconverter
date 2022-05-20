const chai = require('chai'),
  { assert } = chai,
  ConvertHandler = require('../controllers/convertHandler.js')

suite('ConvertHandler', function () {
  // Cannot destructure methods from ConvertHandler, as this sets any instances of 'this' to undefined.
  // 📄Maybe I can fix this using bind?
  const { UNIT_PAIRS } = ConvertHandler,
    UNITS = UNIT_PAIRS.flat()

  test('1. Read integer inputs', done => {
    const integer = 3,
      unit = 'L',
      input = `${integer}${unit}`

    const { err, initNum } = ConvertHandler.getNum(input)

    assert.isNull(err)
    assert.strictEqual(initNum, integer)

    done()
  })

  test('2. Read decimal inputs', done => {
    const decimal = 4.7,
      unit = 'gAl',
      input = `${decimal}${unit}`

    const { err, initNum } = ConvertHandler.getNum(input)

    assert.isNull(err)
    assert.strictEqual(initNum, decimal)

    done()
  })

  test('3. Read fractional inputs', done => {
    const fraction = '5/7',
      unit = 'lBs',
      input = `${fraction}${unit}`,
      expectedNum = 0.7142857142857143

    const { err, initNum } = ConvertHandler.getNum(input)

    assert.isNull(err)
    assert.strictEqual(initNum, expectedNum)

    done()
  })

  test('4. Read fractional inputs with decimals', done => {
    const fraction = '2.5/6.9',
      unit = 'mi',
      input = `${fraction}${unit}`,
      numberExpected = 0.36231884057971014

    const { err, initNum } = ConvertHandler.getNum(input)

    assert.isNull(err)
    assert.strictEqual(initNum, numberExpected)

    done()
  })

  test('5. Return error on double fractions', done => {
    const fraction = '5.2/7/3',
      unit = 'km',
      input = `${fraction}${unit}`

    const { err, initNum } = ConvertHandler.getNum(input)

    assert.isString(err)
    assert.isNull(initNum)

    done()
  })

  test('6. Default to 1 if no numerical input provided', done => {
    const unit = 'KG',
      numExpected = 1

    const { err, initNum } = ConvertHandler.getNum(unit)

    assert.isNull(err)
    assert.strictEqual(initNum, numExpected)

    done()
  })

  test('7. Read each valid input unit', done => {
    for (const unit of UNITS) {
      const dec = 32.8,
        input = `${dec}${unit}`

      const { err, initUnit } = ConvertHandler.getUnit(input)

      assert.isNull(err)
      assert.strictEqual(initUnit, unit.toLowerCase())
    }

    done()
  })

  test('8. Return error for invalid input units', done => {
    const unsupportedUnits = ['m', 'g', 'mg', 'yd', 'in', 'cm']

    for (const unit of unsupportedUnits) {
      const { err, initUnit } = ConvertHandler.getUnit(unit)

      assert.isString(err)
      assert.isNull(initUnit)
    }

    done()
  })

  test('9. Return correct unit for each valid input unit', done => {
    // ConvertHandler.getReturnUnit should return imp when passed met, and vice versa.
    for (const [imp, met] of UNIT_PAIRS) {
      const { err: err0, returnUnit: returnImp } =
          ConvertHandler.getReturnUnit(imp),
        { err: err1, returnUnit: returnMet } =
          ConvertHandler.getReturnUnit(met),
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

    for (const [abbr, spellExp] of abbrevs) {
      const { err, spelledUnit } = ConvertHandler.spellOutUnit(abbr)

      assert.isNull(err)
      assert.strictEqual(spelledUnit, spellExp)
    }

    done()
  })

  test('11. Convert gal to l', done => {
    const unit = 'gal',
      expectedUnit = 'l',
      expectedNum = 3.78541

    const { err: err0, initNum } = ConvertHandler.getNum(unit),
      { err: err1, initUnit } = ConvertHandler.getUnit(unit),
      { err: err2, returnNum } = ConvertHandler.getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = ConvertHandler.getReturnUnit(initUnit),
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

    const { err: err0, initNum } = ConvertHandler.getNum(input),
      { err: err1, initUnit } = ConvertHandler.getUnit(input),
      { err: err2, returnNum } = ConvertHandler.getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = ConvertHandler.getReturnUnit(initUnit),
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

    const { err: err0, initNum } = ConvertHandler.getNum(input),
      { err: err1, initUnit } = ConvertHandler.getUnit(input),
      { err: err2, returnNum } = ConvertHandler.getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = ConvertHandler.getReturnUnit(initUnit),
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

    const { err: err0, initNum } = ConvertHandler.getNum(input),
      { err: err1, initUnit } = ConvertHandler.getUnit(input),
      { err: err2, returnNum } = ConvertHandler.getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = ConvertHandler.getReturnUnit(initUnit),
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

    const { err: err0, initNum } = ConvertHandler.getNum(input),
      { err: err1, initUnit } = ConvertHandler.getUnit(input),
      { err: err2, returnNum } = ConvertHandler.getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = ConvertHandler.getReturnUnit(initUnit),
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

    const { err: err0, initNum } = ConvertHandler.getNum(input),
      { err: err1, initUnit } = ConvertHandler.getUnit(input),
      { err: err2, returnNum } = ConvertHandler.getReturnNum(initNum, initUnit),
      { err: err3, returnUnit } = ConvertHandler.getReturnUnit(initUnit),
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
