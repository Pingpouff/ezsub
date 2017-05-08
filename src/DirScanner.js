// DATE FILTERING (not working)
var moment = require("moment");
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

const scan = function (pathArgument, files) {
	var fs = require("fs");
	var path = require("path");
	// TODO use async call + promise
	fs.readdirSync(pathArgument).forEach(function (file) {
		var currentPath = path.join(pathArgument, file);
		const isCharSupported = currentPath.indexOf('é') === -1
			&& currentPath.indexOf('ê') === -1
			&& currentPath.indexOf('ï') === -1
			&& currentPath.indexOf('à') === -1
			&& currentPath.indexOf('è') === -1
			&& currentPath.indexOf('æ') === -1
			&& currentPath.indexOf('ô') === -1
			&& currentPath.indexOf('É') === -1
			&& currentPath.indexOf('œ') === -1
			&& currentPath.indexOf('á') === -1;
		if (!isCharSupported) console.warn('unsupported path: ' + currentPath);
		if (isCharSupported && fs.lstatSync(currentPath).isDirectory()) {
			scan(currentPath, files);
		} else {
			var fileExt = path.extname(file);
			var MediaFileUtil = require("./MediaFileUtil");
			if (MediaFileUtil.isVideoExt(fileExt)
				&& Scanner.isWithinAWeek(fs.lstatSync(pathArgument).mtime)
				&& !MediaFileUtil.hasSub(currentPath)) {
				files.set(file, currentPath);
			}
		}
	});
}

var Scanner = module.exports = {
	scan,
	isWithinAWeek
}