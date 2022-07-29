'use strict'
const { Router } = require('express'),
  // @ts-ignore
  router = new Router(),
  VIEWS = process.cwd() + '/views'

router.route('/').get((_, res) => res.sendFile(VIEWS + '/home.html'))

router
  .route('/metric-imperial')
  .get((_, res) => res.sendFile(VIEWS + '/metric-imperial/'))

router
  .route('/issue-tracker')
  .get((_, res) => res.sendFile(VIEWS + '/issue-tracker/'))

router
  .route('/issue-tracker/:project/')
  .get((_, res) => res.sendFile(VIEWS + '/issue-tracker/issues.html'))

router
  .route('/personal-library')
  .get((_, res) => res.sendFile(VIEWS + '/personal-library/'))

router
  .route('/sudoku-solver')
  .get((_, res) => res.sendFile(VIEWS + '/sudoku-solver/'))

router
  .route('/american-british')
  .get((_, res) => res.sendFile(VIEWS + '/american-british/'))

module.exports = router
