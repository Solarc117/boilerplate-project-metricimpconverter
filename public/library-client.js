// Regular expression to pick up HTML/XML tags, in case of any cross-site scripting attempts. Credit to @dgdev1024 at Github for catching this vulnerability and coding this regex, and any implementations of it in this file.
const htmlRegex = /(?:\<\/?.+\>)/g
let bookItems = [],
  bookItemsRaw = [],
  comments = []

$(() => {
  function resetBookDetail(eventType) {
    $('#bookDetail').html(
      `<p id="detailTitle">${
        eventType === 'deleted'
          ? 'Delete successful'
          : 'Select a book to see its details and comments'
      }
      <ol id="detailComments"></ol>`
    )
  }
  function updateBookItems() {
    $.getJSON('/api/books', books => {
      bookItemsRaw = books
      bookItems = []
      $.each(bookItemsRaw, (i, book) => {
        bookItems.push(
          // If title in database has HTML tags, remove them.
          `<li 
          class="bookItem" 
          id="${i}"
         >
          ${book.title.replace(htmlRegex, '')} - ${book.commentcount} comments
         </li>`
        )
        return i !== 14
      })
      if (bookItems.length >= 15)
        bookItems.push(`<p>...and ${bookItemsRaw.length - 15} more!</p>`)

      $('#display *').remove()
      $('<ul/>', {
        id: 'bookList',
        class: 'listWrapper',
        html: bookItems.join(''),
      }).appendTo('#display')
    })
  }

  updateBookItems()

  $('#display').on('click', 'li.bookItem', function () {
    resetBookDetail()
    $('#detailTitle').html(
      // If title in database has HTML tags, remove them.
      `<b>${bookItemsRaw[this.id].title.replace(htmlRegex, '')}</b> (id: ${
        bookItemsRaw[this.id]._id
      })`
    )
    $.getJSON(`/api/books/${bookItemsRaw[this.id]._id}`, book => {
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

  $('#bookDetail').on('click', 'button.deleteBook', function (event) {
    event.preventDefault()
    $.ajax({
      url: '/api/books/' + this.dataset._id,
      type: 'delete',
      success() {
        resetBookDetail('deleted')
        updateBookItems()
      },
    })
  })

  $('#bookDetail').on('click', 'button.addComment', function () {
    // Sanitize new comment before adding to the HTML below.
    const newComment = $('#commentToAdd').val().replace(htmlRegex, '')
    $('#commentToAdd').val('')
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

  $('#newBook').on('click', event => {
    event.preventDefault()
    const data = $('#newBookForm').serialize()

    $('#bookTitleToAdd').val('')
    $.ajax({
      url: '/api/books',
      type: 'post',
      dataType: 'json',
      data,
      success(data) {
        console.log(data)
        // const liCount = $('#bookList').children().length
        // $('#bookList').append(
        //   `<li class="bookItem" id="${liCount}">${data.title} - 0 comments</li>`
        // )
        updateBookItems()
      },
      error({ responseJSON: { error } }) {
        alert(error)
      },
    })
  })

  $('#deleteAllBooks').on('click', () => {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      success() {
        $('#display li').remove()
        resetBookDetail('deleted')
      },
    })
  })
})
