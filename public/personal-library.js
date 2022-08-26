/*
 *  For #sampleposting to update form action url to test inputs book id
 */
'use strict'
$(() =>
  $('#commentTest').on('submit', function () {
    const _id = $('#idinputtest').val()

    $(this).attr('action', `/api/books/${_id}`)
  })
)
