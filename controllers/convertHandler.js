const res = require('express/lib/response')

module.exports = class ConvertHandler {
  /**
   * @description A pure, static method that returns the first match of consecutive numbers or forward slashes (representing division).
   * @param {string} clientInput Unfiltered input from the client.
   * @returns {object} An object containing either a num property representing the numerical value of the client's input in decimal format, or an error property if the input was of an invalid foramt (ie. multiple divisors).
   */
  static getNum(clientInput) {
    const numFracRegex = /^[\d./]+/g,
      matchResult = clientInput?.match(numFracRegex),
      numFrac = matchResult ? matchResult[0] : '1',
      divisors = numFrac.match(/\//g)

    if (divisors === null) return { inputNum: +numFrac }

    if (divisors.length > 1)
      return { error: 'invalid number format - too many divisors: ' + numFrac }

    const [num, denom] = numFrac.split('/').map(v => +v)
    return { inputNum: num / denom }
  }

  static getUnit(clientInput) {
    let result

    return result
  }

  static convert(initNum, initUnit) {
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
