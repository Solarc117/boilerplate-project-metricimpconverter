'use strict'
function fillSudoku(data) {
  const len = data?.length < 81 ? data.length : 81
  let completeSudoku = true

  for (let i = 0; i < len; i++) {
    const rowLetter = String.fromCharCode(
        'A'.charCodeAt(0) + Math.floor(i / 9)
      ),
      col = (i % 9) + 1

    if (!data[i] || data[i] === '.') {
      completeSudoku = false
      query(`.${rowLetter + col}`).textContent = ' '
      continue
    }

    query(`.${rowLetter + col}`).textContent = data[i]
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
    parsed = await data.json()

  if (parsed.error)
    return (errorMsg.innerHTML = `<code>${JSON.stringify(
      parsed,
      null,
      2
    )}</code>`)

  fillSudoku(parsed.solution)
}
async function check(event) {
  event.preventDefault()
  const stuff = {
      sudoku: textArea.value,
      coordinate: coordInput.value,
      value: valInput.value,
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

  errorMsg.innerHTML = `<code>${JSON.stringify(parsed, null, 2)}</code>`
}
// @ts-ignore
const log = console.log.bind(console),
  query = document.querySelector.bind(document),
  [textArea, coordInput, valInput, errorMsg] = [
    '#text-input',
    '#coord',
    '#val',
    '#error',
  ].map(query)

textArea.value =
  '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
fillSudoku(textArea.value)

textArea.addEventListener('input', () => fillSudoku(textArea.value))

query('#solve-button').addEventListener('click', solve)
query('#check-button').addEventListener('click', check)
