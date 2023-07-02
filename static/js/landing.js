$("#signin").click(function () {
    $(".login-popup").addClass(".active");
  })
  $(window).click(function () {
    $(".login-popup").removeClass(".active");
  });
