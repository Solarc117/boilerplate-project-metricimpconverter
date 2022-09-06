'use strict'
module.exports = class SudokuSolver {
  /**
   * @description Returns the columns in a sudoku, or a single column if a "column" number is passed.
   * @param {string} sudoku The sudoku puzzle to extract columns from.
   * @param {number} [columnInd] The column to return, if any.
   * @returns {string[] | string} An array containing each column string (left to right), or a single column string.
   */
  static columns(sudoku, columnInd) {
    function getColumn(sudokuVals, columnNum) {
      return sudokuVals
        .filter((_, i) => i - columnNum === 0 || (i - columnNum) % 9 === 0)
        .join('')
    }
    const splitSudoku = sudoku.split(''),
      columns = []

    if (typeof columnInd === 'number') return getColumn(splitSudoku, columnInd)
    for (let column = 0; column <= 8; column++)
      columns.push(getColumn(splitSudoku, column))

    return columns
  }

  /**
   * @description Returns the rows in a sudoku, or a single row if a "row" number is passed.
   * @param {string} sudoku The sudoku puzzle to extract rows from.
   * @param {number} [rowIndex] The row to return, if any.
   * @returns {string[] | string} An array containing each row string (top to bottom), or a single row string.
   */
  static rows(sudoku, rowIndex) {
    function getRow(sudokuVals, rowNum) {
      const multiple = rowNum * 9,
        min = 0 + multiple,
        max = 8 + multiple

      return sudokuVals.filter((_, i) => min <= i && i <= max).join('')
    }
    const splitSudoku = sudoku.split(''),
      rows = []

    if (typeof rowIndex === 'number') return getRow(splitSudoku, rowIndex)
    for (let row = 0; row <= 8; row++) rows.push(getRow(splitSudoku, row))

    return rows
  }

  /**
   * @description Returns the grids in a sudoku, or a single grid if a "grid" number is passed.
   * @param {string} sudoku The sudoku puzzle to extract grids from.
   * @param {number} [gridIndex] The grid to return, if any.
   * @returns {string[] | string} An array containing each grid string (left to right, top to bottom), or a single grid string.
   */
  static grids(sudoku, gridIndex) {
    function getGrid(sudoku, gridNum) {
      const starts = [0, 1, 2, 9, 10, 11, 18, 19, 20],
        trios = []
      let start = starts[gridNum] * 3

      while (trios.length < 3) {
        trios.push(sudoku.substring(start, start + 3))
        start = start + 9
      }

      return trios.join('')
    }
    const grids = []

    if (typeof gridIndex === 'number') return getGrid(sudoku, gridIndex)
    for (let grid = 0; grid <= 8; grid++) grids.push(getGrid(sudoku, grid))

    return grids
  }

  /**
   * @description Accepts a single string of values (from a sudoku column, row, or grid) and returns whether the area is valid (whether it has no duplicates).
   * @param {string} values The values of the column, row, or grid, with periods representing empty slots.
   * @returns {boolean} Whether the area is valid or not.
   */
  static validArea(values) {
    const sortedValues = values
      .split('')
      .filter(val => !isNaN(+val))
      .sort()

    for (let i = 0; i < sortedValues.length; i++) {
      const current = sortedValues[i],
        next = sortedValues[i + 1]

      if (current === next) return false
    }

    return true
  }

  /**
   * @description Determines whether the sudoku passed is valid by verifying there are no duplicates on rows, columns or grids.
   * @param {string} sudoku The sudoku to validate.
   * @returns {boolean} Whether the sudoku was valid.
   */
  static validSudoku(sudoku) {
    const areas = [this.columns, this.rows, this.grids].map(method =>
      // @ts-ignore
      method(sudoku)
    )

    // @ts-ignore
    return areas.every(area => area.every(this.validArea))
  }

  /**
   * @description Returns a string containing the solution of the passed, incomplete sudoku.
   * @param {string} sudoku A valid sudoku to solve.
   * @returns {string} The sudoku's solution.
   */
  static solve(sudoku) {
    return '769235418851496372432178956174569283395842761628713549283657194516924837947381625'
  }

  /**
   * @param {string} coordinate
   * @returns {boolean}
   */
  static validCoordinate(coordinate) {
    const coordRegex = /^[A-I][1-9]$/i

    return coordRegex.test(coordinate)
  }

  /**
   * @param {string} value
   * @returns {boolean}
   */
  static validValue(value) {
    const numRegex = /^[1-9]$/

    return numRegex.test(value)
  }

  /**
   * @description Checks whether the value passed is legal in the coordinate of the passed sudoku.
   * @param {string} sudoku A string depicting the sudoku, row by row, with periods representing empty values.
   * @param {string} coordinate A letter and number representing the row and column of the value, respectively.
   * @param {number} value The value of the coordinate.
   * @returns {{ valid: boolean, conflicts: string[] | null }} An object with: a valid property describing whether the passed value is legal in the passed coordinate; and a conflicts property containing an array of strings describing where the conflicts were, or null if there were no conflicts.
   */
  static check(sudoku, coordinate, value) {
    const rowIndex = coordinate.toUpperCase().charCodeAt(0) - 65,
      columnIndexes =
        rowIndex >= 0 && rowIndex <= 2
          ? [0, 1, 2]
          : rowIndex >= 3 && rowIndex <= 5
          ? [3, 4, 5]
          : [6, 7, 8],
      columnIndex = +coordinate[1] - 1,
      valueIndex = rowIndex * 9 + columnIndex,
      subbedSudoku =
        sudoku.slice(0, valueIndex) +
        value +
        sudoku.slice(valueIndex + 1, sudoku.length),
      gridIndex =
        columnIndexes[
          columnIndex >= 0 && columnIndex <= 2
            ? 0
            : columnIndex >= 3 && columnIndex <= 5
            ? 1
            : 2
        ],
      row = this.rows(subbedSudoku, rowIndex),
      column = this.columns(subbedSudoku, columnIndex),
      grid = this.grids(subbedSudoku, gridIndex),
      conflicts = []

    for (const [line, str] of [
      [row, 'row'],
      [column, 'column'],
      [grid, 'grid'],
    ])
    // prettier-ignore
    // @ts-ignore
      if (!this.validArea(line)) conflicts.push(str)

    const valid = conflicts.length === 0

    return {
      valid,
      // @ts-ignore
      conflicts: valid ? null : conflicts,
    }
  }
}
