'use strict'
const { Router } = require('express'),
  ConvertHandler = require('../handlers/convert-handler.js'),
  IssueHandler = require('../handlers/issues-handler.js'),
  LibraryHandler = require('../handlers/library-handler.js'),
  SudokuHandler = require('../handlers/sudoku-handler.js'),
  TranslatorHandler = require('../handlers/translator-handler.js'),
  router = Router(),
  getNum = ConvertHandler.getNum.bind(ConvertHandler),
  getUnit = ConvertHandler.getUnit.bind(ConvertHandler),
  getReturnNum = ConvertHandler.getReturnNum.bind(ConvertHandler),
  getReturnUnit = ConvertHandler.getReturnUnit.bind(ConvertHandler),
  getString = ConvertHandler.getString.bind(ConvertHandler)
  // Base route: /api

router.route('/convert').get((req, res) => {
  const { input } = req.query,
    { err: err0, initNum } = getNum(input),
    { err: err1, initUnit } = getUnit(input),
    { err: err2, returnUnit } = getReturnUnit(initUnit),
    { err: err3, returnNum } = getReturnNum(initNum, initUnit),
    string = getString(initNum, initUnit, returnNum, returnUnit),
    errs = [err0, err1, err2, err3]

  for (const err of errs) if (err) return res.status(400).json({ err })

  res.json({
    initNum,
    initUnit,
    returnNum,
    returnUnit,
    string,
  })
})

// Purely for testing purposes.
router.route('/issues').get(IssueHandler.getProjects).delete(IssueHandler.drop)
router.route('/issues/projects/:owner/:project').post(IssueHandler.postProject)
router
  .route('/issues/:project')
  /* POST: create a resource. NON-IDEMPOTENT; multiple identical requests create multiple   
     equal resources.
     PUT: update a resource, either partially or fully, or create if it doesn't exist. IDEMPOTENT: multiple identical requests will not create a new resource if it was already there, or if the first request created it, and they will not modify the resource more than once.
     PATCH: update a resource partially. IDEMPOTENT: multiple identical requests will not modify the resource more than once, as with PUT requests. */
  .get(IssueHandler.getProjectIssues)
  // This put request is only for the issue-tracker tests suiteSetup.
  .post(IssueHandler.appendIssue)
  .patch(IssueHandler.updateIssue)
  .delete(IssueHandler.deleteIssue)

router
  .route('/books')
  .get(LibraryHandler.getAllBooks)
  .post(LibraryHandler.createBook)
  .delete(LibraryHandler.deleteBooks)
router
  .route('/books/:_id')
  .get(LibraryHandler.getBook)
  .post(LibraryHandler.addComment)
  .delete(LibraryHandler.deleteBook)

router.route('/solve').post(SudokuHandler.solve)
router.route('/check').post(SudokuHandler.check)

router.route('/translate').post(TranslatorHandler.translate)

module.exports = router
