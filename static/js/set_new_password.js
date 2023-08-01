$(function () {
    $("#passwordForm").submit(setPasswordHandler);
});



function setPasswordHandler(event) {
    let url = window.location.href
    let splited_url = url.split("/")
    let uid = url.split("/")[4]
    let token = url.split("/")[5]
    let data = {
        "uid": uid,
        "token": token,
        "password": $("input[name=password1]").val(),
        "password2": $("input[name=password2]").val(),
    }
    console.log(uid, token)
    console.log('start set pass handler')
    console.log(data)
    event.preventDefault()
    $.ajax({
        url: '/api/set-new-password/',
        type: 'post',
        data: data,
        success: function (data) {
            console.log('success', data);
            window.location.href = '/login/'
        },
        error: function (data) {
            console.log('error', data);
            var error = document.getElementById("error");
            $("#register-error").html("")
            var errors = data.responseJSON;
            for (const [key, value] of Object.entries(errors)) {
                console.log(`${key}: ${value}`);
                $("#register-error").append(`${value} <br>`);
            };
            error.style.color = "red";
        },
    })
};