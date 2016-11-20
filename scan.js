#!/usr/bin/env node
// the previous line is uber important to command line execution
var SubDb = require("subdb");
var fs = require("fs");
var path = require("path");
var moment = require("moment");

var subdb = new SubDb();
var pathArgument = path.resolve(process.argv[2]);

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

var isVideoExt = function (fileExt) {
    var vidExt = ['.avi', '.mkv', '.mp4'];
    return vidExt.indexOf(fileExt) > -1;
}

var hasSub = function (filePath) {
    var srtName = path.basename(filePath, path.extname(filePath)) + '.srt';
    var srtPath = path.join(path.dirname(filePath), srtName);
    //console.log('No srt for file: ' + filePath);
    return fs.existsSync(srtPath);
}

// DATE FILTERING (not working)
var today = moment();
var A_WEEK_OLD = today.subtract(7, 'days').startOf('day');
var isWithinAWeek = function (fileDate) {
    var date = moment(fileDate);
    var result = date.isAfter(A_WEEK_OLD);
    //console.log("date:" + fileDate);
    //console.log("datediff:" + date.fromNow());
    //console.log("isWithinAWeek?" + result);
    return result;
}

// TERMINAL INTERACTION
var askToDl = function (files, processCb) {
    var inquire = require('inquirer');
    inquire.prompt([
        {
            type: 'checkbox',
            name: 'files',
            message: 'Select files of which to dl subtitle:',
            choices: files
        }], function (answers) {
            processCb(answers.files);
        });
}

var dlDirSubDeep = function (pathArgument, files) {
    // TODO use async call + promise
    fs.readdirSync(pathArgument).forEach(function (file) {
        var currentPath = path.join(pathArgument, file);
        if (fs.lstatSync(currentPath).isDirectory()) {
            dlDirSubDeep(currentPath, files);
        } else {
            var fileExt = path.extname(file);
            if (isVideoExt(fileExt) && isWithinAWeek(fs.lstatSync(pathArgument).mtime) && !hasSub(currentPath)) {
                files.set(file, currentPath);
            }
        }
    });
}


// Manage directory param
if (fs.lstatSync(pathArgument).isDirectory()) {
    console.log("Directory scan in progress...");
    var filesMap = new Map();
    dlDirSubDeep(pathArgument, filesMap);
    var processCb = function (files) {
        files.forEach(function (name) {
            getSubFileFor(filesMap.get(name));
        });
    };
    console.log(JSON.stringify(filesMap.keys()));
    if (filesMap.size > 0) {
        askToDl([...filesMap.keys()], processCb);
    } else {
        console.log('No file to process');
    }
    console.log('The END.');
} else {
    getSubFileFor(pathArgument);
}