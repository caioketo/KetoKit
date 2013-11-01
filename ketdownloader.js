var youtubedl = require('youtube-dl');
var ffmpeg = require('ffmpeg-node');
var acoustid = require('acoustid');
var walk = require('walk')
    , fs = require('fs')
    , options
    , walker;

module.exports.download = function (url, output, cb) {
    "use strict";
    options = {
        followLinks: false
        , filters: []
    };
    var dl = youtubedl.download(url,
        './downloads/', []);
    dl.on('end', function (data) {
        walker = walk.walk("./downloads", options);
        walker.on("file", function (root, fileStats, next) {
            if (fileStats.name.indexOf("mp3") > 0) {
                return;
            } 
            fixFile(fileStats.name, function (file, artist, album, title) {
                ffmpeg.exec(["-i", file, "-acodec",
                    "copy", "-metadata", "title=" + title, "album=" + album, "artist=" + artist, 
                    "/home/pi/musics/" + file.substr(0, file.length - 3) + "mp3"], function () {
                        console.log('ok');
                    });
            });
        });
    });
};


function fixFile(file, cb) {
    acoustid(file, { key: "8XaBELgH" }, function (err, results) {
        if (err || results.length == 0) {
            cb("", "", "");
        }
        var record = results[0].recordings[0];
        var artist = record.artists[0].name;
        var album = record.releasegroups[0].title;
        var title = record.title;
        cb(file, artist, album, title);
    });
}
