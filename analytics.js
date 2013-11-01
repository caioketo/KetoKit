var NA = require('nodealytics');
var analytics = module.exports;

var initilized = false;

NA.initialize('UA-43898944-1', 'jangadaserver.no-ip.info', function () {
    initilized = true;
});


analytics.fire = function (category, action, label) {
    NA.trackEvent(category, action, label, function (err, resp) {
        
    });
};
