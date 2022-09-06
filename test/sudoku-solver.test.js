const Browser = require('zombie'),
  assert = require('./modified-assert.js'),
  [
    [test1, solution1],
    [test2, solution2],
    [test3, solution3],
    [test4, solution4],
    [test5, solution5],
    [test6, solution6],
  ] = require('./test-sudokus.json'),
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

  test('2. Invalid sudoku input: row duplicate', done => {
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

    browser.on('response', (req, res) => {
      if (req.method !== 'POST') return

      browser.wait(browser.query('#json code'), () => {
        assert.isString(JSON.parse(browser.text('#json code')).error)

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

  test('3. Invalid sudoku input: column duplicate', done => {
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

    browser.on('response', (req, res) => {
      if (req.method !== 'POST') return

      browser.wait(browser.query('#json code'), () => {
        assert.isString(JSON.parse(browser.text('#json code')).error)

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

  test('4. Invalid sudoku input: grid duplicate', done => {
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

    browser.on('response', (req, res) => {
      if (req.method !== 'POST') return

      browser.wait(browser.query('#json code'), () => {
        assert.isString(JSON.parse(browser.text('#json code')).error)

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

  test('5. Valid coordinate value', done => {
    const sudoku = test6,
      coordinate = 'E1',
      value = 3

    browser.on('response', (req, res) => {
      if (req.method !== 'POST') return

      browser.wait(browser.query('#json code'), () => {
        const { valid, conflicts } = JSON.parse(browser.text('#json code'))
        assert.isTrue(valid)
        assert.isNull(conflicts)

        done()
      })
    })
    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#coord')
      browser.assert.element('#val')
      assert.strictEqual(browser.query('#json').innerHTML, '')
      browser.fill('#text-input', sudoku)
      browser.fill('#coord', coordinate)
      browser.fill('#val', value)
      browser.click('#check-button')
    })
  })

  test('6. Invalid coordinate value', done => {
    const sudoku = test1,
      coordinate = 'A2',
      value = 1

    browser.on('response', (req, res) => {
      if (req.method !== 'POST') return

      browser.wait(browser.query('#json code'), () => {
        const { valid, conflicts } = JSON.parse(browser.text('#json code'))
        assert.isFalse(valid)
        assert.deepStrictEqual(conflicts, ['row'])

        done()
      })
    })
    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#coord')
      browser.assert.element('#val')
      assert.strictEqual(browser.query('#json').innerHTML, '')
      browser.fill('#text-input', sudoku)
      browser.fill('#coord', coordinate)
      browser.fill('#val', value)
      browser.click('#check-button')
    })
  })
})
