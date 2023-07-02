$(function () {
  bookList();
});

var requestedPage = false;

// GET BOOK LIST FROM API AND SHOW IT AS A TABLE
function bookList() {
  $.ajax({
    url: $('.datarows').attr('data-href'),
    type: 'get',
    success: function (data) {
      if (BookListHandler(data)) requestedPage = false;
    },
  })
};


$(window).scroll(function () {
  var pagination = $(".datarows")
  // console.log($(this).height(), $(this).scrollTop() , pagination.height());
  console.log(pagination.height() - $(this).height(), $(this).scrollTop());
  // console.log(pagination.height() - $(this).height() <= $(this).scrollTop() && !requestedPage);
  if (pagination.height() - $(this).height() <= $(this).scrollTop() && !requestedPage) {
    let nextUrl = $('.datarows').attr('data-href')
    console.log('NEXT URL', nextUrl)
    if (nextUrl) {
      requestedPage = true;
      //console.log($(this).height(), $(this).scrollTop() , pagination.height());
      console.log('True')
      bookList();
    } else {
      requestedPage = true;
    };
  };
})

function BookListHandler(data) {
  console.log('BookListHandler');
  for (row of data.results) {
    $('.datarows').attr('data-href', data.next);
    $('.datarows').append('<tr class="infinite-item"><td><a href="' + row.book_id + '">' + row.title + '</a></td><td>' + row.quotes_count + '</td><td>' + bookVisibility(row.visibility, row.book_id) + '</td></tr>');
  }
  $(".book-switch").change(change_visibility)
  // $.each(data.results, function (i, row) {
  //   $('.datarows').attr('data-href', data.next);
  //   $('.datarows').append('<tr class="infinite-item"><td><a href="'+row.book_id+'">'+row.title+'</a></td><td>'+row.quotes_count+'</td><td>'+bookVisibility(row.visibility, row.book_id)+'</td></tr>');
  //   });
  return true;
};


function bookVisibility(visibility, book_id) {
  if (visibility) {
    return `<div><input class="book-switch" data-bookId="${book_id}" type="checkbox" id="switch${book_id}" checked data-switch="success"/><label for="switch${book_id}" data-on-label="Yes" data-off-label="No" class="mb-0 d-block"></label></div>`

  }
  return `<div><input class="book-switch" data-bookId="${book_id}" type="checkbox" id="switch${book_id}" data-switch="success"/><label for="switch${book_id}" data-on-label="Yes" data-off-label="No" class="mb-0 d-block"></label></div>`
};


// function bookVisibility (visibility, book_id) {
//   if (visibility) {
//     return '<div class="form-check form-switch"><input data-bookId="'+book_id+'"class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked></div>';
//   }
//   return '<div class="form-check form-switch"><input data-bookId="'+book_id+'"class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault"></div>';
// };

// SAVE CHANGED BOOK VISIBILITY TO DB
function change_visibility(event) {
  const csrftoken = getCookie('csrftoken');
  let input = $(this)
  let bookId = input.data("bookid")
  console.log("This is", bookId)
  $.ajax({
    type: "POST",
    url: `/api/book/${bookId}/visibility/`,
    data: {
      book_id: bookId,
      csrfmiddlewaretoken: csrftoken,
    },
    success: function (data) {
      console.log("success", data)
    },
    error: function (data) {
      console.log("error", data)
    }
  })
}

// var infinite = new Waypoint.Infinite({
//   element: $('.infinite-container')[0]
// });