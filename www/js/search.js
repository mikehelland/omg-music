"use strict";
/**
 * expect the omgservice.js to be ran
 * make an omg.search method
 * 
 */

omg.search = function (params, callback) {
    var url = "data/?"
    if (params.q) {
        url = url + "&q=" + params.q;
        params.metaData = false //meta data doesn't come with text search
    }
    if (params.metaData) {
        url = url + "&metaData=true"
    }
    if (params.type) {
        url = url + "&type=" + params.type;
    }
    if (params.page) {
        url = url + "&page=" + params.page;
    }
    if (params.user) {
        url = url + "&user_id=" + params.user.id;
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

        var viewerParams = params.viewerParams || {}
        viewerParams.div = resultDiv
        viewerParams.height = 80
        viewerParams.onPlay = params.onPlay
        viewerParams.onStop = params.onStop

        if (params.metaData) {
            viewerParams.result = result;
        }
        else {
            viewerParams.data = result;
        }
        new OMGEmbeddedViewer(viewerParams);

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

