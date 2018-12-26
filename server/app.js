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

//request module is used to route the requests
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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');


// Import routes
//app.use(require('./controllers/index'));
app.use('/api/bb', require('./controllers/bbMiddleware'));

///PROXY REQUESTS START

// LOCAL TESTING - POINTS TO SELF RIGHT NOW
// FOR LOCAL TESTING
const main_server = '192.168.1.104';
const repo_fetcher = '192.168.1.101';   //want to replace this later with a constant from the constants file
var remoteIp = ip.address() === main_server ? repo_fetcher : main_server;
var localIp =  ip.address() === main_server ? ip.address() : repo_fetcher;

// change this ip to other comp when distributed.

//A method that can be reused to reroute requests to different endpoints to be handled by different servers
//note, the endpoint used on the front end should be the same as the endpoint we use here
//and the endpoint we are rerouting to should also be the same, so it should match in 3 places (unless we change the method)
function proxyRequestTo (ip,port,endpoint){
    console.log("ip: " + ip);
    app.use(endpoint, (req,res)=>{
        let url = 'http://'+ ip + ':' + port + endpoint;
        console.log('reroute to: ' + url);
        req.pipe(request(url)).pipe(res);
    });
}
var localURL = 'http://'+ localIp + ':' + port + '/api/bb';
var remoteURL = 'http://'+ remoteIp + ':' + port + '/api/bb';

console.log("     REMOTE IP: " + remoteIp);
console.log("     LOCAL IP: " + localIp);

setInterval(function(){
    syncDb();
}, 5000);

function syncDb(){
    request(localURL, function (err, response, body) { //body has local objects
        if(typeof body != undefined){
            var localData = JSON.parse(body);
            console.log(localData);
            console.log("    Local JSON Data: " + JSON.stringify(localData.projectSchemas));
        
            request(remoteURL, function (error, response2, resRemoteBody) { //remotebody has remote objects
                if(typeof resRemoteBody != undefined){
                    var remoteData = JSON.parse(resRemoteBody);
                    console.log("       Remote Json Data: " + JSON.stringify(remoteData.projectSchemas));
        
                    for(var i = 0 ; i < localData.projectSchemas.length; i++){
                        // do get request of remoteDB to check if all ids present in remote
                        // if not add object of that id
                        console.log("       Local data length: " + localData.projectSchemas.length);
                        
                        for(var n = 0; n < remoteData.projectSchemas.length; n++){
                            console.log(remoteData.projectSchemas[n]);
                            console.log(localData.projectSchemas[i]);
                            //if the project is not in remote, then push it
                            if(!remoteData.projectSchemas[n]._id.equals(localData.projectSchemas[i]._id)) {
                                var options = {
                                    method: 'POST',
                                    body: localData.projectSchemas[i],
                                    json: true,
                                    uri: remoteURL,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                };
                                request(options, function(err,res,body){
                                    console.log("res: " + JSON.stringify(res));
                                    if(!err && res.statusCode == 201) {
                                        console.log("body: " + body);
                                    }
                                });
                            } else {
                                continue;
                            }
                        }
            
                    };
                }
        
        
            });
        }
    });
    
}

// here we are telling the program to reroute all requests to /api/repo_fetch
// to the other computer (different ip) on another port
//proxyRequestTo(repo_fetcher,'8001','/api/repo_fetcher');


///PROXY REQUESTS END



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
