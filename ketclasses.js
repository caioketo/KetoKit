module.exports.Song = Song;
module.exports.Playlist = Playlist;

function Song() {
    this.id = '';
    this.title = '';
    this.artist = '';
    this.album = '';
    this.duration = 0;
}

function Playlist() {
    this.id = '';
    this.name = '';
    this.songs = [];
}