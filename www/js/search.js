var parameters = getQueryParameters();

var searchTermsDiv = document.getElementsByClassName("search-info-terms")[0];
searchTermsDiv.innerHTML = parameters.q || "";

var resultList = document.getElementsByClassName("search-things")[0];

var loadSearchResults = function (results) {
   results.forEach(function (result) {
      var resultDiv = document.createElement("div");
      resultDiv.className = "search-thing";

      var resultData = document.createElement("div");
      resultData.className = "search-thing-image";
      resultData.innerHTML = "&nbsp;"
      resultData.style.backgroundColor = getBackgroundColor(result.type);
      resultDiv.appendChild(resultData);

      resultData = document.createElement("div");
      resultData.className = "search-thing-type";
      resultData.innerHTML = result.type;
      resultDiv.appendChild(resultData);

      resultData = document.createElement("div");
      resultData.className = "search-thing-title";
      resultData.innerHTML = result.title || "";
      resultDiv.appendChild(resultData);

      resultData = document.createElement("div");
      resultData.className = "search-thing-user";
      resultData.innerHTML = "by " + (result.username || "");
      resultDiv.appendChild(resultData);

      resultData = document.createElement("div");
      resultData.className = "search-thing-datetime";
      resultData.innerHTML = result.created_at;
      resultDiv.appendChild(resultData);

      resultData = document.createElement("div");
      resultData.className = "search-thing-votes";
      resultData.innerHTML = (result.votes || "0") + " votes";
      resultDiv.appendChild(resultData);

      resultDiv.onclick = function () {
         window.location = "viewer.htm?id=" + result.id;
      };
      resultList.appendChild(resultDiv);
   });
};

var xhr = new XMLHttpRequest();
xhr.open("GET", "data/?q=" + (parameters.q || ""));
xhr.onreadystatechange = function () {
   var results;
   if (xhr.readyState == 4) {
      console.log(xhr.responseText);
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

function getBackgroundColor(type) {
   if (type === "SONG") {
      return "#99FF99";
   }

   if (type === "SECTION") {
      return "#99AAFF";
   }

   if (type === "MELODY" || type === "DRUMBEAT" || type === "BASSLINE") {
      return "#FFFF99";
   }

   return "#808080";
}
