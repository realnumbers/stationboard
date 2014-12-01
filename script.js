var iconStar = "img/star.svg";
var iconNostar = "img/nostar.svg";
var iconSearch = "img/search.svg";


loadBusstopsList();

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

$(".js-search").bind("input", function() {
  var suggests = matchInput(getBusstopList(), $(".js-search").val());
  console.log(suggests);
  printSuggests(suggests);
});

//match input with busstops name and citys
function matchInput(list, input) {
  input = input.split(" ");
  var suggests = new Array();
  var found;
  var j;
  for (var i = 0; i < list.length && suggests.length < 3; i++) {
    j = 0;
    do {
      if (input[j] != "") {
        found = list[i].ORT_GEMEINDE.match(new RegExp(input[j], "i"));
        if (found == null)
          found = list[i].ORT_NAME.match(new RegExp(input[j], "i"));
      }
      j++;
    } while (j < input.length && found != null);
    if (found != null)
      suggests[suggests.length] = list[i];
  }
  return suggests;
}

//output suggests
function printSuggests(suggests) {
  if (suggests.length > 0)
    printNext($(".search-results").find(".station:first"), suggests, 0);
}

function printNext(el, suggests, i) {
  el.find(".station-title").text(suggests[i].ORT_NAME);
  if (el.next(".station").length != 0 && suggests[i + 1] != undefined)
    printNext(el.next(".station"), suggests, i + 1);
}

// cache busstops
function loadBusstopsList() {
  console.log("Start Request");
  var apiUrl =
    "http://opensasa.info/SASAplandata/?type=BASIS_VER_GUELTIGKEIT";
  request(apiUrl, validitySuccess, "jsonp");
}

function validitySuccess(data) {
  if (!localStorage.version || localStorage.version != data[0].VER_GUELTIGKEIT) {
    localStorage.clear();
    localStorage.version = data[0].VER_GUELTIGKEIT;
    if (!localStorage.busstops) {
      console.log("New Data");
      var apiUrl = "http://opensasa.info/SASAplandata/?type=REC_ORT";
      request(apiUrl, busstopsSuccess, "jsonp");
    }
  }

}

function busstopsSuccess(data) {
  for (var i = 0; i < data.length; i++) {
  // [0] is italian [1] is german
    data[i].stop = data[i].ORT_NAME.split(" - ");
    data[i].city = data[i].ORT_GEMEINDE.split(" - ");
  }
  localStorage.setItem('busstops', JSON.stringify(data));
}

// Return the busstop list as json which is stored in the localStorage
function getBusstopList() {
  return JSON.parse(localStorage.busstops);
}

// callback is the name of the callback arg
function request(urlAPI, success, callback) {
  $.ajax({
    url: urlAPI,
    dataType: 'jsonp',
    jsonp: callback,
    success: function(data) {
      console.log("success: " + urlAPI);
      success(data);
    },
    error: function(data) {
      console.log("Error: " + urlAPI);
    }
  });
}
