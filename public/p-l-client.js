// Regular expression to pick up HTML/XML tags, in case of any cross-site scripting attempts.
const tagRegex = /(?:\<\/?.+\>)/g

$(document).on('ready', function () {
  let items = []
  let itemsRaw = []

  $.getJSON('/api/books', function (data) {
    itemsRaw = data
    $.each(data, function (i, val) {
      items.push(
        '<li class="bookItem" id="' +
          i +
          '">' +
          val.title.replace(tagRegex, '') + // If title in database has HTML tags, remove them.
          ' - ' +
          val.commentcount +
          ' comments</li>'
      )
      return i !== 14
    })
    if (items.length >= 15) {
      items.push('<p>...and ' + (data.length - 15) + ' more!</p>')
    }
    $('<ul/>', {
      id: 'bookList',
      class: 'listWrapper',
      html: items.join(''),
    }).appendTo('#display')
  })

  let comments = []
  $('#display').on('click', 'li.bookItem', function () {
    $('#detailTitle').html(
      '<b>' +
        itemsRaw[this.id].title.replace(tagRegex, '') + // If title in database has HTML tags, remove them.
        '</b> (id: ' +
        itemsRaw[this.id]._id +
        ')'
    )
    $.getJSON('/api/books/' + itemsRaw[this.id]._id, function (data) {
      comments = []
      $.each(data.comments, function (i, val) {
        comments.push('<li>' + val + '</li>')
      })
      comments.push(
        '<br><form id="newCommentForm"><input style="width:300px" type="text" class="form-control" id="commentToAdd" name="comment" placeholder="New Comment"></form>'
      )
      comments.push(
        '<br><button class="btn btn-info addComment" id="' +
          data._id +
          '">Add Comment</button>'
      )
      comments.push(
        '<button class="btn btn-danger deleteBook" id="' +
          data._id +
          '">Delete Book</button>'
      )
      $('#detailComments').html(comments.join(''))
    })
  })

  $('#bookDetail').on('click', 'button.deleteBook', function () {
    $.ajax({
      url: '/api/books/' + this.id,
      type: 'delete',
      success: function (data) {
        //update list
        $('#detailComments').html(
          '<p style="color: red;">' + data + '<p><p>Refresh the page</p>'
        )
      },
    })
  })

  $('#bookDetail').on('click', 'button.addComment', function () {
    let newComment = $('#commentToAdd').val()
    newComment = newComment.replace(tagRegex, '') // Sanitize new comment before adding to the HTML below.
    $.ajax({
      url: '/api/books/' + this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: function (data) {
        comments.unshift(newComment) // Adds new comment to top of list.
        $('#detailComments').html(comments.join(''))
      },
    })
  })

  $('#newBook').on('click', function () {
    $.ajax({
      url: '/api/books',
      type: 'post',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function (data) {
        //update list
      },
    })
  })

  $('#deleteAllBooks').on('click', function () {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function (data) {
        //update list
      },
    })
  })
})
