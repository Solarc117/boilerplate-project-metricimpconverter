const Browser = require('zombie'),
  assert = require('./modified-assert.js'),
  { env } = process,
  HOME = `http://localhost:${env.PORT || 3000}`,
  SUDOKU = '/sudoku-solver'

Browser.site = HOME

suite('🧪 \x1b[36mSudoku Solver: Browser\n', () => {
  const browser = new Browser()

  afterEach(() => browser.removeAllListeners())

  test('1. Valid sudoku input', done => {
    const input = `
      . . 9 | . . 5 | . 1 .
      8 5 . | 4 . . | . . 2
      4 3 2 | . . . | . . .
      ---------------------
      1 . . | . 6 9 | . 8 3
      . 9 . | . . . | . 6 .
      6 2 . | 7 1 . | . . 9
      ---------------------
      . . . | . . . | 1 9 4
      5 . . | . . 4 | . 3 7
      . 4 . | 3 . . | 6 . .
    `.replace(/[\|\s-]/g, '')

    browser.on('console', (level, message) => {
      if (message !== 'completed sudoku') return

      assert.strictEqual(
        Array.from(browser.querySelectorAll('.sudoku-input')).filter(
          ({ textContent }) => textContent.match(/\d/)
        ).length,
        81
      )

      done()
    })
    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', input)
      browser.click('#solve-button')
    })
  })

  test('2. Invalid sudoku input: duplicate number on row', done => {
    const input = `
      9 . 9 | . . 5 | . 1 .
      8 5 . | 4 . . | . . 2
      4 3 2 | . . . | . . .
      ---------------------
      1 . . | . 6 9 | . 8 3
      . 9 . | . . . | . 6 .
      6 2 . | 7 1 . | . . 9
      ---------------------
      . . . | . . . | 1 9 4
      5 . . | . . 4 | . 3 7
      . 4 . | 3 . . | 6 . .
    `.replace(/[\|\s-]/g, '')

    browser.on('response', res => {
      if (res.method !== 'POST') return

      browser.wait(browser.query('#error code'), () => {
        assert.isString(JSON.parse(browser.text('#error code')).error)

        done()
      })
    })
    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.query('#text-input').value = input
      browser.click('#solve-button')
    })
  })

  test('3. Duplicate number on column', done => {
    const input = `
      . . 9 | . . 5 | . 1 .
      8 5 . | 4 . . | . . 2
      4 3 2 | . . . | . . .
      ---------------------
      1 . . | . 6 9 | . 8 3
      1 9 . | . . . | . 6 .
      6 2 . | 7 1 . | . . 9
      ---------------------
      . . . | . . . | 1 9 4
      5 . . | . . 4 | . 3 7
      . 4 . | 3 . . | 6 . .
    `.replace(/[\|\s-]/g, '')

    browser.on('response', res => {
      if (res.method !== 'POST') return

      browser.wait(browser.query('#error code'), () => {
        assert.isString(JSON.parse(browser.text('#error code')).error)

        done()
      })
    })
    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', input)
      browser.click('#solve-button')
    })

    done()
  })

  test('4. Duplicate number on grid', done => {
    const input = `
      2 . 9 | . . 5 | . 1 .
      8 5 . | 4 . . | . . 2
      4 3 2 | . . . | . . .
      ---------------------
      1 . . | . 6 9 | . 8 3
      . 9 . | . . . | . 6 .
      6 2 . | 7 1 . | . . 9
      ---------------------
      . . . | . . . | 1 9 4
      5 . . | . . 4 | . 3 7
      . 4 . | 3 . . | 6 . .
    `.replace(/[\|\s-]/g, '')

    browser.on('response', res => {
      if (res.method !== 'POST') return

      browser.wait(browser.query('#error code'), () => {
        assert.isString(JSON.parse(browser.text('#error code')).error)

        done()
      })
    })
    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', input)
      browser.click('#solve-button')
    })
  })
})
