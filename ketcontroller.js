var canaisF = require('./canais.json');
var exec = require('child_process').exec


module.exports = KetController;

function KetController() {
    this.canais = canaisF.canais;
}

KetController.prototype = {
    mudaCanal: function (canal) {
        for(var i = 0; i < canal.length; i++)
        {
            var key = "KEY_" + canal.charAt(x);
            exec('irsend SEND_ONCE gvt ' + key, function (err, stdout, stderr) {
                console.log(stdout);
            });
        }        
    },
    mudaVolume: function (up) {
        if (up) {
            exec('irsend SEND_ONCE gvt KEY_VOLUMEUP', function (err, stdout, stderr) {
                console.log(stdout);
            });
        }
        else {
            exec('irsend SEND_ONCE gvt KEY_VOLUMEDOWN', function (err, stdout, stderr) {
                console.log(stdout);
            });
        }
    }
}