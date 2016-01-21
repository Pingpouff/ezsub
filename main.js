var SubDb = require("subdb");
var fs = require("fs");
var path = require("path");

var subdb = new SubDb();
var path_to_movie = process.argv[2];
console.log("Hashing file at: " + path_to_movie);
subdb.computeHash(path_to_movie, function (err, res) {
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
        var subFileName = path.dirname(path.resolve(path_to_movie)) + "/" + path.basename(path_to_movie, path.extname(path_to_movie)) + '.srt';
        console.log("Downloading file for: " + subFileName);
        subdb.api.download_subtitle(hash, res.join(','), subFileName, function (err, res) {
            if (err) return err;

            // sub is normally fetched into pathtosub.srt
            console.log("Subtitle downloaded.");
        });

    });
});
