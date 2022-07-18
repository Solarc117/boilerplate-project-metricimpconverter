console.clear()
const { log, error } = console

function nullOrObj() {
  const randomNum = Math.random() * 10
  if (randomNum < 3) return null
  return { issues: randomNum < 6 ? null : [] }
}

for (let i = 0; i < 100; i++) {
  const result = nullOrObj()
  log(result, result?.issues)
}
