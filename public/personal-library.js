'use strict'
$('#commentTest').on('submit', function () {
  const _id = $('#idInputTest').val()

  $(this).attr('action', `/api/books/${_id}`)
})
