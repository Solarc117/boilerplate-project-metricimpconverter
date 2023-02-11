'use strict'
require('dotenv').config()
const { test, expect } = require('@playwright/test'),
  sudokusAndSolutions = require('./json/test-sudokus.json'),
  { env } = process,
  SUDOKU_PAGE = `http://localhost:${env.PORT}/sudoku-solver`
/**
 * @param {number} index
 * @param {string} character
 */
function replaceAt(index, character) {
  return this.slice(0, index) + character + this.slice(index + 1, this.length)
}
// @ts-ignore
String.prototype.replaceAt = replaceAt

test.beforeEach(async ({ page }) => {
  await page.goto(SUDOKU_PAGE)
})

test.describe('🧪 Sudoku Solver: Browser', () => {
  /**
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<object>}
   */
  async function getJson(page) {
    const json = await page.locator('#json code'),
      textContent = (await json?.textContent()) || null

    return JSON.parse(textContent || '{}')
  }
  const sudokuInputId = '#text-input',
    solveButtonId = '#solve-button',
    checkButtonId = '#check-button'
  let testNumber = 1

  test(`${testNumber++}. Has "Sudoku Solver" Title`, async ({ page }) => {
    await expect(page).toHaveTitle(/Sudoku Solver/)
  })

  for (const [sudoku, solution] of sudokusAndSolutions)
    test(`${testNumber++}. Valid Sudoku Input`, async ({ page }) => {
      await page.locator(sudokuInputId).fill(sudoku)
      await page.locator(solveButtonId).click()

      const json = await getJson(page)
      await expect(json.solution).toBe(solution)
    })

  const coordinateInputId = '#coord',
    valueInputId = '#val',
    coordinateValueConflicts = {
      row: ['A1', '9'],
      column: ['A1', '6'],
      grid: ['A1', '2'],
    }
  for (const area of Object.keys(coordinateValueConflicts))
    test(`${testNumber++}. Invalid sudoku input: ${area} duplicate`, async ({
      page,
    }) => {
      const [coordinate, value] = coordinateValueConflicts[area]

      await page.locator(coordinateInputId).fill(coordinate)
      await page.locator(valueInputId).fill(value)
      await page.locator(checkButtonId).click()

      const { valid, conflicts } = await getJson(page)

      await expect(valid).toBe(false)
      await expect(conflicts).toContain(area)
    })

  test(`${testNumber++}. Valid coordinate value `, async ({ page }) => {
    const [coordinate, value] = ['E1', '3']

    await page.locator(coordinateInputId).fill(coordinate)
    await page.locator(valueInputId).fill(value)
    await page.locator(checkButtonId).click()

    const { valid, conflicts } = await getJson(page)

    await expect(valid).toBe(true)
    await expect(conflicts).toHaveLength(0)
  })

  test(`${testNumber++}. Invalid coordinate value `, async ({ page }) => {
    const [sudoku] = sudokusAndSolutions[0],
      [coordinate, value] = ['A2', '1']

    await page.locator(sudokuInputId).fill(sudoku)
    await page.locator(coordinateInputId).fill(coordinate)
    await page.locator(valueInputId).fill(value)
    await page.locator(checkButtonId).click()

    const { valid, conflicts } = await getJson(page)

    await expect(valid).toBe(false)
    for (const area of ['row', 'grid']) await expect(conflicts).toContain(area)
  })
})
