$(function () {
    $("#registerForm").submit(registerHandler);
});



function registerHandler (event) {
    console.log('start register handler')
    let form = $(this)
    console.log(form.serialize())
    event.preventDefault()
    $.ajax({
        url: '/api/register/',
        type: 'post',
        data: form.serialize(),
        success: function (data) {
            console.log('success',data);
            window.location.href = '/activation/'
            },
        error: function (data) {
            console.log('error',data);
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

