/**
 * create these objects:
 *     omg.server -  for server stuff
 *     omg.util   -  for local stuff
 */


if (typeof omg !== "object")
    omg = {};
if (!omg.server)
    omg.server = {};
if (!omg.util)
    omg.util = {};

omg.server.url = "";
omg.server.dev = window.location.href.indexOf("localhost") > 0;

omg.server.post = function (data, callback) {

    var xhr = new XMLHttpRequest();
    xhr.open("POST", this.url + "/data/", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            var results = JSON.parse(xhr.responseText);
            if (results.id) {
                console.log("post omg good id= " + results.id);
                data.id = results.id;
                if (callback)
                    callback(results);
            } else {
                console.log(results);
            }
        }
    };

    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
};

omg.server.getHTTP = function (url, callback) {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            var results;
            try {
                results = JSON.parse(xhr.responseText);
            } catch (exp) {
                console.log(exp);
                console.log("could not parse results of url: " + url);
            }
            if (callback && results)
                callback(results);                
        }
    };
    xhr.send();
};

omg.server.getId = function (id, callback) {
    omg.server.getHTTP(this.url + "/data/" + id, callback);
    return; 
};

omg.server.deleteId = function (id, callback) {

    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", this.url + "/data/" + id, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            var results = JSON.parse(xhr.responseText);
            console.log(results);
            if (callback)
                callback(results);
        }
    };
    xhr.send();
};


/** 
 * Utility functions for the client
 * 
 */

omg.util.getPageParams = function () {
    // see if there's somethign to do here
    var rawParams = document.location.search;
    var nvp;
    var params = {};

    if (rawParams.length > 1) {
        rawParams.slice(1).split("&").forEach(function (param) {
            nvp = param.split("=");
            params[nvp[0]] = nvp[1];
        });
    }
    return params;
};

omg.util.makeQueryString = function (parameters) {  
    var string = "?";
    for (var param in parameters) {
        string += param + "=" + parameters[param] + "&";
    }
    return string.slice(0, string.length - 1);
};

omg.util. getTimeCaption = function (timeMS) {

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

