module.exports = class ConvertHandler {
  /**
   * @description A pure, static method that returns the client's numerical input.
   * @param {string} clientInput Unfiltered input from the client.
   * @returns {{ err?: string, initNum?: number }} An object containing either an initNum property representing the numerical value of the client's input in decimal format, or an err property if the input was of an invalid format.
   */
  static getNum(clientInput) {
    const numFracRegex = /^[\d./]+/g,
      matchResult = clientInput.match(numFracRegex),
      numFrac = matchResult ? matchResult[0] : '1',
      divisors = numFrac.match(/\//g)

    if (divisors === null) return { initNum: +numFrac }

    if (divisors.length > 1)
      return {
        err: 'invalid number format - too many divisors: ' + numFrac,
      }

    const [num, denom] = numFrac.split('/').map(v => +v)
    return { initNum: num / denom }
  }

  /**
   * @description A pure, static method that returns the unit passed by the client, if it is of a valid format (ie. kg, m, mi, etc) and located after the numerical input.
   * @param {string} clientInput Unfiltered input from the client.
   * @returns {{ err?: string, initUnit?: string }} An object containing either an initUnit property representing the unit of the client's input, or an err property if the unit is of an invalid format.
   */
  static getUnit(clientInput) {
    const unitRegex = /[a-z]+$/gi,
      matchResult = clientInput.match(unitRegex),
      initUnit = matchResult ? matchResult[0].toLowerCase() : null,
      acceptableUnits = ['kg', 'lbs', 'km', 'mi', 'l', 'gal']

    if (initUnit === null || !acceptableUnits.some(unit => unit === initUnit))
      return {
        err: 'please provide one of the supported units at the end of your input: kg, lbs, km, mi, l or gal',
      }

    return { initUnit }
  }

  static convert(initNum, initUnit) {
    const AL_TO_L = 3.78541,
      LBS_TO_KG = 0.453592,
      MI_TO_KM = 1.60934
    let result

    return result
  }

  static getReturnUnit(initUnit) {
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
