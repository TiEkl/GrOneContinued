var path = require('path');
var express = require('express');
var router = express.Router()

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your DIT341 backend project!"});
});
router.use('/api/urls', require('./url_inputs.js'));

/***********PROXY SERVER**************************/
//var httpProxy = require('http-proxy');
//var apiProxy = httpProxy.createProxyServer();
// IP address of target server. should be designated in proxy server.
//var serverOne = 'http://192.168.1.101:8001';
//var serverOne = 'http://192.168.43.181:8001';
//var filterDataServer = 'http://localhost:8002';
/*
router.all("/app1/*", function ( req, res ) {
    console.log("fetch repo server");
    apiProxy.web(req, res, { target : serverOne} );

});
*/
/*************************************************/

/*router.route('/').get(function (req, res) { //??
    res.sendfile(req.app.get('appPath') + '/index.html');
});*/

// Insert routes below
router.use('/api/gitProjects', require('../RepoFetcher/repoController'));

// All other routes redirect to the index.html
router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

module.exports = router;
