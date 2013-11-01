var versao = 2;
var dbVersao = -1;
var fs = require("fs");
var express = require('express');
var app = express();
var file = "ketkit.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
var port = 7575;
var upgraded = false;
var NA = require('nodealytics');
var KetMusic = require('./ketmusic');
var ketmusic = new KetMusic();
var KetPlayer = require('./ketplayer');
var ketplayer = new KetPlayer(ketmusic);
var ketdownloader = require('./ketdownloader')
var KetController = require('./ketcontroller')
var ketcontroller = new KetController();

ketmusic.Login(function () {
    ketmusic.LoadSongs(function () {
        //ketplayer.playSong(ketmusic.songs[0]);
    });
});


var initilized = false;

NA.initialize('UA-43898944-1', 'jangadaserver.no-ip.info', function () {
    initilized = true;
});

if(!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
    if(!exists) {
        db.run("CREATE TABLE Controle (versao INTEGER)");
    }

    db.all("SELECT versao FROM Controle", function (err, all) {
        if (all.length <= 0) {
            var verSQL = db.prepare("INSERT INTO Controle VALUES (?)");
            verSQL.run(versao);
            verSQL.finalize();
        }
        else {
            dbVersao = all[0].versao;
        }
        if (dbVersao < versao) {
            upgradeDB();
        }
    });

});

function feed() {
    db.serialize(function() {
        var stmt = db.prepare("INSERT INTO Produtos VALUES (?, ?, datetime('now'))");
        stmt.run('Teste1', 5, function (error, lastID, changes) {
            if (error == null) {
                stmt.finalize();
                stmt = db.prepare("INSERT INTO Codigos VALUES (?, ?, datetime('now'))");
                stmt.run('123', lastID);
                stmt.finalize();
            }
        });        
    });
}

function upgradeDB() {
    db.serialize(function() {
        if (dbVersao < 1) {
            console.log("Upgrading version 1");
            db.run("CREATE TABLE Produtos (descricao TEXT, quantidade INTEGER, cadastro DATETIME) ");
            db.run("CREATE TABLE Codigos (codigo TEXT, produto_id INTEGER, cadastro DATETIME) ");
        }
        var verSQL = db.prepare("UPDATE Controle SET versao = ? where rowid = 1");
        verSQL.run(versao);
        verSQL.finalize();
        feed();
    });
}

function closeDB() {
    db.close();
}


app.use(express.bodyParser());

app.get('/', function (req, res) {
    console.log('GET /')
    var html = fs.readFileSync('ketkit_index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

app.get('/produtos', function (req, res) {
    db.all("SELECT rowid AS id, descricao, quantidade FROM Produtos", function(err, all) {
        console.log('GET /produtos')
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.end(JSON.stringify(all));
    });
});

app.post('/produtos', function (req, res) {
    console.log('POST /produtos');
    var produto = req.body;
    var stmt = db.prepare("INSERT INTO Produtos VALUES (?, ?, ?)");
    stmt.run(produto.descricao, produto.codigo, produto.quantidade);
    stmt.finalize();
    fireEvent('Produtos', 'POST', produto.descricao);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('OK');
});

app.post('/use/:id', function (req, res) {
    console.log('POST /use/' + req.params.id);
    var stmt = db.prepare("UPDATE Produtos SET quantidade = quantidade - 1 WHERE rowid = ?");
    stmt.run(req.params.id);
    stmt.finalize;
    fireEvent('Produtos', 'use', req.params.id);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('OK');
});

app.get('/controller', function (req, res) {
    console.log('GET /controller')
    var html = fs.readFileSync('controller.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

app.get('/canais', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.end(JSON.stringify(ketcontroller.canais));
});

app.post('/canal/:canal', function (req, res) {
    ketcontroller.mudaCanal(req.params.canal);
});

app.get('/downloader', function (req, res) {
    console.log('GET /downloader')
    var html = fs.readFileSync('downloader.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

app.post('/downloader', function (req, res) {
    console.log('POST /downloader')
    var download = req.body;
    ketdownloader.download(download.url, download.arq, function (data) {
        console.log(data);
    });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('OK');
});


function fireEvent(category, action, label) {
    NA.trackEvent(category, action, label, function (err, resp) {
        console.log(resp);
    });
}

app.listen(port);
console.log('Listening at http://jangadaserver.no-ip.info:' + port)
