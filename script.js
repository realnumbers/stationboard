var iconStar = "img/star.svg";
var iconNostar = "img/nostar.svg";
var iconSearch = "img/search.svg";
var lang = 0; // 0 for italian and 1 for german
var board = new Object();


loadBusstopsList();

$(document).ready(function() {

	// Initialize

	$(":input").val("");
	$(".bus-list").hide();
	$(".station").removeClass("expanded");
  drawContent();

});


//bindEvents();
// User Events
function bindToggle(el) {
	el.find(".station").click(function() {
		//console.log("Toggle");
		if ($(this).hasClass("expanded")) {
			$(this).children(".bus-list").slideUp(200);
			$(this).removeClass("expanded");
		} else {
			$(this).children(".bus-list").slideDown(200);
			$(this).addClass("expanded");
		}
	});

}

function bindStar(el, con) {
	//console.log("Bind Star", el);
	$(el).click(function() {
		if ($(this).hasClass("js-starred")) {
			// Remove Favorite
			$(this).attr("src", iconNostar);
			$(this).removeClass("star").addClass("nostar");
			$(this).removeClass("js-starred");
			removeFavorite(con);
			//$(this).parents(".station").remove();
			return false;
		} else {
			// Add new Favorite
			$(this).attr("src", iconStar);
			$(this).removeClass("nostar").addClass("star");
			$(this).addClass("js-starred");
			addFavorite(con);
			//    $(".favorites").append($(this).parents(".station").clone());
			return false;
		}
	});

}

function addFavorite(content) {
	var favo = loadFavo();
	favo[content.busstops[0].ORT_NR] = content;
	saveFavo(favo);
  drawContent();
}

function removeFavorite(content) {
	var favo = loadFavo();
	delete(favo[content.busstops[0].ORT_NR]);
	saveFavo(favo);
  drawContent();
}

function printFavorite(favo) {
	//console.log(favo);
	if (JSON.stringify(favo) == "{}")
		$(".favorites-title").hide();
	else
		$(".favorites-title").show();
	$(".favorites").empty();
	var i = $(".station").length;
	//console.log(favo);
	for (var el in favo) {
		var div = '<article class="station">' +
			'<header class="station-header">' +
			'<h1 class="station-title">' +
			favo[el].stop[lang] + " - " +
			favo[el].city[lang] +
			'</h1>' +
			'<button class="station-star star js-starred"></button>' +
			'</header>' +
			'<section class="bus-list" style="display: none;"></section>' +
			'</article>';
		var element = $(".favorites").append(div);
    insertBoard(element , favo[el].busstops[0].ORT_NR);
		bindStar($(".favorites").find(".station-star:last"), favo[el]);
		i++;
	}
}


$(".js-search").bind("input", function() {
	//var suggests = matchInput(getBusstopList(), $(".js-search").val());
  drawContent();
});

//match input with busstops name and citys
function matchInput(list, input) {
	var suggests = [];
	var found;
	var j;
	if (input !== "") {
		input = input.split(" ");
		for (var i = 0; i < list.length && suggests.length < 4; i++) {
			j = 0;
			do {
				if (input[j] !== "") {
					found = list[i].ORT_GEMEINDE.match(new RegExp(input[j], "i"));
					if (found === null)
						found = list[i].ORT_NAME.match(new RegExp(input[j], "i"));
				}
				j++;
			} while (j < input.length && found !== null);
			if (found !== null)
				suggests[suggests.length] = list[i];
		}
	}
	return suggests;
}

//output suggests
function printSuggests(suggests) {
	$(".search-results").empty();
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
		var el = $(".search-results").append(div);
    insertBoard(el , suggests[i].busstops[0].ORT_NR);
		//favo must be set before bindStar
		if (loadFavo()[suggests[i].busstops[0].ORT_NR])
			$(".search-results").find(".station-star:last").removeClass("nostar").addClass("star js-starred");
		bindStar($(".search-results").find(".station-star:last"), suggests[i]);
	}
	//console.log(suggests);
}
function insertBoard(el, id) {
  if (board[id] === undefined) {
		var apiUrl = "http://stationboard.opensasa.info/?type=jsonp&ORT_NR=" + id;
		request(apiUrl, stationSuccess, "JSONP", id);
    board[id] = new Object();
    board[id].runing = true;
  }
  else if (board[id].rides != undefined)
    writeBoard(el, id);
}

function stationSuccess(data, id) {
  board[id].runing = false;
  board[id].rides = data.rides;
  drawContent();
  console.log(id);
}

function writeBoard(el, id) {
	data = board[id].rides;
	for (var i = 0; i < data.length; i++) {
		var div = '<article class="bus">' +
			'<label class="line" style="background-color:' + data[i].hexcode + '">' +
			(data[i].lidname).substring(0,3) +
			'</label>' +
			'<label class="time">' +
			formatTime(data[i].departure) +
			'</label>' +
			'<label class="endstation">' +
			data[i].last_station.split(" - ")[lang] +
			'</label>' +
			'</article>';
		//console.log("Data");
		el.find(".bus-list").append(div);
	}

	if (data.length === 0) {
		el.find(".bus-list").append(
				'<label class="no-connections">No Connections</label>');
	}
}

// cache busstops
function loadBusstopsList() {
	//console.log("Start Request");
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
			//console.log("New Data");
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

function loadFavo() {
	if (localStorage.fav)
		return JSON.parse(localStorage.fav);
	else
		return new Object();
}

function saveFavo(data) {
	localStorage.fav = JSON.stringify(data);
}

// callback is the name of the callback arg
function request(urlAPI, success, callback, index) {
	$.ajax({
		url: urlAPI,
		dataType: 'jsonp',
		jsonp: callback,
		success: function(data) {
			//console.log("success: " + urlAPI);
			success(data, index);
		},
		error: function(data) {
			console.log("Error: " + urlAPI);
		}
	});
}

function drawContent() {
	var favo = loadFavo();
	var suggests = matchInput(getBusstopList(), $(".js-search").val());
	printSuggests(suggests);
	printFavorite(favo);
	bindToggle($(".search-results"));
	bindToggle($(".favorites"));
}
