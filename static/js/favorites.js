$(function () {
  quoteList();
});


// GET FAV QUOTE LIST FROM API AND SHOW IT AS CARDS
function quoteList() {
  $.ajax({
    url: '/api/q2/liked/',
    type: 'get',
    success: function (data) {
      console.log(data);
      QuoteListHandler(data);
    },
    error: function (data) {
      console.log("Error");
      QuoteListHandler(data);
    },
  })
};




function QuoteListHandler(data) {
  if (data.length == 0) {
    console.log('No quotes');
    $('.col-xxl-6').append(`<div class="card""><div class="card-body pb-1"><div class="d-flex"><div class="w-100"><div class="dropdown float-end text-muted">\
    </div></div><h5 class="m-0"</h5></div></div>\
    <p class="card-text"></p><div class="font-16 text-center text-dark my-3" ><i class="mdi mdi-cards-heart-outline"></i> You don't have any liked quotes yet. </div><p class="comment-text""></p>\
    <div class="my-1"></div></div></div>`)
  };

  $.each(data.results, function (i, row) {
    let card = `<div class="card" id="${row.quote_id}">
                  <div class="card-body pb-1">
                    <div class="d-flex">
                      <div class="w-100">
                        <div class="dropdown float-end text-muted">
                          <a href="#" class="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="mdi mdi-dots-horizontal"></i>
                          </a>
                          <div class="dropdown-menu dropdown-menu-end">
                            <a class="dropdown-item" id="dashboard-edit" data-quoteid=${row.quote_id}>Edit</a>
                            <a class="dropdown-item" id="dashboard-delete" data-quoteid=${row.quote_id}>Delete</a>
                          </div>
                        </div>
                        <h5 class="m-0" id="book-title">From: <a href="/by-book-api/${row.book_id}">${row.book}</a></h5>
                        <p class="text-muted" id="date-added"><small>${row.date_added}</small></p>
                      </div>
                    </div>
                    <hr class="m-0" />
                    <p class="card-text" data-quoteid="${row.quote_id}"></p>
                  <div class="font-16 text-center text-dark my-3" >
                  <i class="mdi mdi-format-quote-open font-20"></i><span id="quote-text" data-quoteid=${row.quote_id}> ${row.text}</span>
                </div>
                <p class="comment-text" data-quoteid="${row.quote_id}"></p>
                <div class="comment-box" data-quoteid="${row.quote_id}"></div>
                <hr class="m-0" />
                <div class="my-1">
                  <a id="like-button" href="" class="btn btn-sm btn-link text-muted ps-0">
                  <div id="like">${showCurrentLike(row.like, row.quote_id)}</div>
                  </a>
                  <a class="btn btn-sm btn-link text-muted" id="shareButton" data-quoteid="${row.quote_id}" data-bs-toggle="popover" data-bs-content="Link copied"><i class='uil uil-share-alt'></i> Share</a>
                  <span class="comment-box-buttons">
                    <a class="btn btn-sm btn-link text-muted comment-box-buttons" id="cancel" data-quoteid="${row.quote_id}">
                    <i class='uil uil-times'></i> Cancel
                    </a>
                    <a class="btn btn-sm btn-link text-muted comment-box-buttons" id="save" data-quoteid="${row.quote_id}">
                      <i class='uil uil-bookmark'></i>Save
                    </a></span>
                </div>
              </div>
            </div>`
    $('.col-xxl-6').append(card)
    if (row.comment) {
      console.log(row.comment)
      $(".comment-box", '#' + row.quote_id).html(row.comment);
      $(".comment-box", '#' + row.quote_id).css({
        "visibility": "visible",
        "height": "100px",
      });
    };
  });
  return true;
};

function showCurrentLike(like, current_quote) {
  if (like) {
    console.log(current_quote);
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


// DELETE BUTTON
$(document).on('click', '#dashboard-delete', function () {
  deleteQuote($(this).attr("data-quoteid"));
});


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
$(document).on('click', '#dashboard-edit', function () {
  editQuote($(this).attr("data-quoteid"));
});

// EDIT QUOTE, SHOW COMMENT BOX, SHOW CANCEL & SAVE BUTTONS
function editQuote(quote_id) {
  $("#quote-text", "#" + quote_id).attr('contenteditable', 'true');
  $(".card-text", "#" + quote_id).html('<h5>Edit:</h5>');
  $(".comment-text", "#" + quote_id).html('<h5>Comment:</h5>');
  $("#quote-text", "#" + quote_id).css({
    "background": "#FEFAE0",
  });
  $(".comment-box", "#" + quote_id).css({
    "visibility": "visible",
    "height": "100px",
  });
  $(".comment-box", "#" + quote_id).attr('contenteditable', 'true');
  $(".comment-box-buttons", "#" + quote_id).css({
    "visibility": "visible",
    "height": "30px",
  });

  // save initial comment into local storage
  localStorage.setItem(quote_id, $(".comment-box", "#" + quote_id).text());
};


// CANCEL EDIT
$(document).on('click', '#cancel', function () {
  cancelEditQuote($(this).attr("data-quoteid"));
});

function cancelEditQuote(quote_id) {

  $("#quote-text", "#" + quote_id).attr('contenteditable', 'false');
  $(".card-text", "#" + quote_id).html('');
  $(".comment-text", "#" + quote_id).html('');
  $("#quote-text", "#" + quote_id).css({
    "background": "white",
  });
  $(".comment-box", "#" + quote_id).attr('contenteditable', 'false');
  $(".comment-box-buttons", "#" + quote_id).css({
    "visibility": "hidden",
    "height": "0",
  });

  // get initial comment text from local storage and put it back into comment-box
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
  saveEditQuote($(this).attr("data-quoteid"));
});

function saveEditQuote(quote_id) {
  localStorage.setItem("quote-text", $('#quote-text', "#" + quote_id).html());
  localStorage.setItem("note-text", $('.comment-box', "#" + quote_id).html());
  $("#quote-text", "#" + quote_id).attr('contenteditable', 'false');
  $(".card-text", "#" + quote_id).html('');
  $("#quote-text", "#" + quote_id).css({
    "background": "white",
  });
  $(".comment", "#" + quote_id).html('');
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
      window.location.reload();
    },
    error: function (data) {
      console.log("error", data)
    }
  })
};

// SHARE
$(document).on('click', '#shareButton', function () {
  shareQuote($(this).attr("data-quoteid"));
});

//let popup = document.getElementById("sharePopup");
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