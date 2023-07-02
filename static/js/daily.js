$(function () {
    getTenQuotes();
  }

);


function getTenQuotes() {
  $.ajax({

    url: '/api/daily/',
    type: 'get',
    success: function (data) {
      console.log(data);
      if (data.length == 0) {
        $("#quote-text").html("You don't have any quotes yet.");
        $("#quote-text2").html("");
      };
      QuoteListHandler(data);
    },
    error: function () {
      $("#quote-text").html("You don't have any quotes yet.");
      $("#quote-text2").html("");
    }
  })
};


function QuoteListHandler(data) {
  console.log('QuoteListHandler');
  $.each(data, function (i, row) {
    if (row.comment) {
      console.log(row.comment);
      $('.carousel-inner').append(
        '<div class="carousel-item"><div id="' + row.quote_id + '" class="card"><div class="card-header">' + row.book + '</div>\
          <div class="card-body"><h5 class="card-title"></h5><p class="card-text"></p><blockquote class="blockquote mb-0">\
          <p id="quote-text">' + row.text + '</p><footer class="blockquote-footer">' + row.date_added + '<cite title="Source Title">\
          </footer><div class="comment"><div class="comment-box">' + row.comment + '</div></div><div class="comment-box-buttons">\
          <button type="button" id="cancel" class="btn btn-outline-secondary" data-quoteId="' + row.quote_id + '">Cancel</button>\
          <button type="button" id="save" class="btn btn-outline-success" data-quoteId="' + row.quote_id + '">Save</button>\
          </div></blockquote><br><div><div class="like-button" style="display: inline-block;">\
          <div id="like">' + showCurrentLike(row.like, row.quote_id) + '</div></div>\
          <div id="daily-delete" style="display: inline-block;" data-quoteid="' + row.quote_id + '">\
          <i class="fa-solid fa-ban"></i></div>\
          <div class="dashboard-edit" style="display: inline-block;"><div id="dash-edit" data-quoteId="' + row.quote_id + '"><i class="fa-solid fa-pen-to-square"></i></div></div>\
          <div class="dropdown" id="daily-dropdown" style="display: inline-block;">\
          <div data-bs-toggle="dropdown" aria-expanded="false" id="dash-share" data-quoteId="' + row.quote_id + '">\
          <i class="fa-solid fa-share-nodes"></i></div><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Twitter</a>\
          </li><li><a class="dropdown-item" href="#">Facebook</a></li><li><a class="dropdown-item" href="#">Copy</a></li></ul></div>\
          </div></div></div></div>'
      );
      $(".comment-box", "#" + row.quote_id).css({
        "visibility": "visible",
        "height": "100px",
      });
    } else {
      $('.carousel-inner').append(
        '<div class="carousel-item"><div id="' + row.quote_id + '" class="card"><div class="card-header">' + row.book + '</div>\
          <div class="card-body"><h5 class="card-title"></h5><p class="card-text"></p><blockquote class="blockquote mb-0">\
          <p id="quote-text">' + row.text + '</p><footer class="blockquote-footer">' + row.date_added + '<cite title="Source Title">\
          </footer><div class="comment"><div class="comment-box">' + row.comment + '</div></div><div class="comment-box-buttons">\
          <button type="button" id="cancel" class="btn btn-outline-secondary" data-quoteId="' + row.quote_id + '">Cancel</button>\
          <button type="button" id="save" class="btn btn-outline-success" data-quoteId="' + row.quote_id + '">Save</button>\
          </div></blockquote><br><div><div class="like-button" style="display: inline-block;">\
          <div id="like">' + showCurrentLike(row.like, row.quote_id) + '</div></div>\
          <div id="daily-delete" style="display: inline-block;" data-quoteid="' + row.quote_id + '">\
          <i class="fa-solid fa-ban"></i></div>\
          <div class="dashboard-edit" style="display: inline-block;"><div id="dash-edit" data-quoteId="' + row.quote_id + '"><i class="fa-solid fa-pen-to-square"></i></div></div>\
          <div class="dropdown" id="daily-dropdown" style="display: inline-block;">\
          <div data-bs-toggle="dropdown" aria-expanded="false" id="dash-share" data-quoteId="' + row.quote_id + '">\
          <i class="fa-solid fa-share-nodes"></i></div><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Twitter</a>\
          </li><li><a class="dropdown-item" href="#">Facebook</a></li><li><a class="dropdown-item" href="#">Copy</a></li></ul></div></div></div></div></div>'
      );
    };
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
$(document).on('click', '#daily-delete', function () {
  console.log($(this))
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
    },
    success: function (data) {
      console.log("success", data)
      console.log(document.getElementById(quoteId));
      document.getElementById(quoteId).remove();
      $(".carousel-control-next").click();
    },
    error: function (data) {
      console.log("error", data)
    }
  })
}


// TODO use remove() to delete card from a screen after clicking on delete button

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
    },
    error: function (data) {
      console.log("error", data)
    }
  })
};