'use strict'
const SudokuSolver = require('../logic/sudoku-solver.js')

module.exports = class SudokuHandler {
  static attempt(req, res) {
    const {
      body: { sudoku },
    } = req

    if (!SudokuSolver.isValid(sudoku))
      return res.status(400).json({ error: 'Puzzle cannot be solved' })

    const solution = SudokuSolver.solve(sudoku)

    res.status(200).json({ solution })
  }
}
