var requestedPage = false;
var parts = $(location).attr('href').split('/');
var lastSegment = parts.pop() || parts.pop(); // handle potential trailing slash
var url = '/api/by-book/' + lastSegment + '/'

$(function () {
  bookList();
});

function bookList() {
  $.ajax({
    url: url,
    type: 'get',
    success: function (data) {
      console.log(data);
      if (QuoteListHandler(data)) requestedPage = false;
    },
  })
};

$(window).scroll(function () {
  var pagination = $(".datarows")
  console.log($(this).height() / 3, $(this).scrollTop(), pagination.height() / 3)
  if ($(this).scrollTop() > pagination.height() / 3 && !requestedPage) {
    url = $('.datarows').attr('data-href');
    console.log('NEXT URL', url);
    requestedPage == true;
    if (url) {
      bookList();
    }
  }
});


function QuoteListHandler(data) {
  console.log('QuoteListHandler');
  // for (row of data.results) {
  //     $('.datarows').attr('data-href', data.next);
  //     $('.datarows').append('<tr class="infinite-item"><td><a href="'+row.book_id+'">'+row.title+'</a></td><td>'+row.quotes_count+'</td><td>'+bookVisibility(row.visibility, row.book_id)+'</td></tr>');
  // }
  $('.datarows').attr('data-href', data.next);
  $(".book-title").html(data.results[0].book);

  $.each(data.results, function (i, row) {
    if (row.comment) {
      $('.datarows').append(
        '<tr id="' + row.quote_id + '"><td><div id="quote-text">' + row.text + '</div>\
        <div class="comment" data-quoteId="' + row.quote_id + '"><div class="comment-box" quoteId="' + row.quote_id + '">' + row.comment + '</div></div><div class="comment-box-buttons" data-quoteId="' + row.quote_id + '">\
          <button type="button" id="cancel" class="btn btn-outline-secondary" data-quoteId="' + row.quote_id + '">Cancel</button>\
          <button type="button" id="save" class="btn btn-outline-success" data-quoteId="' + row.quote_id + '">Save</button></div></td>\
        <td>' + row.date_added + '</td><td id="like">' + showCurrentLike(row.like, row.quote_id) + '<div id="delete" data-quoteId="' + row.quote_id + '">\
        <i class="fa-solid fa-ban"></i></div>\
        <div class="dashboard-edit"><div id="dash-edit" data-quoteId="' + row.quote_id + '"><i class="fa-solid fa-pen-to-square"></i></div></div>\
        <div class="dropdown" id="book-page-dropdown" style="display: inline-block;"><div data-bs-toggle="dropdown" aria-expanded="false" id="shareButton" data-bs-toggle="popover" data-bs-content="Link copied" data-quoteId="' + row.quote_id + '">\
        <i class="fa-solid fa-share-nodes"></i></div><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Twitter</a></li><li><a class="dropdown-item" href="#">Facebook</a>\
        </li><li><a class="dropdown-item" href="#">Copy</a></li></ul></div></div></div></td></tr>'
      );
      $(".comment-box", "#" + row.quote_id).css({
        "visibility": "visible",
        "height": "auto",
      });
    } else {
      $('.datarows').append(
        '<tr id="' + row.quote_id + '"><td><div id="quote-text">' + row.text + '</div>\
        <div class="comment" data-quoteId="' + row.quote_id + '"><div class="comment-box" data-quoteId="' + row.quote_id + '">' + row.comment + '</div></div><div class="comment-box-buttons" data-quoteId="' + row.quote_id + '">\
          <button type="button" id="cancel" class="btn btn-outline-secondary" data-quoteId="' + row.quote_id + '">Cancel</button>\
          <button type="button" id="save" class="btn btn-outline-success" data-quoteId="' + row.quote_id + '">Save</button></div></td>\
        <td>' + row.date_added + '</td><td id="like">' + showCurrentLike(row.like, row.quote_id) + '<div id="delete" data-quoteId="' + row.quote_id + '">\
        <i class="fa-solid fa-ban"></i></div>\
        <div class="dashboard-edit"><div id="dash-edit" data-quoteId="' + row.quote_id + '"><i class="fa-solid fa-pen-to-square"></i></div></div>\
        <div style="display: inline-block;"><div aria-expanded="false" id="shareButton" data-bs-toggle="popover" data-bs-content="Link copied" data-quoteId="' + row.quote_id + '">\
        <i class="fa-solid fa-share-nodes"></i></div><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Twitter</a></li><li><a class="dropdown-item" href="#">Facebook</a>\
        </li><li><a class="dropdown-item" href="#">Copy</a></li></ul></div></div></div></td></tr>'
      );
      $(".comment-box", "#" + row.quote_id).css({
        "visibility": "hidden",
        "height": "0",
      });
    }
  });
  return true;
};


function showCurrentLike(like, quoteId) {
  if (like) {
    return '<span class="liked" id ="heart" data-quoteId="' + quoteId + '"><i class="fa fa-heart fa-lg" aria-hidden="true"></i></span>'
  }
  return '<span id ="heart" data-quoteId="' + quoteId + '"><i class="fa fa-heart-o fa-lg" aria-hidden="true"></i></span>'
};


// DELETE
$(document).on('click', '#delete', function () {
  deleteQuote($(this).data("quoteid"));
});

