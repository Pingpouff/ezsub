#!/usr/bin/env node
// the previous line is uber important to command line execution
var SubDb = require("subdb");
var fs = require("fs");
var path = require("path");
var moment = require("moment");
var MediaFileUtil = require("./src/MediaFileUtil");
var SubDownloader = require("./src/SubDownloader");
var DirScanner = require("./src/DirScanner");

var subdb = new SubDb();
var pathArgument = path.resolve(process.argv[2]);

var downloadSub = function (filePath) {
	SubDownloader.download(filePath);
};


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
	// fs.readdirSync(pathArgument).forEach(function (file) {
	// 	var currentPath = path.join(pathArgument, file);
	// 	if (fs.lstatSync(currentPath).isDirectory()) {
	// 		dlDirSubDeep(currentPath, files);
	// 	} else {
	// 		var fileExt = path.extname(file);
	// 		if (MediaFileUtil.isVideoExt(fileExt) && isWithinAWeek(fs.lstatSync(pathArgument).mtime) && !MediaFileUtil.hasSub(currentPath)) {
	// 			files.set(file, currentPath);
	// 		}
	// 	}
	// });
	DirScanner.scan(pathArgument, files);
}


// Manage directory param
if (fs.lstatSync(pathArgument).isDirectory()) {
	console.log("Scanning " + pathArgument + " directory...");
	var filesMap = new Map();
	dlDirSubDeep(pathArgument, filesMap);
	var processCb = function (files) {
		files.forEach(function (name) {
			downloadSub(filesMap.get(name));
		});
	};
	// console.log(JSON.stringify(filesMap.keys()));
	if (filesMap.size > 0) {
		askToDl([...filesMap.keys()], processCb);
	} else {
		console.log('No file to process');
	}
	console.log('The END.');
} else {
	downloadSub(pathArgument);
}