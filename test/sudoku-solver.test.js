const chai = require('chai'),
  chaiHttp = require('chai-http'),
  server = require('../src/server.js'),
  Browser = require('zombie'),
  assert = require('./modified-assert.js'),
  { env } = process,
  SOLVER = '/api/solve',
  CHECKER = '/api/check'

chai.use(chaiHttp)
Browser.site = `http://localhost:${env.PORT || 3000}/`

suite('', () => {
})