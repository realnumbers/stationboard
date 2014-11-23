var iconStar = "img/star.svg";
var iconNostar = "img/nostar.svg";
var iconSearch = "img/search.svg";

$(document).ready(function() {

  // Initialize

  $(".bus-list").hide();
  $(".station").removeClass("expanded");

  // User Events

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
      $(this).parents(".station").remove();
      return false;
    } else {
      // Add new Favorite
      $(this).attr("src", iconStar);
      $(this).removeClass("nostar").addClass("star");
      $(this).addClass("js-starred");
      $(".favorites").append($(this).parents(".station").clone());
      return false;
    }
  });

});
