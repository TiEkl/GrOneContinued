var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var ip = require('ip');
const portscanner = require('portscanner');
var request = require('request');

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlDB';

// Please only modify the port here
var port = process.env.PORT || 8000;

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
app.use(bodyParser.json({limit: '150mb', extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/../..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');

// Import routes
app.use('/api/bb', require('./bbMiddleware'));

// FOR syncing
const mainServer = '192.168.43.26';
const remoteServer = '192.168.43.168';   //want to replace this later with a constant from the constants file
var remoteIp = ip.address() === mainServer ? remoteServer : mainServer;
var localIp =  ip.address() === mainServer ? ip.address() : remoteServer;

var localURL = 'http://'+ localIp + ':' + port + '/api/bb';
var remoteURL = 'http://'+ remoteIp + ':' + port + '/api/bb/';

console.log("     REMOTE IP: " + remoteIp);
console.log("     LOCAL IP: " + localIp);

function syncDb() {
    // GET Local server's projects
     request(localURL, function (err, response, body) { //body has local objects
        var localData = JSON.parse(body);
        if(localData != undefined) { 
             // GET remote server's projects
             request(remoteURL, function (error, response2, resRemoteBody) { //remotebody has remote objects
                var remoteData = JSON.parse(resRemoteBody);                 
                if(remoteData != undefined) {
                     //Iterate through all local projects
                     for(var i = 0 ; i < localData.projectSchemas.length; i++) {
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
                                   
                                }
                            });
                         }

                         // if remote has projects compare each local project's id to remote's
                         else if (remoteData.projectSchemas.length > 0) {
                             var hasProject = false;
                            for(var n = 0; n < remoteData.projectSchemas.length; n++) {
                                if(remoteData.projectSchemas[n].graphid === localData.projectSchemas[i].graphid){
                                    hasProject = true;
                                }
                            }
                             //if the project is not in remote, then push it
                             if (!hasProject) {
                                 console.log("****** Syncing: " + localData.projectSchemas[i].graphid + " ******");
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
                                     if (!err && res.statusCode == 201) {
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
 setInterval(function () {
    //portscanner checks if remote is dead. Only begin sync if not offline.
    portscanner.checkPortStatus(port, remoteIp, function(error, status) {
      // Status is 'open' if currently in use or 'closed' if available
       console.log("Remote server status: " + status);
       if (status === "open") {syncDb();}
       if (status === "closed") {console.log("Remote server offline")}
    })
 }, 5000)

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

app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`bbManager: http://${localIp}:${port}/api/bb`);

});

module.exports = app;