// LIKE
$(document).on('click', '#heart', function () {
  if ($(this).hasClass("liked")) {
    $(this).html('<i class="fa fa-heart-o fa-lg" aria-hidden="true"></i>');
    $(this).removeClass("liked");
    changeLikeStatus($(this).data("quoteid"));
  } else {
    $(this).html('<i class="fa fa-heart fa-lg" aria-hidden="true"></i>');
    $(this).addClass("liked");
    changeLikeStatus($(this).data("quoteid"));
  }
});


function changeLikeStatus(quoteId) {
  const csrftoken = getCookie('csrftoken');
  console.log("This is", quoteId)
  $.ajax({
    type: "POST",
    url: `/api/q2/${quoteId}/like/`,
    data: {
      quote_id: quoteId,
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


function deleteQuote(quoteId) {
  const csrftoken = getCookie('csrftoken');
  console.log("This is", quoteId)
  $.ajax({
    type: "DELETE",
    url: `/api/q/${quoteId}/`,
    headers: {
      "X-CSRFToken": csrftoken
    },
    data: {
      quote_id: quoteId,
      csrfmiddlewaretoken: csrftoken,
    },
    success: function (data) {
      console.log("success", data);
      window.location.reload();
    },
    error: function (data) {
      console.log("error", data)
    }
  })
}


// EDIT AND COMMENT
$(document).on('click', '#dash-edit', function () {
  editQuote($(this).data("quoteid"));
});

// EDIT QUOTE, SHOW COMMENT BOX, SHOW CANCEL & SAVE BUTTONS
function editQuote(quote_id) {
  $("#" + quote_id).attr('contenteditable', 'true');
  $("#" + quote_id).css({
    "background": "#FEFAF0",
  });
  //$(".comment", "#"+quote_id).html('Add note:<div class="comment-box"></div>');
  $('.comment-box', "#" + quote_id).css({
    "visibility": "visible",
    "height": "100px",
  });
  $('.comment-box', "#" + quote_id).attr('contenteditable', 'true');
  $('.comment-box-buttons', "#" + quote_id).css({
    "visibility": "visible",
    "height": "30px",
  });

  console.log('SET:', quote_id, $(".comment-box", "#" + quote_id).text());
  localStorage.setItem(quote_id, $(".comment-box", "#" + quote_id).text());
};

// CANCEL EDIT
$(document).on('click', '#cancel', function () {
  cancelEditQuote($(this).data("quoteid"));
});

function cancelEditQuote(quote_id) {
  $("#" + quote_id).attr('contenteditable', 'false');
  $("#" + quote_id).css({
    "background": "#F2F5F8",
  });
  $('.comment-box', "#" + quote_id).attr('contenteditable', 'false');
  $('.comment-box-buttons', "#" + quote_id).css({
    "visibility": "hidden",
    "height": "0",
  });

  // get initial comment text from local storage and put it back into comment-box
  console.log('GET:', quote_id, $(".comment-box", "#" + quote_id).text());
  $(".comment-box", "#" + quote_id).text(localStorage.getItem(quote_id));
  if (!$(".comment-box", "#" + quote_id).text().length) {
    $(".comment-box", "#" + quote_id).css({
      "visibility": "hidden",
      "height": "0",
    });
  };

};

// SAVE EDIT
$(document).on('click', '#save', function () {
  saveEditQuote($(this).data("quoteid"));
});

function saveEditQuote(quote_id) {
  localStorage.setItem("quote-text", $('#quote-text', "#" + quote_id).html());
  console.log($('.comment-box', "#" + quote_id).html())
  localStorage.setItem("note-text", $('.comment-box', "#" + quote_id).html());
  $("#" + quote_id).attr('contenteditable', 'false');
  $("#" + quote_id).css({
    "background": "#F2F5F8",
  });

  if (!$(".comment-box", "#" + quote_id).text().length) {
    $(".comment-box").css({
      "visibility": "hidden",
      "height": "0",
    });
  };

  $(".comment-box", "#" + quote_id).attr('contenteditable', 'false');
  $(".comment-box-buttons", "#" + quote_id).css({
    "visibility": "hidden",
    "height": "0",
  });
  var editedQuote = localStorage.getItem('quote-text');
  var addedNote = localStorage.getItem('note-text');
  saveToServer(quote_id, editedQuote, addedNote);
};


function saveToServer(quote_id, editedQuote, addedNote) {
  const csrftoken = getCookie('csrftoken');
  console.log("This is", quote_id)
  $.ajax({
    type: "PUT",
    url: `/api/q/${quote_id}/`,
    headers: {
      "X-CSRFToken": csrftoken
    },
    data: {
      quote_id: quote_id,
      text: editedQuote,
      comment: addedNote,
    },
    success: function (data) {
      console.log("success", data);

    },
    error: function (data) {
      console.log("error", data)
    }
  })
};

// SHARE
$(document).on('click', '#shareButton', function () {
  shareQuote($(this).data("quoteid"));
});


$(document).on('click', '[data-bs-toggle="popover"]', function () {
  $(this).popover('toggle');
});

function shareQuote(quoteId) {
  console.log(quoteId)
  let encodedID = btoa(quoteId);
  console.log(encodedID)
  //popup.classList.toggle("show");
  let quote_url = 'http://127.0.0.1:8000/share/' + encodedID
  console.log(quote_url)

  navigator.clipboard.writeText(quote_url);
};