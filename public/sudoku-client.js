function fillPuzzle(data) {
  let len = data.length < 81 ? data.length : 81
  for (let i = 0; i < len; i++) {
    let rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 9))
    let col = (i % 9) + 1
    if (!data[i] || data[i] === '.') {
      document.getElementsByClassName(rowLetter + col)[0].innerText = ' '
      continue
    }
    document.getElementsByClassName(rowLetter + col)[0].innerText = data[i]
  }
  return
}
async function solve() {
  const stuff = { puzzle: textArea.value },
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

  fillPuzzle(parsed.solution)
}
async function check() {
  const stuff = {
      puzzle: textArea.value,
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
const query = document.querySelector.bind(document),
  [textArea, coordInput, valInput, errorMsg] = [
    '#text-input',
    '#coord',
    '#val',
    '#error',
  ].map(query)

document.addEventListener('DOMContentLoaded', () => {
  textArea.value =
    '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
  fillPuzzle(textArea.value)
})

textArea.addEventListener('input', () => fillPuzzle(textArea.value))

query('#solve-button').addEventListener('click', solve)
query('#check-button').addEventListener('click', check)
