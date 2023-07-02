$(function () {
    $("#upload-form").submit(uploadHandler);
    console.log('here')
});



function uploadHandler (event) {
    event.preventDefault()
    console.log('start upload handler')
    let data = new FormData();
    let files = $("#file")[0].files;
    data.append('file', files[0]);
    let type = $("#type").val()
    data.append("type", type)
    $.ajax({
        url: '/api/upload/',
        type: 'post',
        data: data,
        contentType: false,
        processData: false,
        success: function (data) {
            console.log('success',data);
            window.location.href = '/dashboard/'
            },
        error: function (data) {
            console.log('error',data);
            var error = document.getElementById("error");
            $("#upload-error").html("")
            var errors = data.responseJSON;
            for (const [key, value] of Object.entries(errors)) {
                 console.log(`${key}: ${value}`);
                 $("#upload-error").append(`${value} <br>`);
                };
            error.style.color = "red";
            },
    })
};

