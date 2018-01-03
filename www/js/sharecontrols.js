if (typeof omg == "undefined") {
    omg = {};
}

omg.setupShareWindow = function (parentDiv) {

    omg.shareWindow = {};

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
    omg.shareWindow.urlTextbox = urlTextbox;

    var socialIcons = document.createElement("div");
    socialIcons.className = "share-window-social-icons";
    windowDiv.appendChild(socialIcons);

    div = document.createElement("a");
    div.className = "share-window-social-icon";
    socialIcons.appendChild(div);
    div.style.backgroundImage = "url('img/email.png')";
    div.style.backgroundColor = "#FF80FF";
    div.target = "_blank";
    omg.shareWindow.mailDiv = div;

    div = document.createElement("a");
    div.className = "share-window-social-icon";
    socialIcons.appendChild(div);
    div.style.backgroundImage = "url('img/twitter_logo.png')";
    div.target = "_blank";
    omg.shareWindow.twitterDiv = div;

    div = document.createElement("a");
    div.className = "share-window-social-icon";
    socialIcons.appendChild(div);
    div.style.backgroundImage = "url('img/f_logo.png')";
    div.target = "_blank";
    omg.shareWindow.facebookDiv = div;

    omg.shareWindow.show = function (url) {
        backgroundDiv.style.display = "block";
        backgroundDiv.onclick = function () {
            backgroundDiv.style.display = "none";
            windowDiv.style.display = "none";
        };

        url = url || window.location;

        omg.shareWindow.url = url;
        omg.shareWindow.urlTextbox.value = url;

        omg.shareWindow.mailDiv.href = "mailto:?subject=OpenMusic.Gallery&body=" + url;
        omg.shareWindow.twitterDiv.href = 'http://twitter.com/home?status=' + encodeURIComponent(url);
        omg.shareWindow.facebookDiv.href = "http://www.facebook.com/sharer/sharer.php?t=OpenMusic.Gallery&u="
                + encodeURIComponent(url);

        windowDiv.style.display = "block";
    };
};

