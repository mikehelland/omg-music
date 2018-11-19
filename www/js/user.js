//var parameters = getQueryParameters();

if (!omg) omg = {};
if (!omg.ui) omg.ui = {};
if (!omg.util) omg.util = {};

if (!omg.util.loadSearchResults) {
    omg.util.loadSearchResults = function (results, resultList, onclick) {
       results.forEach(function (result) {
          var resultDiv = document.createElement("div");
          resultDiv.className = "search-thing";

          var resultData = document.createElement("div");
          resultData.className = "search-thing-image";
          resultData.innerHTML = "&nbsp;"
          resultData.style.backgroundColor = omg.ui.getBackgroundColor(result.type);
          resultDiv.appendChild(resultData);

          resultData = document.createElement("div");
          resultData.className = "search-thing-type";
          resultData.innerHTML = result.type;
          resultDiv.appendChild(resultData);

          resultData = document.createElement("div");
          resultData.className = "search-thing-title";
          resultData.innerHTML = result.name || (result.tags ? ("(" + result.tags + ")") : "");
          resultDiv.appendChild(resultData);

          resultData = document.createElement("div");
          resultData.className = "search-thing-user";
          resultData.innerHTML = result.username ? "by " + result.username : "";
          resultDiv.appendChild(resultData);

          var rightData = document.createElement("div");
          rightData.className = "search-thing-right-data";
          resultDiv.appendChild(rightData);

          resultData = document.createElement("div");
          resultData.className = "search-thing-votes";
          resultData.innerHTML = (result.votes || "0") + " votes";
          rightData.appendChild(resultData);

          resultData = document.createElement("div");
          resultData.className = "search-thing-created-at";
          resultData.innerHTML = omg.util.getTimeCaption(parseInt(result.created_at));
          rightData.appendChild(resultData);

          resultDiv.onclick = function () {
              if (onclick) {
                  onclick(result);
              }
              else {
                window.location = "viewer.htm?id=" + result.id;
              }
          };
          resultList.appendChild(resultDiv);
       });
    };
}

if (!omg.util.getUserThings) {
    omg.util.getUserThings = function (user, resultList, onclick) {

        var div = document.getElementsByClassName("user-username")[0];
        if (div) {
            div.innerHTML = user.username;
        }

        div = document.getElementsByClassName("user-created-at")[0];
        if (div) {
            div.innerHTML = omg.util.getTimeCaption(user.created_at);
        }

        omg.server.getHTTP("/data/?user_id=" + user.id, function (results) {
            if (results) {
                omg.util.loadSearchResults(results, resultList, onclick);
            }
            else {
                resultList.innerHTML = "Error parsing search results.";
            }
        });
    }
}

if (!omg.ui.getBackgroundColor) {
    omg.ui.getBackgroundColor = function (type) {
       if (type === "SONG") {
          return "#99FF99";
       }

       if (type === "SECTION") {
          return "#99AAFF";
       }

       if (type === "PART" || type === "MELODY" || type === "DRUMBEAT" || type === "BASSLINE") {
          return "#FFFF99";
       }
       
       if (type === "SOUNDSET") {
           return "#FF9999";
       }

       return "#808080";
    };
}