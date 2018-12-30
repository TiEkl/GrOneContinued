var path = require('path');
var express = require('express');
var router = express.Router()

router.use('/api/dependencies', require('./controller.js'));

/*router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your backend"});
});*/

module.exports = router
