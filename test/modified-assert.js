// @ts-nocheck
const { assert } = require('chai')

/**
 * @description Asserts that arguments passed are null.
 * @param {...any} vals Values to assert.
 */
assert.areNull = function (...vals) {
  for (const v of vals) assert.isNull(v)
}

/**
 * @description Asserts that arguments passed are strings.
 * @param  {...any} vals Values to assert.
 */
assert.areStrings = function (...vals) {
  for (const v of vals) assert.isString(v)
}

/**
 * @description Asserts that arguments passed are objects.
 * @param  {...any} vals Values to assert.
 */
assert.areObjects = function (...vals) {
  for (const v of vals) assert.isObject(v)
}

/**
 * @description Asserts that arguments passed are true booleans.
 * @param  {...any} vals Values to assert.
 */
assert.areTrue = function (...vals) {
  for (const v of vals) assert.isTrue(v)
}

/**
 * @description Asserts strict equality for both elements in each array passed.
 * @param  {...any} pairs Arrays containing values to compare.
 */
assert.strictEqualPairs = function (...pairs) {
  for (const [v1, v2] of pairs) assert.strictEqual(v1, v2)
}

/**
 * @description Asserts the array argument contains every other argument passed.
 * @param {Array} array
 * @param  {...any} vals
 */
assert.includesAll = function (array, ...vals) {
  for (const v of vals) assert.include(array, v)
}

/**
 * @description Asserts all arguments match the data types found in the array argument.
 * @param {any[]} dataTypes Data types that all values are expected to fall under.
 * @param {...any} vals Values to assert are of a data type found in the dataTypes parameter.
 */
assert.allOneOf = function (dataTypes, ...vals) {
  for (const v of vals) assert.oneOf(v, dataTypes)
}

module.exports = assert
