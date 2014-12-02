var iconStar = "img/star.svg";
var iconNostar = "img/nostar.svg";
var iconSearch = "img/search.svg";
var fav = new Object();
var lang = 0; // 0 for italian and 1 for german


loadBusstopsList();

$(document).ready(function() {

  // Initialize

  $(":input").val("");
  $(".bus-list").hide();
  $(".station").removeClass("expanded");
  //bindEvents();
});


  // User Events
 function bindToogle() {
  $(".station").click(function() {
    console.log("Toogle");
    if ($(this).hasClass("expanded")) {
      $(this).children(".bus-list").slideUp(200);
      $(this).removeClass("expanded");
    } else {
      $(this).children(".bus-list").slideDown(200);
      $(this).addClass("expanded");
    }
  });

 }

function bindStar(el) {
  $(el).click(function() {
    if ($(this).hasClass("js-starred")) {
      // Remove Favorite
      $(this).attr("src", iconNostar);
      $(this).removeClass("star").addClass("nostar");
      $(this).removeClass("js-starred");
      //$(this).parents(".station").remove();
      return false;
    } else {
      console.log("Test");
      // Add new Favorite
      $(this).attr("src", iconStar);
      $(this).removeClass("nostar").addClass("star");
      $(this).addClass("js-starred");
//    $(".favorites").append($(this).parents(".station").clone());
      return false;
    }
  });

}

$(".js-search").bind("input", function() {
  $(".search-results").empty();
  var suggests = matchInput(getBusstopList(), $(".js-search").val());
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
  for (var i = 0; i < suggests.length; i++) {
    var div = '<article class="station">' + 
      '<header class="station-header">' + 
      '<h1 class="station-title">' + 
      suggests[i].stop[lang] + " - " +
      suggests[i].city[lang] + 
      '</h1>' + 
      '<button class="station-star nostar"></button>' + 
      '</header>' + 
      '<section class="bus-list" style="display: none;"></section>' + 
      '</article>';
    $(".search-results").append(div);
    var apiUrl = "http://stationboard.opensasa.info/?type=jsonp&ORT_NR=" + suggests[i].busstops[0].ORT_NR;
    request(apiUrl, stationSuccess, "JSONP", i);
    bindStar($(".station-star:last"));
  }
  bindToogle();
  console.log(suggests);
}

function stationSuccess(data, index) {
  data = data.rides;
  console.log("Result", data, index);
  for(var i = 0; i < data.length; i++) {
    var div = '<article class="bus">' +
      '<label class="line">' +
      data[i].lidname +
      '</label>' +
      '<label class="time">' +
      formatTime(data[i].departure)+
      '</label>' +
      '<label class="endstation">'+
      data[i].last_station.split(" - ")[lang] +
      '</label>' +
      '</article>';
    console.log("Data");
    $(".bus-list:eq(" + index + ")").append(div);
  }
}

// cache busstops
function loadBusstopsList() {
  console.log("Start Request");
  var apiUrl =
    "http://opensasa.info/SASAplandata/?type=BASIS_VER_GUELTIGKEIT";
  request(apiUrl, validitySuccess, "jsonp");
}

function formatTime(time) {
  return time;
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
function request(urlAPI, success, callback, index) {
  $.ajax({
    url: urlAPI,
    dataType: 'jsonp',
    jsonp: callback,
    success: function(data) {
      console.log("success: " + urlAPI);
      success(data, index);
    },
    error: function(data) {
      console.log("Error: " + urlAPI);
    }
  });
}
