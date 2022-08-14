/*
 *  For #sampleposting to update form action url to test inputs book id
 */
'use strict'
const { log } = console

$(() => {
  $('#commentTest').on('submit', function() {
    let _id = $('#idinputtest').val()
    $(this).attr('action', '/api/books/' + _id)
  })
})
