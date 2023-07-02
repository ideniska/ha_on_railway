$(function () {
    let url = window.location.href
    let splited_url = url.split("/")
    let user_id = url.split("/")[4]
    let token = url.split("/")[5]
    let data = {
        "uid": user_id,
        "token": token,
    }
    console.log(user_id, token)
    validateEmail(data)
});



function validateEmail(data) {
    console.log('start validation handler')
    $.ajax({
        url: '/api/activate/',
        type: 'post',
        data: data,
        success: function (data) {
            console.log('success', data);
            window.location.href = '/dashboard/'
        },
        error: function (data) {
            console.log('error', data);
        },
    })
};