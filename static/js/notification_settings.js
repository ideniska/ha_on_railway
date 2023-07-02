$(function () {
    getSettings();
});

function getSettings() {
    $.ajax({
        url: '/api/notifications-settings/',
        type: 'get',
        success: function (data) {
            console.log("SUCCESS", data);
            var email_option = data["send_emails"];
            var telegram_option = data["send_telegrams"];
            console.log(email_option);
            if (email_option == 1) {
                $("#emailSetting").html('<option value="1" selected>Daily</option><option value="2">Weekly (Monday)</option><option value="3">Disabled</option>')
            } else if (email_option == 2) {
                $("#emailSetting").html('<option value="1">Daily</option><option value="2" selected>Weekly (Monday)</option><option value="3">Disabled</option>')
            } else {
                $("#emailSetting").html('<option value="1">Daily</option><option value="2">Weekly (Monday)</option><option value="3" selected>Disabled</option>')
            };
            if (telegram_option == 1) {
                $("#telegramSetting").html('<option value="1" selected>Daily</option><option value="2">Weekly (Monday)</option><option value="3">Disabled</option>')
            } else if (telegram_option == 2) {
                $("#telegramSetting").html('<option value="1">Daily</option><option value="2" selected>Weekly (Monday)</option><option value="3">Disabled</option>')
            } else {
                $("#telegramSetting").html('<option value="1">Daily</option><option value="2" >Weekly (Monday)</option><option value="3" selected>Disabled</option>')
            };
        },
        error: function (error) {
            console.log(error.response.status)
        }
    });
}

$(document).on('click', '#save-settings', function () {
    data = {
        "send_emails": $("#emailSetting").find(":selected").val(),
        "send_telegrams": $("#telegramSetting").find(":selected").val(),
    };
    saveToServer(data);
});


function saveToServer(data) {
    const csrftoken = getCookie('csrftoken');
    $.ajax({
        type: "PUT",
        url: `/api/notifications-settings/`,
        headers: {
            "X-CSRFToken": csrftoken
        },
        data: data,
        success: function (data) {
            console.log("success", data);
        },
        error: function (data) {
            console.log("error", data)
        }
    })
}