var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
var ip = require('ip');
const portscanner = require('portscanner');

// =========== "npm run dev" ============//

//request module is used to route the requests
var request = require('request');

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlDB';

// Please only modify the port here ffs
var port = process.env.PORT || 8000;
//var localSyncTestPort = process.env.PORT || 7999;
// This variable is here for the proxy request.
var repo_fetcher_port = process.env.PORT || 8001;
var dependency_finder_port = process.env.PORT || 9000;

var repo_fetcher = '127.0.0.1';
var dependency_finder = '127.0.0.1';

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


proxyRequestTo(repo_fetcher,repo_fetcher_port,'/api/gitProjects');
proxyRequestTo(dependency_finder,dependency_finder_port,'/api/dependencies');

app.use(bodyParser.json({limit: '50mb', extended: true}));
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

// FOR syncing
const main_server = '192.168.43.56';
const remote_server = '192.168.43.168';   //want to replace this later with a constant from the constants file
var remoteIp = ip.address() === main_server ? remote_server : main_server;
var localIp =  ip.address() === main_server ? ip.address() : remote_server;

// change this ip to other comp when distributed.

//A method that can be reused to reroute requests to different endpoints to be handled by different servers
//note, the endpoint used on the front end should be the same as the endpoint we use here
//and the endpoint we are rerouting to should also be the same, so it should match in 3 places (unless we change the method)
function proxyRequestTo (ip,port,endpoint){
    console.log("ip: " + ip);
    app.use(endpoint, (req,res)=>{
        let request_url = 'http://'+ ip + ':' + port + endpoint;
        console.log('reroute to: ' + request_url);

        const request_server = request({url: request_url}).on('error', (error) => {
            res.status(500).send(error.message);
        });
        req.pipe(request(request_server)).pipe(res);
    });
}

var localURL = 'http://'+ localIp + ':' + port + '/api/bb';
var remoteURL = 'http://'+ remoteIp + ':' + port + '/api/bb/project';

console.log("     REMOTE IP: " + remoteIp);
console.log("     LOCAL IP: " + localIp);

function syncDb() {
    console.log(ip.address())
    // GET Local server's projects
     request(localURL, function (err, response, body) { //body has local objects
        var localData = JSON.parse(body);
        if(localData != undefined) { 

             // console.log("    Local JSON Data: " + JSON.stringify(localData.projectSchemas));
             console.log("       Local data length: " + localData.projectSchemas.length);

             // GET remote server's projects
             request(remoteURL, function (error, response2, resRemoteBody) { //remotebody has remote objects
                var remoteData = JSON.parse(resRemoteBody);                 
                if(remoteData != undefined) {

                     // console.log("    Remote JSON Data: " + JSON.stringify(remoteData.projectSchemas));
                     console.log("       Remote data length: " + remoteData.projectSchemas.length);

                     //Iterate through all local projects
                     for(var i = 0 ; i < localData.projectSchemas.length; i++) {
                         // do get request of remoteDB to check if all ids present in remote
                         // if not add object of that id

                         // First check if remote server is empty > if empty put everything
                         if (remoteData.projectSchemas.length <= 0) {
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
                                if(!err && res.statusCode == 201) {
                                   // console.log("body: " + body);
                                }
                            });
                         }

                         // if remote has projects compare each local project's id to remote's
                         else if (remoteData.projectSchemas.length > 0) {
                             var hasProject = false;
                            for(var n = 0; n < remoteData.projectSchemas.length; n++) {
                                console.log("    Current Remote: >> " + remoteData.projectSchemas[n]._id);
                                console.log("    Current Local: >> " + localData.projectSchemas[i]._id);

                                if(remoteData.projectSchemas[n]._id === localData.projectSchemas[i]._id){
                                    hasProject = true;
                                }
                            }
                             //if the project is not in remote, then push it
                             if (!hasProject) {
                                 var options = {
                                     method: 'POST',
                                     body: localData.projectSchemas[i],
                                     json: true,
                                     uri: remoteURL,
                                     headers: {
                                         'Content-Type': 'application/json'
                                     }
                                 };
                                 request(options, function (err, res, body) {
                                     console.log("res: " + JSON.stringify(res));
                                     if (!err && res.statusCode == 201) {
                                         console.log("body: " + body);
                                     }
                                 });
                             }
                         }
                     };
                 }
             });
         }
     });
 }

 // Basic version of syncing db every 5 seconds.
 /*setInterval(function () {
    //portscanner checks if remote is dead. Only begin sync if not ded.
    portscanner.checkPortStatus(port, remoteIp, function(error, status) {
      // Status is 'open' if currently in use or 'closed' if available
       console.log("remote server status: " + status);
       if (status === "open") {syncDb();}
       if (status === "closed") {console.log("remote server ded")}
    })
 }, 5000)*/

/**********MAIN SERVER listening to 8001 for repo_fetcher**************/
//repo_fetcher is running on port 8001 so main server listens there
// proxy server sends request to this port
// const main_server = '192.168.1.171';    //want to replace this later with a constand from the constants file

//app.listen(port, localIp);

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

app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend: http://localhost:${port}/`);

});



module.exports = app;
