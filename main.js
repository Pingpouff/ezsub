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
	//return;
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
			if(res.indexOf('en') > -1) {
				subdb.api.download_subtitle(hash, 'en', subFileName, function (err, res) {
					if (err) return err;

					// sub is normally fetched into pathtosub.srt
					console.log("Subtitle downloaded.");
				});
			} else {
				console.log("No EN subtitle found.")
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

// DATE FILTERING
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

var dlDirSubDeep = function (pathArgument) {
	// TODO use async call + promise
	fs.readdirSync(pathArgument).forEach(function (file) {
		var currentPath = path.join(pathArgument, file);
		if (fs.lstatSync(currentPath).isDirectory()) {
			//console.log('> ' + currentPath);
			dlDirSubDeep(currentPath);
		} else {
			var fileExt = path.extname(file);
			if (isVideoExt(fileExt) && isWithinAWeek(fs.lstatSync(pathArgument).mtime) && !hasSub(currentPath)) {
				//console.log('dlsub for: ' + currentPath);
				getSubFileFor(currentPath);
			}
		}
		//console.log(fileExt);
	});
}

// Manage directory param
if (fs.lstatSync(pathArgument).isDirectory()) {
	console.log("Directory found!!!");
	dlDirSubDeep(pathArgument)
} else {
	getSubFileFor(pathArgument);
}