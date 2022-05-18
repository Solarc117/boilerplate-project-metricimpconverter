module.exports = class ConvertHandler {
  static SUPPORTED_UNITS = ['kg', 'lbs', 'km', 'mi', 'l', 'gal']
  static GAL_TO_L = 3.78541
  static LBS_TO_KG = 0.453592
  static MI_TO_KM = 1.60934
  /**
   * @description A pure, static method that returns the client's numerical input.
   * @param {string} clientInput Unfiltered input from the client.
   * @returns {{ err: string|null, initNum: number|null }} An object containing either an initNum property representing the numerical value of the client's input in decimal format, or an err property if the input was of an invalid format.
   */
  static getNum(clientInput) {
    const numFracRegex = /^[\d./]+/g,
      matchResult = clientInput.match(numFracRegex),
      numFrac = matchResult ? matchResult[0] : '1',
      divisors = numFrac.match(/\//g)

    if (divisors === null) return { err: null, initNum: +numFrac }

    if (divisors.length > 1)
      return {
        err: 'invalid number format - too many divisors: ' + numFrac,
        initNum: null,
      }

    const [num, denom] = numFrac.split('/').map(v => +v)
    return { err: null, initNum: num / denom }
  }

  /**
   * @description A pure, static method that returns the unit passed by the client, if it is of a valid format (ie. kg, m, mi, etc) and located after the numerical input.
   * @param {string} clientInput Unfiltered input from the client.
   * @returns {{ err: string|null, initUnit: string|null }} An object containing either an initUnit property representing the unit of the client's input, or an err property if the unit is of an invalid format.
   */
  static getUnit(clientInput) {
    const unitRegex = /[a-z]+$/gi,
      matchResult = clientInput.match(unitRegex),
      initUnit = matchResult ? matchResult[0].toLowerCase() : null

    if (
      initUnit === null ||
      !this.SUPPORTED_UNITS.some(unit => unit === initUnit)
    ) {
      return {
        err: 'please provide one of the supported units at the end of your input: kg, lbs, km, mi, l or gal',
        initUnit: null,
      }
    }

    return { err: null, initUnit }
  }

  /**
   * @description A pure, static method that returns the unit that the client's input should be converted to (avoids converting between mass, volume, or length).
   * @param {string} initUnit The client's unit in lowercase, as returned by this.getUnit.
   * @returns {{ err: string|null, returnUnit: string|null }} An object containing an error property if the unit passed cannot be converted, or a returnUnit property containing the unit to convert to.
   */
  static getReturnUnit(initUnit) {
    const unitPairs = [
      ['kg', 'lbs'],
      ['l', 'gal'],
      ['km', 'mi'],
    ]

    let returnUnit = null
    unitPairs.forEach(pair => {
      if (initUnit === pair[0]) returnUnit = pair[1]
      if (initUnit === pair[1]) returnUnit = pair[0]
    })

    return { err: returnUnit ? null : 'something went wrong', returnUnit }
  }

  static convert(initNum, initUnit) {
    let result

    return result
  }

  static spellOutUnit(unit) {
    let result

    return result
  }

  static getString(initNum, initUnit, returnNum, returnUnit) {
    let result

    return result
  }
}
