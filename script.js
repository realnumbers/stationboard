var iconStar = "img/star.svg";
var iconNostar = "img/notstar.svg";
var iconSearch = "img/search.svg";


loadBusstopsList();

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

// cache busstops
function loadBusstopsList() {
	console.log("Start Request");
  var apiUrl = "http://opensasa.info/SASAplandata/?type=BASIS_VER_GUELTIGKEIT";
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
success: function( data ) {
console.log("success: " + urlAPI);
success(data);
},
error: function( data ) {
console.log("Error: " + urlAPI);
}
});
}


