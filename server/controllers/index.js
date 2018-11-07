var path = require('path');
var express = require('express');
var router = express.Router()

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your DIT341 backend project!"});
});

// Insert routes below
router.use('/api/camels', require('./camels'));

// All other routes redirect to the index.html
router.route('/owner').get(function (req, res) {
    res.sendfile(req.app.get('appPath') + '/owner.html');
});

router.route('/buyer').get(function (req, res) {
    res.sendfile(req.app.get('appPath') + '/buyer.html');
});

router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

module.exports = router
