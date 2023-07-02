// $(function () {
//     subscriptionPeriod();
// });


// function subscriptionPeriod() {
//     $.ajax({
//         url: '/api/orders/',
//         type: 'get',
//         success: function (data) {
//             console.log("SUCCESS", data);
//             $("#paidPeriod").html('Paid until:' + data["payment_date"]);
//         },
//         error: function (data) {
//             console.log('error', data);
//         }
//     });
// }