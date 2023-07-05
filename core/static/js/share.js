let initial_url = decodeURIComponent($(location).attr('href'))
var parts = initial_url.split('/');
var lastSegment = parts.pop() || parts.pop(); // handle potential trailing slash
lastSegment_decoded = atob(lastSegment)
var url = '/api/share/' + lastSegment_decoded + '/'

console.log(url)
$(function () {
    getQuote();
});

function getQuote() {
    $.ajax({
        url: url,
        type: 'get',
        success: successQuoteHandler,
    })
};

function successQuoteHandler(data) {
    console.log(data)
    let quote = data.text;
    let book = data.book
    $(".card-header").html(`From: ${book}`);
    $(".card-text").html(quote);
}