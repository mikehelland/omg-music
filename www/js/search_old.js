var parameters = getQueryParameters();

var searchTermsDiv = document.getElementsByClassName("search-info-terms")[0];
searchTermsDiv.innerHTML = parameters.q || "";

var resultList = document.getElementsByClassName("search-things")[0];

var filterType = document.getElementById("filter-type");
var type = parameters.type || "";
filterType.onchange = function () {
	//todo set the location?
	parameters.type = filterType.value;
	search(parameters);
};

function newSearch() {

	var query = document.getElementById("query");
	parameters.q = query.value;
	search(parameters);
	
}

parameters.page = parameters.page || 1;

var previousButton = document.getElementById("search-previous-button");
var nextButton = document.getElementById("search-next-button");
if (previousButton) {
	previousButton.onclick = function () {
		parameters.page--;
		//window.location = window.location.pathname + getQueryString(parameters);
		search(parameters);
	};
}
if (nextButton) {
	nextButton.onclick = function () {
		parameters.page++;
		//window.history.pushState(null, "", window.location.pathname + getQueryString(parameters));
		//window.location = window.location.pathname + getQueryString(parameters);
		search(parameters);
	};
}

var onPlay = function (info) {
    //show footer
    //make it show the play button
    //and song name and stuff
    //and probably set the onstop?
};

var loadSearchResults = function (results) {
	
    resultList.innerHTML = "";
    results.forEach(function (result) {
        var resultDiv = document.createElement("div");

        resultDiv.className = "omgviewer";
        resultDiv.innerHTML = '<div class="beat-marker"></div>';
        resultList.appendChild(resultDiv);

        omg_embedded_viewer_loadData({div: resultDiv, 
                                        data: result,
                                        height: 80});

        resultList.appendChild(document.createElement("br"));

        resultDiv.onclick = function () {
            var page;
            if (result.type == "SOUNDSET") {
                page = "soundset.htm";
                window.location = page + "?id=" + result.id;
            }
        };
   });
};

var search = function (params) {
	var xhr = new XMLHttpRequest();
	var url = "data/?q=" + (params.q || "");
	if (params.type) {
            url = url + "&type=" + params.type;
	}
	if (params.page) {
            url = url + "&page=" + params.page;
	}
        
	xhr.open("GET", url);
	xhr.onreadystatechange = function () {
	   var results;
	   if (xhr.readyState == 4) {
		  //console.log(xhr.responseText);
		  try {
			 results = JSON.parse(xhr.responseText);
		  }
		  catch (exception) {
			 resultList.innerHTML = "Error parsing search results.";
			 return;
		  }
		  loadSearchResults(results);
	   }
	};
	xhr.send();
};

//search(parameters);

function getQueryParameters() {

	// see if there's somethign to do here
	var params = document.location.search;
	var nvp;
   var parsedParams = {};
	
	if (params.length > 1) {
		params.slice(1).split("&").forEach(function (param) {
			nvp = param.split("=");
         parsedParams[nvp[0]] = nvp[1];
		});
	}
	
   return parsedParams;
}

function getQueryString(parameters) {

    var string = "?";
    for (var param in parameters) {
        string += param + "=" + parameters[param] + "&";
    }
    return string.slice(0, string.length - 1);
}

function getBackgroundColor(type) {
   if (type === "SONG") {
      return "#99FF99";
   }

   if (type === "SECTION") {
      return "#99AAFF";
   }

   if (type == "PART" || type === "MELODY" || 
		type === "DRUMBEAT" || type === "BASSLINE") {
      return "#FFFF99";
   }

   if (type === "SOUNDSET") {
      return "#FF9999";
   }

   return "#808080";
}


function getTimeCaption(timeMS) {

    if (!timeMS) {
        return "";
    }

    var seconds = Math.round((Date.now() - timeMS) / 1000);
    if (seconds < 60) return seconds + " sec ago";

    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " min ago";    
   
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " hr ago";    

    var days = Math.floor(hours / 24);
    if (days < 7) return days + " days ago";

    var date  = new Date(timeMS);
    var months = ["Jan", "Feb", "Mar", "Apr", "May",
                "Jun", "Jul", "Aug", "Sep", "Oct", 
                "Nov", "Dec"];
    var monthday = months[date.getMonth()] + " " + date.getDate();
    if (days < 365) {
	    return monthday;
    }
    return monthday + " " + date.getFullYear();
};

