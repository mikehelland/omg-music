function setupUserControls(div) {
   var loggedIn = false;
   var user;

   if (!div.omg) {
      div.omg = {};
      div.omg.username = document.createElement("a");
      div.omg.username.href = "user.htm";
      div.appendChild(div.omg.username);

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
   }

   var onNotLoggedIn = function () {
      if (!div.omg.notLoggedIn) {
         div.omg.notLoggedIn = document.createElement("span");
         div.omg.notLoggedIn.className = "omg-user-controls-not-logged-in";
         div.omg.notLoggedIn.innerHTML = "<a href='login.htm'>Log In</a> | <a href='signup.htm'>Sign up.</a>";
         div.appendChild(div.omg.notLoggedIn);
      }
   };

   var onLoggedIn = function () {
      div.omg.username.innerHTML = user.username;
      div.omg.dropDownContainer.style.display = "inline-block";
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
