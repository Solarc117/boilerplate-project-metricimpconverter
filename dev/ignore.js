console.clear()
const { log, error } = console

function isWholeNum(num) {
  return num % 1 === 0
}

// Iterate from 1 to the number passed, rounded down.
// For each of those numbers, log the number divided by that number as well.
function factor(num, sum) {
  for (let denom = 1; denom < Math.floor(num / 2); denom++) {
    const rem = num / denom

    if (!isWholeNum(rem)) continue

    log(denom, rem)
  }
}

const date = new Date(),
  strFromDate = date.toString()
let dateFromStr
// setTimeout(() => {
//   dateFromStr = new Date(strFromDate)
//   log(date)
//   log(strFromDate)
//   log(dateFromStr)
// }, 2000)

// I'm hoping that dateFromStr will be the same as date; this would mean I can switch from date instances to date strings, and back.

log(date)
log(date.toDateString())
log(date.toTimeString())
log(date.toUTCString())
