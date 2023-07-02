$(function () {
    $("#logout").click(logoutHandler);
});



function logoutHandler() {
    console.log('start logout handler');
    $.ajax({
        url: '/api/logout/',
        type: 'post',
        data: {},
        success: function (data) {
            console.log('success', data);
            window.location.href = '/landing'
        },
        error: function (data) {
            console.log('error', data);
        },
    })
};