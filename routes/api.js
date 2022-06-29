'use strict'
const { log, error } = console

const { Router } = require('express'),
  cH = require('../controllers/convertHandler.js'),
  // @ts-ignore
  router = new Router(),
  getNum = cH.getNum.bind(cH),
  getUnit = cH.getUnit.bind(cH),
  getReturnNum = cH.getReturnNum.bind(cH),
  getReturnUnit = cH.getReturnUnit.bind(cH),
  getString = cH.getString.bind(cH)

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

router
  .route('/issues/:owner/:project')
  /* POST: create a resource. NON-IDEMPOTENT; multiple identical requests create multiple   
     equal resources.
     PUT: update a resource, either partially or fully, or create if it doesn't exist. IDEMPOTENT: multiple identical requests will not create a new resource if it was already there, or if the first request created it, and they will not modify the resource more than once.
     PATCH: update a resource partially. IDEMPOTENT: multiple identical requests will not modify the resource more than once, as with PUT requests. */
  .get(async (req, res) => {
    // Get all the issues for the given project.
    /* 1. Access the owners collection.
       2. Find the owner that matches the 'owner' req param.
       3. Find the project under the given owner.
       4. Return all issues under the given project. */
    const targetOwner = await owners.findOne({ username: owner }).catch(error)

    res.json({ targetOwner })
  })
  .put(async (req, res) => {
    const { body } = req
    log(body)
  })
  .post(async (req, res) => {})
  .patch(async (req, res) => {})
  .delete(async (req, res) => {})

module.exports = router
