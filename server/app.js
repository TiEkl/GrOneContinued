var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
var ip = require('ip');

var _ = require('lodash');
require('apply-diff')(_);

// =========== "npm run dev" ============//

//request module is used to route the reqests
var request = require('request');

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlDB';

// Please only modify the port here ffs
var port = process.env.PORT || 8000;
// This variable is here for the proxy request.
var repo_fetcher_port = process.env.PORT || 8001;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true }, function (err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

// Create Express app
var app = express();
//use cors to allow github
app.use(cors());

// Import routes
//app.use(require('./controllers/index'));
app.use('/api/bb', require('./controllers/bbMiddleware'));

///PROXY REQUESTS START

// LOCAL TESTING - POINTS TO SELF RIGHT NOW
// FOR LOCAL TESTING
const main_server = '192.168.1.104';
const repo_fetcher = '192.168.1.100';   //want to replace this later with a constant from the constants file
var remoteIp = ip.address() === main_server ? repo_fetcher : main_server;
var localIp =  ip.address() === main_server ? ip.address() : repo_fetcher;

// change this ip to other comp when distributed.

//A method that can be reused to reroute requests to different endpoints to be handled by different servers
//note, the endpoint used on the front end should be the same as the endpoint we use here
//and the endpoint we are rerouting to should also be the same, so it should match in 3 places (unless we change the method)
function proxyRequestTo (ip,port,endpoint){
    console.log("ip: " + ip);
    app.use(endpoint, (req,res)=>{
        console.log(endpoint);
        let url = 'http://'+ ip + ':' + port + endpoint;
        let remoteUrl = 'http://'+ remoteIp + ':' + port + endpoint;
        console.log('reroute to: ' + url);
        req.pipe(request(url)).pipe(res);
    });
}
var testURL = 'http://'+ localIp + ':' + port + '/api/bb';
var remoteURL = 'http://'+ remoteIp + ':' + port + '/api/bb';

var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

var options = {
    url: remoteURL,
    method: 'POST',
    headers: headers,
    form: {'key1': 'xxx', 'key2': 'yyy'}
}

//var testGET = request(testURL).pipe(request.put(testURL+"/5c19664e388e0ebe40fad19f"));
request(testURL, function (err, response, body) {
    var j = JSON.parse(body);
    request(remoteURL, function (error, response2, body2) {
        var jsonRemote = JSON.parse(body2);
        console.log("jsonremote: " + jsonRemote);
        for(var i = 0 ; i < j.length; i++){
            // do get request of remoteDB to check if all ids present in remote
            // if not add object of that id

            if(jsonRemote.length < 1){
                console.log(j[i]);
                var postData = {
                    projectName: j[i].projectName,
                    classes: j[i].classes
                };
                var options = {
                    method: 'post',
                    body: postData,
                    json: true,
                    url: remoteURL
                };
                request(options, function(e,r,body){
                    if(!err && r.statusCode == 200) {
                        console.log(body);
                    }
                });
                /*request.post(remoteURL, {
                    body:JSON.stringify(j[i])
                    //json:j[i]
                }, function(e, r, b) {
                    console.log(b);
                    console.log(r.statusCode);
                });*/
            }
            /*request(testURL+'/'+json[i]._id, function (err, response, body) {
                console.log(JSON.parse(body));
            });*/
        };
    });
    //console.log(json);
});

//proxyRequestTo(remoteIp, port, '/api/bb'); 
//proxyRequestTo(remoteIp, port, '/api/dependencies'); 

// here we are telling the program to reroute all requests to /api/repo_fetch
// to the other computer (different ip) on another port
//proxyRequestTo(repo_fetcher,'8001','/api/repo_fetcher');


///PROXY REQUESTS END


app.use(bodyParser.json());
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');

/**********MAIN SERVER listening to 8001 for repo_fetcher**************/
//repo_fetcher is running on port 8001 so main server listens there
// proxy server sends request to this port
// const main_server = '192.168.1.171';    //want to replace this later with a constand from the constants file




app.listen(port, localIp);

/**************************************/

// Error handler (must be registered last)
var env = app.get('env');
app.use(function (err, req, res, next) {
    console.error(err.stack);
    var err_res = {
        "message": err.message,
        "error": {}
    };
    if (env === 'development') {
        err_res["error"] = err;
    }
    res.status(err.status || 500);
    res.json(err_res);
});
//var port = 3000;
var arrayOfClass = [];

/*app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend: http://localhost:${port}/`);
    
});*/



module.exports = app;
