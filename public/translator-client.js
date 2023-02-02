// @ts-ignore
const query = document.querySelector.bind(document),
  [translateForm, errorArea, translatedArea] = [
    '#translate-form',
    '#error-msg',
    '#translated-sentence',
  ].map(query),
  TRANSLATOR_API = '/api/translate'
async function fetchTranslation(event) {
  event.preventDefault()
  errorArea.textContent = ''
  translatedArea.textContent = ''
  // @ts-ignore
  const data = new FormData(translateForm),
    text = data.get('text'),
    locale = data.get('locale'),
    apiUrl = new URL(TRANSLATOR_API, window.location.href)
  // @ts-ignore
  apiUrl.searchParams.set('locale', locale)

  const response = await fetch(apiUrl.href, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ text }),
    }),
    parsed = await response.json()

  if (parsed.error) return (errorArea.textContent = JSON.stringify(parsed))
  translatedArea.textContent = parsed.translation
}

translateForm.addEventListener('submit', fetchTranslation)
