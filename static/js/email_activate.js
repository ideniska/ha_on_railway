$(function () {
    $("#loginForm").submit(loginHandler)
});


function loginHandler (event) {
    console.log('start login handler')
    let form = $(this)
    event.preventDefault()
    $.ajax({
        url: '/api/login/',
        type: 'post',
        data: form.serialize(),
        success: function (data) {
            console.log('success',data.token);
            window.location.href = '/dashboard-api'
            localStorage.setItem('token', data.token)
            },
        error: function (data) {
            console.log('error',data);
            },
    })
};