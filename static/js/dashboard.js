$(function () {
  randomQuote();
});

var current_quote = 0

function randomQuote() {
  $.ajax({
    url: '/api/random/',
    type: 'get',
    success: function (data) {
      console.log("SUCCESS", data);
      var randItem = Math.floor(Math.random() * data.length);
      console.log(data.randItem);
      quote = data[randItem].text;
      comment = data[randItem].comment;
      quote_date = data[randItem].date_added
      book = data[randItem].book
      like = data[randItem].like
      cover_url = data[randItem].cover
      $("#book-title").html('From: ' + book);
      $(".book-cover").html('<img src=' + cover_url + '>');
      $("#quote-text").html('<i class="mdi mdi-format-quote-open font-20"></i>' + quote);
      if (comment) {
        console.log(comment);
        $(".comment-box").html(comment);
        $(".comment-box").css({
          "visibility": "visible",
          "height": "100px",
        })
      };
      $("#date-added").html(quote_date);
      current_quote = data[randItem].quote_id;
      console.log(current_quote);
      $("#like-button").html('<div id="like">' + showCurrentLike(like, current_quote) + '</div>');
      // $("#dashboard-delete").attr('<div id="dash-delete" data-quoteId="' + current_quote + '"><i class="fa-solid fa-ban"></i></div>');
      $("#dashboard-delete").data("quoteid", current_quote)
      $("#dashboard-edit").html('<div id="dash-edit" data-quoteId="' + current_quote + '"><i class="fa-solid fa-pen-to-square"></i></div>');
      $(".dashboard-share").html(
        '<div class="dropdown"><div data-bs-toggle="dropdown" aria-expanded="false" id="dash-share"\
               data-quoteId="' + current_quote + '"><i class="fa-solid fa-share-nodes"></i></div><ul class="dropdown-menu">\
               <li><a class="dropdown-item" href="#">Twitter</a></li><li><a class="dropdown-item" href="#">Facebook</a></li>\
               <li><a class="dropdown-item" href="#">Copy</a></li></ul></div>'
      );

    },
    error: function (error) {
      // $(".card-header").html('');
      // $("#quote-text").html("You don't have any quotes yet.");
      // $(".btn").attr("href", "/upload");
      // $(".btn").html('Click to upload your file');
      console.log(error.response.status)
    }
  });
}


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


// DELETE
$(document).on('click', '#dashboard-delete', function () {
  console.log("Clicked");
  console.log($(this).data("quoteid"));
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
    },
    success: function (data) {
      console.log("Deleted", data);
      window.location.reload();
    },
    error: function (data) {
      console.log("error", data)
    }
  })
}


// SHARE
$(document).on('click', '#dash-share', function () {

  shareQuote($(this).data("quoteid"));

});


function shareQuote(quoteId) {};

// EDIT AND COMMENT
$(document).on('click', '#dash-edit', function () {
  editQuote();
});

// EDIT QUOTE, SHOW COMMENT BOX, SHOW CANCEL & SAVE BUTTONS
function editQuote() {
  $("#quote-text").attr('contenteditable', 'true');
  $(".card-text").html('<h5>Edit:</h5>');
  $("#quote-text").css({
    "background": "#FEFAE0",
  });
  //$(".comment").html('Add note:<div class="comment-box"></div>');
  $(".comment-box").css({
    "visibility": "visible",
    "height": "100px",
  });
  $(".comment-box").attr('contenteditable', 'true');
  $(".comment-box-buttons").css({
    "visibility": "visible",
    "height": "30px",
  });
  // MOVE CANCEL AND SAVE HERE
};

// CANCEL EDIT
$(document).on('click', '#cancel', function () {
  console.log('CANCEL')
  if ($(".comment-box").text().length) {

    $("#quote-text").attr('contenteditable', 'false');
    $(".card-text").html('');
    $("#quote-text").css({
      "background": "white",
    });
    $(".comment-box").attr('contenteditable', 'false');
    $(".comment-box-buttons").css({
      "visibility": "hidden",
      "height": "0",
    });
  } else {
    $("#quote-text").attr('contenteditable', 'false');
    $(".card-text").html('');
    $("#quote-text").css({
      "background": "white",
    });
    $(".comment").html('');
    $(".comment-box").css({
      "visibility": "hidden",
      "height": "0",
    });
    $(".comment-box").attr('contenteditable', 'false');
    $(".comment-box-buttons").css({
      "visibility": "hidden",
      "height": "0",
    });
  }
});

// SAVE EDIT
$(document).on('click', '#save', function () {
  console.log('SAVE')
  sessionStorage.setItem("quote-text", $('#quote-text').html());
  sessionStorage.setItem("note-text", $('.comment-box').html());
  $("#quote-text").attr('contenteditable', 'false');
  $(".card-text").html('');
  $("#quote-text").css({
    "background": "white",
  });
  $(".comment").html('');
  $(".comment-box").css({
    "visibility": "hidden",
    "height": "0",
  });
  $(".comment-box").attr('contenteditable', 'false');
  $(".comment-box-buttons").css({
    "visibility": "hidden",
    "height": "0",
  });
  var editedQuote = sessionStorage.getItem('quote-text');
  var addedNote = sessionStorage.getItem('note-text');
  saveToServer(current_quote, editedQuote, addedNote);
});


function saveToServer(current_quote, editedQuote, addedNote) {
  const csrftoken = getCookie('csrftoken');
  console.log("This is", current_quote)
  $.ajax({
    type: "PUT",
    url: `/api/quote/${current_quote}/update/`,
    headers: {
      "X-CSRFToken": csrftoken
    },
    data: {
      quote_id: current_quote,
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
}