const { sanitize } = require('isomorphic-dompurify'),
  Translator = require('../logic/translator.js')

module.exports = class TranslatorHandler {
  /**
   * @description Handler for POST /api/translate endpoint; validates & sanitizes user inputs, then returns the translation provided by the Translator.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static translate(req, res) {
    const { locale } = req.query,
      { text: unsanitizedText } = req.body

    if (locale !== 'american' && locale !== 'british')
      return res.status(400).json({
        error: `unknown locale of type ${typeof locale}; please set to either "british" or "american"`,
      })
    if (typeof unsanitizedText !== 'string' || unsanitizedText.length === 0)
      return res.status(400).json({
        error: 'invalid text; please provide a non-empty string to translate',
      })
    const text = sanitize(unsanitizedText),
      result = Translator.translate(text, locale)

    res.status(200).json(result)
  }
}
