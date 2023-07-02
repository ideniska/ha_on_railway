$(function () {
  quoteList();
});


// GET FAV QUOTE LIST FROM API AND SHOW IT AS CARDS
function quoteList() {
  $.ajax({
    url: '/api/favorites/',
    type: 'get',
    success: function (data) {
      console.log(data);
      QuoteListHandler(data);
    },
  })
};


function QuoteListHandler(data) {
  console.log('QuoteListHandler');
  $.each(data, function (i, row) {
    let card = `<div class="card" id="${row.quote_id}"><div class="card-body pb-1"><div class="d-flex"><div class="w-100"><div class="dropdown float-end text-muted">\
      <a href="#" class="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false"><i class="mdi mdi-dots-horizontal"></i>\
      </a><div class="dropdown-menu dropdown-menu-end"><a href="javascript:void(0);" class="dropdown-item">Edit</a><a href="javascript:void(0);" class="dropdown-item">Delete</a>\
      </div></div><h5 class="m-0" id="book-title">${row.book}</h5><p class="text-muted" id="date-added"><small>${row.date_added}</small></p></div></div><hr class="m-0" />\
      <div class="font-16 text-center text-dark my-3" id="quote-text"><i class="mdi mdi-format-quote-open font-20"></i> ${row.text}</div><hr class="m-0" />\
      <div class="my-1"><a id="like-button" href="" class="btn btn-sm btn-link text-muted ps-0"><div id="like">${showCurrentLike(row.like, row.quote_id)}</div></a><a href="" class="btn btn-sm btn-link text-muted"><i\
      class='uil uil-comments-alt'></i> Comment</a><a href="" class="btn btn-sm btn-link text-muted"><i class='uil uil-share-alt'></i> Share</a>\
      </div></div></div>`

    if (row.comment) {
      $('.col-xxl-6').append(card)
      $(".comment-box").css({
        "visibility": "visible",
        "height": "100px",
      });
    } else {
      $('.col-xxl-6').append(card);
    }
  });
  return true;
};

function showCurrentLike(like, current_quote) {
  if (like) {
    console.log(current_quote);
    //return '<span class="liked" id ="heart" data-quoteId="' + current_quote + '"><i class="fa fa-heart fa-lg" aria-hidden="true"></i></span>'
    return '<span class="liked" id ="heart" data-quoteId="' + current_quote + '"><i class="ri-heart-fill"></i></span>'
    return ''
  }
  console.log(current_quote);
  return '<span id ="heart" data-quoteId="' + current_quote + '"><i class="ri-heart-line"></i></span>'
};


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
    url: `/api/quote/${quoteId}/like/`,
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


// DELETE BUTTON
$(document).on('click', '#fav-delete', function () {
  deleteQuote($(this).data("quoteid"));
});


function deleteQuote(quoteId) {
  const csrftoken = getCookie('csrftoken');
  console.log("This is", quoteId)
  $.ajax({
    type: "DELETE",
    url: `/api/quote/${quoteId}/delete/`,
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
  $("#quote-text", "#" + quote_id).attr('contenteditable', 'true');
  $(".card-text", "#" + quote_id).html('<h5>Edit:</h5>');
  $("#quote-text", "#" + quote_id).css({
    "background": "#FEFAE0",
  });
  //$(".comment", "#"+quote_id).html('Add note:<div class="comment-box"></div>');
  $(".comment-box", "#" + quote_id).css({
    "visibility": "visible",
    "height": "100px",
  });
  $(".comment-box", "#" + quote_id).attr('contenteditable', 'true');
  $(".comment-box-buttons", "#" + quote_id).css({
    "visibility": "visible",
    "height": "30px",
  });
};

// CANCEL EDIT
$(document).on('click', '#cancel', function () {
  cancelEditQuote($(this).data("quoteid"));
});

function cancelEditQuote(quote_id) {
  if ($(".comment-box").text().length) {
    $("#quote-text", "#" + quote_id).attr('contenteditable', 'false');
    $(".card-text", "#" + quote_id).html('');
    $("#quote-text", "#" + quote_id).css({
      "background": "white",
    });
    $(".comment-box", "#" + quote_id).attr('contenteditable', 'false');
    $(".comment-box-buttons", "#" + quote_id).css({
      "visibility": "hidden",
      "height": "0",
    });
  } else {
    $("#quote-text", "#" + quote_id).attr('contenteditable', 'false');
    $(".card-text", "#" + quote_id).html('');
    $("#quote-text", "#" + quote_id).css({
      "background": "white",
    });
    $(".comment", "#" + quote_id).html('');
    $(".comment-box", "#" + quote_id).css({
      "visibility": "hidden",
      "height": "0",
    });
    $(".comment-box", "#" + quote_id).attr('contenteditable', 'false');
    $(".comment-box-buttons", "#" + quote_id).css({
      "visibility": "hidden",
      "height": "0",
    });
  }

};

// SAVE EDIT
$(document).on('click', '#save', function () {
  saveEditQuote($(this).data("quoteid"));
});

function saveEditQuote(quote_id) {
  sessionStorage.setItem("quote-text", $('#quote-text', "#" + quote_id).html());
  sessionStorage.setItem("note-text", $('.comment-box', "#" + quote_id).html());
  $("#quote-text", "#" + quote_id).attr('contenteditable', 'false');
  $(".card-text", "#" + quote_id).html('');
  $("#quote-text", "#" + quote_id).css({
    "background": "white",
  });
  $(".comment", "#" + quote_id).html('');
  $(".comment-box", "#" + quote_id).css({
    "visibility": "hidden",
    "height": "0",
  });
  $(".comment-box", "#" + quote_id).attr('contenteditable', 'false');
  $(".comment-box-buttons", "#" + quote_id).css({
    "visibility": "hidden",
    "height": "0",
  });
  var editedQuote = sessionStorage.getItem('quote-text');
  var addedNote = sessionStorage.getItem('note-text');
  saveToServer(quote_id, editedQuote, addedNote);
};


function saveToServer(quote_id, editedQuote, addedNote) {
  const csrftoken = getCookie('csrftoken');
  console.log("This is", quote_id)
  $.ajax({
    type: "PUT",
    url: `/api/quote/${quote_id}/update/`,
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
      window.location.reload();
    },
    error: function (data) {
      console.log("error", data)
    }
  })
};