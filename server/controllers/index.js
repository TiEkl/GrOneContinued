var path = require('path');
var express = require('express');
var router = express.Router()

var projectSchema = require('../models/projectNode.js');

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your DIT341 backend project!"});
});


//Get request to get graph data for a specific project based on ID
router.get('/api/:graphid',function(req,res,next){
    console.log('        index   id: '+ req.params.graphid);
    var the_id = req.params.graphid;
    projectSchema.findOne(({
        graphid: the_id
    }), (err, data)=>{
        if(err){
            return next(err)
        }
        //console.log('**jsonRES** '+ JSON.stringify(data) + ' end jsonRES***');
        res.status(200).json({ 'data' : data });
    });
});

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

// All other routes redirect to the index.html
router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

module.exports = router;
