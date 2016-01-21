var Sub = require("./sub-downloader.js");

// Prototyping module split
var os = module.exports = function() {
	this.sub = new Sub();
};
