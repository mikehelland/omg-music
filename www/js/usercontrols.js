if (typeof omg == "undefined") {
   omg = {};
}

function setupUserControls(div, successCallback, failCallback) {
   var loggedIn = false;
   var user;

   if (!div.omg) {
      div.omg = {};
   }

   var onNotLoggedIn = function () {
      if (!div.omg.notLoggedIn) {
         //div.omg.notLoggedIn = document.createElement("span");
         //div.omg.notLoggedIn.className = "omg-user-controls-not-logged-in";
         var httpsURL = "/";
         if (window.location.protocol !== "https:") {
             httpsURL = "https://" + window.location.host + "/";
         }

         var fwd = "?fwd=" + encodeURIComponent(window.location.pathname + window.location.search)
         //div.omg.notLoggedIn.innerHTML = "<a href='" + httpsURL + 
         div.innerHTML = "<a href='" + httpsURL +
                 "signin.htm" + fwd + "'>Login / Signup</a>";
         //div.appendChild(div.omg.notLoggedIn);
      }

      if (typeof failCallback == "function") {
         failCallback(user);
      }

   };

   var onLoggedIn = function () {

	  div.innerHTML = "<a href='/user.htm'>" + user.username + "</a>";

      var el = document.createElement("div");
      el.style.display = "none";
      el.style.position = "relative";
      //el.style.width = "2em";
      div.appendChild(el);
      div.omg.dropDownContainer = el;

      var downEl = document.createElement("div");
      downEl.style.display = "inline-block";
      downEl.style.border = "4px solid black";
      downEl.style.position = "relative";
      downEl.style.borderLeftColor = "transparent";
      downEl.style.borderRightColor = "transparent";
      downEl.style.borderBottomColor = "transparent";
      el.appendChild(downEl);
      div.omg.dropDownContainer.style.display = "inline-block";

      omg.user = user;

      if (typeof successCallback == "function") {
         successCallback(user);
      }
   };


   //check to see if we're logged in
   var xhr = new XMLHttpRequest();
   xhr.open("GET", "/user");
   xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
         
         if (xhr.responseText === "false") {
            onNotLoggedIn();
            return;
         }

         user = JSON.parse(xhr.responseText);
         onLoggedIn();

      }
   };
   xhr.send();

}
