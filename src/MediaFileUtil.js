const fileExtentions = {
	avi: '.avi',
	mkv: '.mkv',
	mp4:'.mp4',
	srt: '.srt'
}

const isVideoExt = (fileExt) => {
	var vidExt = [fileExtentions.avi, fileExtentions.mkv, fileExtentions.mp4];
	return vidExt.indexOf(fileExt) > -1;
};

const hasSub = (filePath) => {
	var fs = require("fs");
	var path = require("path");
	var srtName = path.basename(filePath, path.extname(filePath)) + fileExtentions.srt;
	var srtPath = path.join(path.dirname(filePath), srtName);
	return fs.existsSync(srtPath);
}

module.exports = {
	isVideoExt,
	hasSub
};