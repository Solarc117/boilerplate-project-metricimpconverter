const Mocha = require('mocha'),
  fs = require('fs'),
  path = require('path'),
  { EventEmitter } = require('events'),
  mocha = new Mocha(),
  emitter = new EventEmitter(),
  TEST_DIR = './test/mocha-chai/',
  TEST_ANNEX = /\.test\.js/

for (const file of fs
  .readdirSync(TEST_DIR)
  .filter(file => TEST_ANNEX.test(file)))
  mocha.addFile(path.join(TEST_DIR, file))

// @ts-ignore
emitter.run = function () {
  try {
    mocha.ui('tdd').run()
  } catch (error) {
    throw error
  }
}

module.exports = emitter
