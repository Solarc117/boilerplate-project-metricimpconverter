const americanToBritish = require('./american-to-british.json')

module.exports = class Translator {
  /**
   * @description Translates the text parameter to British or American English, depending on the boolean indicator parameter.
   * @param {string} text Sanitized user input to translate.
   * @param {'american' | 'british'} locale Whether to translate to British English, or American English.
   * @returns {{ translation: string }} */
  static translate(text, locale) {
    function replace(text, foreign, local) {
      function replacer(matched, preceeding, succeeding) {
        const alphaNumeric = /[A-Za-zÀ-ÖØ-öø-ÿ0-9]/

        return alphaNumeric.test(preceeding) || alphaNumeric.test(succeeding)
          ? matched
          : `${preceeding}${local}${succeeding}`
      }
      function getForeignRegex(foreign) {
        return new RegExp(`(.?)${foreign}(.?)`, 'gi')
      }
      // 1. Create a regex using translateRegex, & the foreign string to match.
      // 2. Create a NEW string, which is the result of calling replace on the text, with the foreignRegex result.
      // 3. Return the new string.
      const foreignRegex = getForeignRegex(foreign),
        localText = text.replace(foreignRegex, replacer)

      return localText
    }
    let translation = text

    for (const american of Object.keys(americanToBritish)) {
      const british = americanToBritish[american],
        parameters = [
          translation,
          ...(locale === 'american'
            ? [british, american]
            : [american, british]),
        ]

      translation = replace(...parameters)
    }

    return { translation }
  }
}
