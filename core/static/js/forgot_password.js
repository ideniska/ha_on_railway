$(function () {
    $("#passwordRestoreForm").submit(forgotPasswordHandler);
});



function forgotPasswordHandler(event) {
    console.log('start password handler')
    let form = $(this)
    console.log(form.serialize())
    event.preventDefault()
    $.ajax({
        url: '/api/restore/',
        type: 'post',
        data: form.serialize(),
        success: function (data) {
            console.log('success', data);
            window.location.href = '/check-email-for-password/'
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