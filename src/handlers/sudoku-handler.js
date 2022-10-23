'use strict'
const SudokuSolver = require('../logic/sudoku-solver.js')

/**
 * @param {string} sudokuString
 * @returns {string[][]}
 */
function toRows(sudokuString) {
  const rows = Array(9)
    // @ts-ignore
    .fill()
    .map(() => [])

  for (let index = 0; index <= 80; index++) {
    const value = sudokuString[index],
      rowIndex = Math.floor(index / 9)

    // @ts-ignore
    rows[rowIndex].push(value)
  }

  return rows
}

module.exports = class SudokuHandler {
  static solve(req, res) {
    const {
        body: { sudoku: s },
      } = req,
      rows = toRows(s)
    let sudoku

    try {
      sudoku = new SudokuSolver(rows)
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }

    const solution = sudoku.solve()?.rows.flat().join('')

    res.status(200).json({ solution })
  }

  static check(req, res) {
    const { sudoku: s, coordinate, value } = req.body,
      rows = toRows(s)
    let sudoku

    try {
      sudoku = new SudokuSolver(rows)
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }

    if (!/^[A-I][1-9]$/i.test(coordinate))
      return res.status(400).json({
        error: `invalid coordinate ${coordinate} - must be a letter, A-I, followed by a number, 1-9`,
      })

    if (!/^[1-9]$/.test(value))
      return res.status(400).json({
        error: `invalid value ${value} - must be a number, 1-9`,
      })

    const rowIndex = coordinate.charCodeAt(0) - 65,
      columnIndex = +coordinate[1] - 1,
      conflicts = sudoku.conflicts(rowIndex, columnIndex, value),
      valid = conflicts.length === 0

    res.status(200).json({ valid, conflicts })
  }
}
