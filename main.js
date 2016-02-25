#!/usr/bin/env node
var SubDb = require("subdb");
var fs = require("fs");
var path = require("path");

var subdb = new SubDb();
var pathArgument = process.argv[2];

var getSubFileFor = function (filePath) {
    console.log("Hashing file at: " + filePath);
    subdb.computeHash(filePath, function (err, res) {
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
            var subFileName = path.dirname(path.resolve(filePath)) + "/" + path.basename(filePath, path.extname(filePath)) + '.srt';
            console.log("Downloading file for: " + subFileName);
            subdb.api.download_subtitle(hash, res.join(','), subFileName, function (err, res) {
                if (err) return err;

                // sub is normally fetched into pathtosub.srt
                console.log("Subtitle downloaded.");
            });

        });
    });
};

// Manage directory param
if (fs.lstatSync(pathArgument).isDirectory()) {
    console.log("Directory found!!!");
    // TODO use async call + promise
    fs.readdirSync(pathArgument).forEach(function (file) {
        var fileExt = path.extname(file);
        if (fileExt !== '.srt' && fileExt !== '.txt') {
            var filePath = pathArgument + file;
            console.log('Call for: ' + filePath);
            getSubFileFor(filePath);
        }
        //console.log(fileExt);
    });
} else {
    getSubFileFor(pathArgument);
}

