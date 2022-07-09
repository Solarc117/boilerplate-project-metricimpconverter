console.clear()
const { log, error } = console

function returnLog() {
  return log('hi')
}

log(returnLog())