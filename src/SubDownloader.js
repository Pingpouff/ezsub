const download = function (filePath) {

	var SubDb = require("subdb");
	var subdb = new SubDb();
	console.log("Hashing file at: " + filePath);
	subdb.computeHash(filePath
		, function (err, res) {
			if (err) {
				console.log(err);
				return err;
			}
			console.log("Hash done.");
			var hash = res;
			console.log("Searching...");
			subdb.api.search_subtitles(hash, function (err, res) {

				if (err) return err;
				console.log("Search done.");
				if (res.indexOf('en') > -1) {
					var subFileName = path.dirname(path.resolve(filePath)) + "/" + path.basename(filePath, path.extname(filePath)) + '.srt';
					console.log("Downloading file for: " + subFileName);
					subdb.api.download_subtitle(hash, 'en', subFileName, function (err, res) {
						if (err) return err;

						// sub is normally fetched into pathtosub.srt
						console.log("Subtitle downloaded.");
					});
				} else {
					console.log("No EN subtitle found for:" + filePath)
				}
			});
		});
};

module.exports = {
	download
}