var path = require('path');
var express = require('express');
var router = express.Router()


router.use('/api/urls', require('./url_inputs.js'));

router.route('/').get(function (req, res) { //??
    res.sendfile(req.app.get('appPath') + '/index.html');
});

// Insert routes below
//router.use('/api/camels', require('./camels'));

// All other routes redirect to the index.html
// router.route('/owner').get(function (req, res) {
//     res.sendfile(req.app.get('appPath') + '/owner.html');
// });

// router.route('/buyer').get(function (req, res) {
//     res.sendfile(req.app.get('appPath') + '/buyer.html');
// });

router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your DIT341 backend project!"});
});

module.exports = router
