'use strict'
function fillSudoku(data) {
  const smaller = data.length < 81,
    length = smaller ? data.length : 81
  let completeSudoku = true

  for (let i = 0; i < length; i++) {
    const row = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 9)),
      column = (i % 9) + 1

    if (!data[i] || data[i] === '.') {
      completeSudoku = false
      query(`.${row + column}`).textContent = ' '
      continue
    }

    query(`.${row + column}`).textContent = data[i]
  }
  if (smaller)
    for (let i = length; i < 81; i++) {
      const row = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 9)),
        column = (i % 9) + 1

      query(`.${row + column}`).textContent = ' '
    }
  if (completeSudoku) log('completed sudoku')
}
async function solve(event) {
  event.preventDefault()
  const stuff = { sudoku: textArea.value },
    data = await fetch('/api/solve', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify(stuff),
    }),
    parsed = await data.json(),
    { solution } = parsed

  response.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`

  if (typeof solution === 'string') fillSudoku(solution)
}
async function check(event) {
  event.preventDefault()
  const stuff = {
      sudoku: textArea.value,
      coordinate: coordinateIn.value,
      value: valueIn.value,
    },
    data = await fetch('/api/check', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify(stuff),
    }),
    parsed = await data.json()

  response.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`
}
// @ts-ignore
const log = console.log.bind(console),
  query = document.querySelector.bind(document),
  [textArea, coordinateIn, valueIn, response] = [
    '#text-input',
    '#coord',
    '#val',
    '#json',
  ].map(query)

textArea.value =
  '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
fillSudoku(textArea.value)

textArea.addEventListener('input', () => fillSudoku(textArea.value))

query('#solve-button').addEventListener('click', solve)
query('#check-button').addEventListener('click', check)
