/*
 *  For #sampleposting to update form action url to test inputs book id
 */
$(function () {
  $('#commentTest').on('submit', () => {
    let id = $('#idinputtest').val()
    $(this).attr('action', '/api/books/' + id)
  })
})
