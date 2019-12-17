"use strict";
/**
 * expect the omgservice.js to be ran
 * make an omg.search method
 * 
 */

omg.search = function (params, callback) {
    var url = "/data/?"
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
    if (params.user_id) {
        url = url + "&user_id=" + params.user.id;
    }
    if (params.users) {
        url = url + "&users=" + params.users;
    }
    if (params.sort) {
        url = url + "&sort=" + params.sort;
    }

    omg.server.getHTTP(url, function (results) {
        omg.loadSearchResults(params, results);
    });
    
};

omg.loadSearchResults = function (params, results) {

    params.resultList.innerHTML = ""

    if (params.page && params.page > 1) {
        var prevButton = document.createElement("button")
        prevButton.innerHTML = "< Previous"
        params.resultList.appendChild(prevButton)
        prevButton.onclick = () => {
            params.page -= 1
            omg.search(params)
        }
    }

    if (results.length === 0) {
        return
    }

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

        resultDiv.onclick = function () {
            var page;
            if (result.type == "SOUNDSET") {
                page = "soundset.htm";
                window.location = page + "?id=" + result.id;
            }
        };
   });

    var nextButton = document.createElement("button")
    nextButton.innerHTML = "Next >"
    params.resultList.appendChild(nextButton)
    nextButton.onclick = () => {
        params.page = (params.page || 1) + 1
        omg.search(params)
    }

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

