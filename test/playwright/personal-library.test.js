'use strict'
require('dotenv').config()
const { test, expect } = require('@playwright/test'),
  testBooks = require('./data/personal-library-test-docs.json'),
  { env } = process,
  LIBRARY_PAGE = `http://localhost:${env.PORT}/personal-library`,
  BOOKS_API = '/api/books'
async function deleteBooks({ request }) {
  const deleteRes = await request.delete(BOOKS_API)
  expect(deleteRes.ok()).toBeTruthy()
}
async function navigateToPersonalLibrary({ page }) {
  await page.goto(LIBRARY_PAGE)
}

test.beforeAll(deleteBooks)
test.beforeEach(navigateToPersonalLibrary)

test.describe('🧪 Personal Library: Browser', () => {
  let testNumber = 1

  test(`${testNumber++}. Has "Personal Library" title`, async ({ page }) => {
    await expect(page).toHaveTitle(/Personal Library/)
  })

  test.describe('Test API Responses', () => {
    const lastBook = testBooks.pop()

    test(`${testNumber++}. POST ${BOOKS_API} & ${BOOKS_API}/:_id`, async ({
      page,
    }) => {
      // @ts-ignore
      await page.locator('#titleInputTest').fill(lastBook?.title)
      await page.locator('#bookTest button').click()

      const { _id, title } = JSON.parse(
        (await page.locator('pre').textContent()) || '{}'
      )
      expect(typeof _id).toBe('string')
      // @ts-ignore
      expect(title).toStrictEqual(lastBook.title)

      await page.goBack()
      await page.locator('#idInputTest').fill(_id)
      await page
        .locator('#commentInputTest')
        // @ts-ignore
        .fill(lastBook?.comments[0])
      await page.locator('#commentTest button').click()

      const book = JSON.parse(
          (await page.locator('pre').textContent()) || '{}'
        ),
        { _id: _id2 } = book
      delete book._id
      expect(_id2).toBe(_id)
      expect(book).toEqual(lastBook)
    })

    test.afterAll(deleteBooks)
  })

  test.describe('Sample Front End', () => {
    test(`${testNumber++}. New book`, async ({ page }) => {
      for (const { title } of testBooks) {
        await page.getByPlaceholder('Moby Dick').fill(title)
        await page
          .getByRole('button', { name: 'Submit New Book!' })
          .press('Enter')
      }

      await expect(page.locator('.bookItem')).toHaveCount(testBooks.length)

      for (const { title, comments } of testBooks) {
        await page.getByText(title).click()
        let commentCount = 1
        for (const comment of comments) {
          await page.getByPlaceholder('New Comment').fill(comment)
          await page.getByPlaceholder('New Comment').press('Enter')

          await expect(page.locator('#detailComments li')).toHaveCount(
            commentCount++
          )
        }
      }

      await page.getByText('Harry Potter').click()
      await page.getByRole('button', { name: 'Delete Book' }).click()

      await expect(page.locator('.bookItem')).toHaveCount(testBooks.length - 1)
    })
  })
})
