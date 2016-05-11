function OMGService(serviceUrl) {
   this.url = serviceUrl || "";
}

OMGService.prototype.post = function (data, callback) {

	var xhr = new XMLHttpRequest();
	xhr.open("POST", this.url + "/data/", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {

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
	}

   xhr.setRequestHeader("Content-type", "application/json");
   xhr.send(JSON.stringify(data));
};

