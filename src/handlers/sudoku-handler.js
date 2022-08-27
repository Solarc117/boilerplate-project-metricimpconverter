'use strict'
const SudokuSolver = require('../logic/sudoku-solver.js')

module.exports = class SudokuHandler {
  static solve(req, res) {
    const {
      body: { sudoku },
    } = req

    if (!SudokuSolver.isValid(sudoku))
      return res.status(400).json({ error: 'Puzzle cannot be solved' })

    const solution = SudokuSolver.solve(sudoku)

    res.status(200).json({ solution })
  }

  static check(req, res) {
    const { sudoku, coordinate, value } = req

    if (!SudokuSolver.validCoordinate(coordinate))
      return res.status(400).json({
        error: `invalid coordinate ${coordinate} - must be a letter, A-I, and a number, 1-9`,
      })

    if (!SudokuSolver.validValue(value))
      return res.status(400).json({
        error: `invalid value ${value} - must be a number, 1-9`,
      })

    const analysis = SudokuSolver.check(sudoku, coordinate, +value)

    res.status(200).json(analysis)
  }
}
