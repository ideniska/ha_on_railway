$(function () {
    $("#loginForm2").submit(loginHandler);
});



// function loginHandler (event) {
//     console.log('start login handler')
//     let form = $(this)
//     console.log(form.serialize())
//     event.preventDefault()
//     $.ajax({
//         url: '/api/login/',
//         type: 'post',
//         data: form.serialize(),
//         success: function (data) {
//             console.log('success',data);
//             window.location.href = '/dashboard/'
//             },
//         error: function (data) {
//             console.log('error',data);
//             var error = document.getElementById("error");
//             $("#error").html("")
//             var errors = data.responseJSON;
//             for (const [key, value] of Object.entries(errors)) {
//                  console.log(`${key}: ${value}`);
//                  $("#error").append(`${value} <br>`);
//                 };
//             error.style.color = "red";
//             },
//     })
// };