console.clear()
const { log, error } = console

const obj = {
  _id: 'abc',
  b: 'b  ',
  c: null,
  d: 2,
}

log(obj, 'BEFORE')

delete obj._id

log(obj, 'AFTER')
