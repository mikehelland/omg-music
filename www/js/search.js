"use strict";
/**
 * expect the omgservice.js to be ran
 * make an omg.search method
 * 
 */

omg.search = function (params, callback) {
    var url = "data/?q=" + (params.q || "");
    if (params.type) {
        url = url + "&type=" + params.type;
    }
    if (params.page) {
        url = url + "&page=" + params.page;
    }

    omg.server.getHTTP(url, function (results) {
        omg.loadSearchResults(params, results);
    });
    
};

omg.loadSearchResults = function (params, results) {
	
    results.forEach(function (result) {
        var resultDiv = document.createElement("div");

        resultDiv.className = "omgviewer";
        resultDiv.innerHTML = '<div class="beat-marker"></div>';
        params.resultList.appendChild(resultDiv);

        new OMGEmbeddedViewer({div: resultDiv, 
                                data: result,
                                height: 80, 
                                onPlay: params.onPlay,
                                onStop: params.onStop
                            });

        params.resultList.appendChild(document.createElement("br"));

        resultDiv.onclick = function () {
            var page;
            if (result.type == "SOUNDSET") {
                page = "soundset.htm";
                window.location = page + "?id=" + result.id;
            }
        };
   });
};



var previousButton = document.getElementById("search-previous-button");
var nextButton = document.getElementById("search-next-button");
if (previousButton) {
	previousButton.onclick = function () {
		parameters.page--;
		search(parameters);
	};
}
if (nextButton) {
	nextButton.onclick = function () {
		parameters.page++;
		search(parameters);
	};
}

var onPlay = function (info) {
    
};


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

