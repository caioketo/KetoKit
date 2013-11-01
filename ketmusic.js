var ketclasses = require('./ketclasses')
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var restler = require('restler');

module.exports = KetMusic;

function KetMusic() {
    this.googleAuth = new GoogleClientLogin({
        email: 'caionmoreno1@gmail.com',
        password: 'vd001989',
        service: 'sj',
        accountType: GoogleClientLogin.accountTypes.google
    });
    this.loggedIn = false;
    this.songs = [];
    this.playlists = [];
};

KetMusic.prototype = {
    Login: function (cb) {
        var self = this;
        self.googleAuth.on(GoogleClientLogin.events.login, function () {
            self._getCookies(function () {
                if (!self.logged) {
                    self.logged = true;
                    cb();
                }
            });
        });
        this.googleAuth.login();
    },
    LoadSongs: function (cb) {
        var self = this;
        self.GetAllSongs(function (result) {
            console.log('GetAllSongs');
            try {
                var songs = result.playlist;
                var len = songs.length;
                for (var i = 0; i < len; i++) {
                    var song = new ketclasses.Song();
                    song.id = songs[i].id;
                    song.title = songs[i].title;
                    song.artist = songs[i].artist;
                    song.album = songs[i].album;
                    song.duration = songs[i].durationMillis;
                    self.songs.push(song);
                }
                cb();
            }
            catch (e) {}
        });
    },
    LoadPlaylists: function () {
    },
    GetSongURL: function (songId, callback) {
        return this._sendRequest('post', 'https://play.google.com/music/play?u=0&songid=' + songId + '&pt=e', null, null, callback);
    },
    GetPlaylist: function (playlistId, callback) {
        var option = {};
        if (playlistId != "All") {
            option = { id: playlistId };
        }
        return this._sendRequest('post', 'https://play.google.com/music/services/loadplaylist', option, null, callback);
    },
    GetAllSongs: function(callback) {
        var option = {};
        option.continuationToken = '';
        return this._sendRequest('post','https://play.google.com/music/services/loadalltracks', option, null, callback);
    },
    _getCookies: function (callback) {
        var self = this;
        self._sendRequest('get', 'https://play.google.com/music/listen?u=0', null, null, function (result, response) {
            self.cookies = {};
            response.headers['set-cookie'] && response.headers['set-cookie'].forEach(function (cookie) {
                var parts = cookie.split('=');
                self.cookies[parts[0].trim()] = (parts[1] || '').trim();
            });
            callback();
        });
    },
    _sendRequest: function (type, url, option, body, callback) {
        var self = this;
        if ((callback === null || callback === undefined) && body !== null) {
            callback = body;
            body = null;
        }

        if ((callback === null || callback === undefined) && option !== null) {
            callback = option;
            option = null;
        }

        if (body && typeof body == 'object') {
            body = JSON.stringify(body)
        }

        if (self.googleAuth.getAuthId() === undefined) {
            throw 'Try to login first';
        }

        callback = callback || function () { };
        option = option || {};

        var restRequest = null;
        var requestOption = { query: option, parser: restler.parsers.json };
        requestOption.headers = {};
        requestOption.headers['Authorization'] = 'GoogleLogin auth=' + self.googleAuth.getAuthId();
        if (body) {
            requestOption.data = body;
            requestOption.headers['content-type'] = 'application/json';
        }

        switch (type.toLowerCase()) {
            case 'post': restRequest = restler.post(url + '?u=0&xt=' + this.cookies['xt'], requestOption);
                break;
            default: restRequest = restler.get(url, requestOption);
        }


        restRequest.on('complete', function (result, response) {
            if (result instanceof Error || response.statusCode != 200) {
                callback(result, response);
            }
            return callback(result, response);
        });
    }
};





