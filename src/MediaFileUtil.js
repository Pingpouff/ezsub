const isVideoExt = (fileExt) => {
	var vidExt = ['.avi', '.mkv', '.mp4'];
	return vidExt.indexOf(fileExt) > -1;
};

const hasSub = (filePath) => {
	var fs = require("fs");
	var path = require("path");
	var srtName = path.basename(filePath, path.extname(filePath)) + '.srt';
	var srtPath = path.join(path.dirname(filePath), srtName);
	//console.log('No srt for file: ' + filePath);
	return fs.existsSync(srtPath);
}

module.exports = {
	isVideoExt,
	hasSub
};