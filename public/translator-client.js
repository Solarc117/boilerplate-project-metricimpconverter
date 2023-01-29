const query = document.querySelector.bind(document),
  [textArea, localeArea, errorArea, translatedArea] = [
    '#text-input',
    '#locale-select',
    '#error-msg',
    '#translated-sentence',
  ].map(query)

async function fetchTranslation() {
  const userInput = { text: textArea.value, locale: localeArea.value }
  errorArea.innerText = ''
  translatedArea.innerText = ''

  const data = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify(userInput),
    }),
    parsed = await data.json()

  if (parsed.error) return (errorArea.innerText = JSON.stringify(parsed))
  translatedArea.textContent = parsed.translation
}

query('#translate-btn').addEventListener('click', fetchTranslation)
