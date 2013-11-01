var mpd = require('mpd'),
    cmd = mpd.cmd

module.exports = KetPlayer;

var player;

function KetPlayer(ketmusic) {
    player = this;
    this.ketmusic = ketmusic;
    this.running = false;
    this.current = null;
    this.playlist = null;
    this.random = false;
    this.currentIndex = -1;
    this.client = mpd.connect({
        port: 6600,
        host: 'localhost',
    });
    this.ready = false;
    this.client.on('ready', function () {
        player.ready = true;
    });
    this.client.on('system-player', function () {
        player.sendCommand(cmd("status", []), function (err, msg) {
            if (err) throw err;
            console.log(msg);
        });
    });
};

KetPlayer.prototype = {
    getCurrent: function () {
        return this.current;
    },
    setPlaylist: function (playlist) {
        this.stop();
        this.playlist = playlist;
    },
    stop: function () {
        var self = this;
        self.client.sendCommand(cmd("clear", []), function (err, msg) {
            self.client.sendCommand(cmd("stop", []), function (err, msg) {
            });
        });
    },
    playNext: function () {
        this.playSong(this.getNext());
    },
    playPrevious: function () {
        this.playSong(this.getPrevious());
    },
    getNext: function () {
        var index = 0;
        if (this.playlist == null) {
            return null;
        }

        if (this.random) {
            index = Math.floor((Math.random() * this.playlist.songs.length) + 1);
        }
        else {
            index = this.currentIndex + 1;
        }

        if (index < this.playlist.songs.length) {
            this.current = this.playlist.songs[index];
        }
        else {
            this.current = this.playlist.songs[0];
        }
        return this.current;
    },
    getPrevious: function () {
        var index = 0;
        if (this.playlist == null) {
            return null;
        }

        if (this.random) {
            index = Math.floor((Math.random() * this.playlist.songs.length) + 1);
        }
        else {
            index = this.currentIndex - 1;
        }

        if (index >= 0) {
            this.current = this.playlist.songs[index];
        }
        else {
            this.current = this.playlist.songs[this.playlist.songs.length - 1];
        }
        return this.current;
    },
    playSong: function (song) {
        var self = this;
        this.stop();
        if (song == null) {
            this.current = this.playlist.songs[0];
        }
        else {
            this.current = song;
        }

        self.client.sendCommand(cmd('clear', []), function (err, msg) {
            //self.ketmusic.GetSongURL(self.current.id, function (songUrl) {
//                console.log('url');
//                self.client.sendCommand(cmd('add', [songUrl]), function (err, msg) {
//                    self.client.sendCommand(cmd('play', []), function (err, msg) {
//                        player.running = true;
//                    });
//                });
//            });
        });

        return this.current;
    }
};
