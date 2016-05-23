if (typeof omg == "undefined") {
   omg = {};
}

omg.setupShareWindow = function (parentDiv, url) {

   url = url || window.location;

   var backgroundDiv = document.createElement("div");
   backgroundDiv.className = "share-window-background";
   backgroundDiv.style.display = "none";

   var parent = parentDiv || document.body;
   parent.appendChild(backgroundDiv);

   var windowDiv = document.createElement("div");
   windowDiv.className = "share-window";
   windowDiv.style.display = "none";
   parent.appendChild(windowDiv);

   var div = document.createElement("h1");
   div.className = "share-window-header";
   div.innerHTML = "Share!";
   windowDiv.appendChild(div);

   var urlTextbox = document.createElement("input");
   windowDiv.appendChild(urlTextbox);
   urlTextbox.value = url;

   var socialIcons = document.createElement("div");
   socialIcons.className = "share-window-social-icons";
   windowDiv.appendChild(socialIcons);

   div = document.createElement("a");
   div.className = "share-window-social-icon";
   socialIcons.appendChild(div);
   div.href = "mailto:?subject=OpenMusic.Gallery&body=" + url;
   div.style.backgroundImage = "url('img/email.png')";
   div.style.backgroundColor = "#FF80FF";
   div.target = "_blank";

   div = document.createElement("a");
   div.className = "share-window-social-icon";
   socialIcons.appendChild(div);
   div.href = 'http://twitter.com/home?status=' + encodeURIComponent(url);
   div.style.backgroundImage = "url('img/twitter_logo.png')";
   div.target = "_blank";

   div = document.createElement("a");
   div.className = "share-window-social-icon";
   socialIcons.appendChild(div);
	div.href = "http://www.facebook.com/sharer/sharer.php?t=OpenMusic.Gallery&u="
					+ encodeURIComponent(url);
   div.style.backgroundImage = "url('img/f_logo.png')";
   div.target = "_blank";

   omg.shareWindow = {};
   omg.shareWindow.show = function () {
      backgroundDiv.style.display = "block";
      backgroundDiv.onclick = function () {
         backgroundDiv.style.display = "none";
         windowDiv.style.display = "none";
      };

      windowDiv.style.display = "block";
   };
};

