'use strict'
require('dotenv').config()
const chaiHttp = require('chai-http'),
  chai = require('chai'),
  server = require('../src/server.js'),
  assert = require('./modified-assert.js'),
  TRANSLATOR_API = '/api/translate'

chai.use(chaiHttp)

suite('🧪 American/British Translator: HTTP', () => {
  
})
