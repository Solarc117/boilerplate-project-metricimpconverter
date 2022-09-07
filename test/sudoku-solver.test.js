const Browser = require('zombie'),
  assert = require('./modified-assert.js'),
  [
    [sudoku1, solution1],
    [sudoku2, solution2],
    [sudoku3, solution3],
    [sudoku4, solution4],
    [sudoku5, solution5],
    [sudoku6, solution6],
  ] = require('./test-sudokus.json'),
  { env } = process,
  HOME = `http://localhost:${env.PORT || 3000}`,
  SUDOKU = '/sudoku-solver'

Browser.site = HOME

suite('🧪 \x1b[36mSudoku Solver: Browser\n', () => {
  // @ts-ignore
  String.prototype.replaceAt = function (index, char) {
    return this.slice(0, index) + char + this.slice(index + 1, this.length)
  }
  const browser = new Browser()

  afterEach(() => browser.removeAllListeners())

  test('1. Valid sudoku input', done => {
    const sudoku = sudoku1,
      complete = solution1

    browser.on('response', (req, res) => {
      if (req.method !== 'POST' || !req.url.endsWith('/api/solve')) return

      browser.wait(browser.query('#json code'), () => {
        const { solution } = JSON.parse(browser.text('#json code'))

        assert.strictEqual(solution, complete)
        assert.strictEqual(
          Array.from(browser.querySelectorAll('.sudoku-input')).filter(
            ({ textContent }) => textContent.match(/\d/)
          ).length,
          81
        )

        done()
      })
    })

    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', sudoku)
      browser.click('#solve-button')
    })
  })

  test('2. Valid sudoku input', done => {
    const sudoku = sudoku2,
      complete = solution2

    browser.on('response', (req, res) => {
      if (req.method !== 'POST' || !req.url.endsWith('/api/solve')) return

      browser.wait(browser.query('#json code'), () => {
        const { solution } = JSON.parse(browser.text('#json code'))

        assert.strictEqual(solution, complete)
        assert.strictEqual(
          Array.from(browser.querySelectorAll('.sudoku-input')).filter(
            ({ textContent }) => textContent.match(/\d/)
          ).length,
          81
        )

        done()
      })
    })

    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', sudoku)
      browser.click('#solve-button')
    })
  })

  test('3. Valid sudoku input', done => {
    const sudoku = sudoku3,
      complete = solution3

    browser.on('response', (req, res) => {
      if (req.method !== 'POST' || !req.url.endsWith('/api/solve')) return

      browser.wait(browser.query('#json code'), () => {
        const { solution } = JSON.parse(browser.text('#json code'))

        assert.strictEqual(solution, complete)
        assert.strictEqual(
          Array.from(browser.querySelectorAll('.sudoku-input')).filter(
            ({ textContent }) => textContent.match(/\d/)
          ).length,
          81
        )

        done()
      })
    })

    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', sudoku)
      browser.click('#solve-button')
    })
  })

  test('4. Valid sudoku input', done => {
    const sudoku = sudoku4,
      complete = solution4

    browser.on('response', (req, res) => {
      if (req.method !== 'POST' || !req.url.endsWith('/api/solve')) return

      browser.wait(browser.query('#json code'), () => {
        const { solution } = JSON.parse(browser.text('#json code'))

        assert.strictEqual(solution, complete)
        assert.strictEqual(
          Array.from(browser.querySelectorAll('.sudoku-input')).filter(
            ({ textContent }) => textContent.match(/\d/)
          ).length,
          81
        )

        done()
      })
    })

    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', sudoku)
      browser.click('#solve-button')
    })
  })

  test('5. Valid sudoku input', done => {
    const sudoku = sudoku5,
      complete = solution5

    browser.on('response', (req, res) => {
      if (req.method !== 'POST' || !req.url.endsWith('/api/solve')) return

      browser.wait(browser.query('#json code'), () => {
        const { solution } = JSON.parse(browser.text('#json code'))

        assert.strictEqual(solution, complete)
        assert.strictEqual(
          Array.from(browser.querySelectorAll('.sudoku-input')).filter(
            ({ textContent }) => textContent.match(/\d/)
          ).length,
          81
        )

        done()
      })
    })

    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', sudoku)
      browser.click('#solve-button')
    })
  })

  test('6. Valid sudoku input', done => {
    const sudoku = sudoku6,
      complete = solution6

    browser.on('response', (req, res) => {
      if (req.method !== 'POST' || !req.url.endsWith('/api/solve')) return

      browser.wait(browser.query('#json code'), () => {
        const { solution } = JSON.parse(browser.text('#json code'))

        assert.strictEqual(solution, complete)
        assert.strictEqual(
          Array.from(browser.querySelectorAll('.sudoku-input')).filter(
            ({ textContent }) => textContent.match(/\d/)
          ).length,
          81
        )

        done()
      })
    })

    browser.visit(SUDOKU, () => {
      browser.assert.element('#text-input')
      browser.assert.element('#solve-button')
      browser.fill('#text-input', sudoku)
      browser.click('#solve-button')
    })
  })

  test('7. Invalid sudoku input: row duplicate', done => {
    // @ts-ignore
    const sudoku = sudoku6.replaceAt(0, '9')

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
      browser.fill('#text-input', sudoku)
      browser.click('#solve-button')
    })
  })

  test('8. Invalid sudoku input: column duplicate', done => {
    // @ts-ignore
    const sudoku = sudoku6.replaceAt(36, '1')

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
      browser.fill('#text-input', sudoku)
      browser.click('#solve-button')
    })
  })

  test('9. Invalid sudoku input: grid duplicate', done => {
    // @ts-ignore
    const input = sudoku6.replaceAt(0, '2')

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

  test('10. Valid coordinate value', done => {
    const sudoku = sudoku6,
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

  test('11. Invalid coordinate value', done => {
    const sudoku = sudoku1,
      coordinate = 'A2',
      value = 1

    browser.on('response', (req, res) => {
      if (req.method !== 'POST') return

      browser.wait(browser.query('#json code'), () => {
        const { valid, conflicts } = JSON.parse(browser.text('#json code'))
        assert.isFalse(valid)
        assert.deepStrictEqual(conflicts, ['row', 'grid'])

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
