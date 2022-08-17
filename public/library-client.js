// Regular expression to pick up HTML/XML tags, in case of any cross-site scripting attempts.
const tagRegex = /(?:\<\/?.+\>)/g

$(document).on('ready', function () {
  let items = []
  let itemsRaw = []

  $.getJSON('/api/books', data => {
    itemsRaw = data
    $.each(data, (i, val) => {
      items.push(
        // If title in database has HTML tags, remove them.
        `<li 
          class="bookItem" 
          id="${i}"
         >
          ${val.title.replace(tagRegex, '')} - ${val.commentcount} comments
         </li>`
      )
      return i !== 14
    })
    if (items.length >= 15)
      items.push(`<p>...and ${data.length - 15} more!</p>`)

    $('<ul/>', {
      id: 'bookList',
      class: 'listWrapper',
      html: items.join(''),
    }).appendTo('#display')
  })

  let comments = []
  $('#display').on('click', 'li.bookItem', function () {
    $('#detailTitle').html(
      // If title in database has HTML tags, remove them.
      `<b>${itemsRaw[this.id].title.replace(tagRegex, '')}</b> (id: ${
        itemsRaw[this.id]._id
      })`
    )
    $.getJSON(`/api/books/${itemsRaw[this.id]._id}`, book => {
      comments = book.comments.map(comment => `<li>${comment}</li>`)
      $('#detailComments').html(comments.join(''))
      $('#bookDetail').append(
        `<br />
        <form id="newCommentForm">
          <input
            style="width: 300px"
            type="text"
            class="form-control"
            id="commentToAdd"
            name="comment"
            placeholder="New Comment"
          />
        </form>
        <br />
        <button
          class="btn btn-info addComment"
          id="addComment"
          data-_id="${book._id}"
        >
          Add Comment
        </button>
        <button
          class="btn btn-danger deleteBook"
          id="deleteBook"
          data-_id="${book._id}"
        >
          Delete Book
        </button>`
      )
    })
  })

  $('#bookDetail').on('click', 'button.deleteBook', function () {
    $.ajax({
      url: '/api/books/' + this.dataset._id,
      type: 'delete',
      success() {
        $('#detailComments li').remove()
        for (const text of ['Delete successful', 'Refresh the page'])
          $('#detailComments').append(`<p>${text}</p>`)
      },
    })
  })

  $('#bookDetail').on('click', 'button.addComment', function () {
    // Sanitize new comment before adding to the HTML below.
    const newComment = $('#commentToAdd').val().replace(tagRegex, '')
    $.ajax({
      url: '/api/books/' + this.dataset._id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      // This data already contains an array with the updated comments, but the fCC team is using the comments array variable, so I'll keep using that.
      success(data) {
        comments.push(`<li>${newComment}</li>`)
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
      success(data) {
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
