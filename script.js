var iconStar = "img/star.svg";
var iconNostar = "img/notstar.svg";
var iconSearch = "img/search.svg";

$(document).ready(function() {

  $(".bus-list").hide();
  $(".station").removeClass("expanded");

  $(".station").click(function() {
    if ($(this).hasClass("expanded")) {
      $(this).children(".bus-list").slideUp(200);
      $(this).removeClass("expanded");
    } else {
      $(this).children(".bus-list").slideDown(200);
      $(this).addClass("expanded");
    }
  });

  $(".station-star").click(function() {
    if ($(this).hasClass("js-starred")) {
      // Remove Favorite
      $(this).attr("src", iconNostar);
      $(this).removeClass("js-starred");
      $(this).parents(".station").delay(300).remove();
    } else {
      // Add new Favorite
      $(this).attr("src", iconStar);
      $(this).addClass("js-starred");
      $(".favorites").append($(this).parents(".station"));
    }
  });

});
