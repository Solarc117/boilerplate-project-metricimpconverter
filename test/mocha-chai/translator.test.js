'use strict'
require('dotenv').config()
const chaiHttp = require('chai-http'),
  chai = require('chai'),
  americanBritishSentences = require('./json/american-british-sentences.json'),
  runHttpTest = require('../http-tester.js'),
  TRANSLATOR_API = '/api/translate'
chai.use(chaiHttp)

suite('🧪 American/British Translator: HTTP', () => {
  /**
   * @param {'american' | 'british'} foreign
   * @param {'american' | 'british'} locale
   * @modifies testCount - incrememts the testCoutn variable by 1 whenever called.
   * @returns {string} */
  function testName(foreign, locale) {
    return `${testCount++}. ${
      foreign === 'american' ? 'American text' : 'British text'
    } with ${locale[0].toUpperCase() + locale.slice(1)} locale`
  }
  let testCount = 1
  for (const [americanSentence, britishSentence] of americanBritishSentences) {
    /** @type {'american' | 'british'} */
    let currentLocale = 'american'
    runHttpTest(
      testName('american', currentLocale),
      'post',
      `${TRANSLATOR_API}?locale=${currentLocale}`,
      {
        status: 200,
        ok: true,
        body: {
          translation: americanSentence,
        },
      },
      {
        text: americanSentence,
      },
    )
    runHttpTest(
      testName('british', currentLocale),
      'post',
      `${TRANSLATOR_API}?locale=${currentLocale}`,
      {
        status: 200,
        ok: true,
        body: {
          translation: americanSentence,
        },
      },
      {
        text: britishSentence,
      },
    )

    currentLocale = 'british'
    runHttpTest(
      testName('american', currentLocale),
      'post',
      `${TRANSLATOR_API}?locale=${currentLocale}`,
      {
        status: 200,
        ok: true,
        body: {
          translation: britishSentence,
        },
      },
      {
        text: americanSentence,
      },
    )
    runHttpTest(
      testName('british', currentLocale),
      'post',
      `${TRANSLATOR_API}?locale=${currentLocale}`,
      {
        status: 200,
        ok: true,
        body: {
          translation: britishSentence,
        },
      },
      {
        text: britishSentence,
      },
    )
  }
})
