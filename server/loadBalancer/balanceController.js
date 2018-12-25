/*********IMPORTS***********/
var express = require('express');
var cors = require('cors');
var request = require('request');
var app = express();
var roundround = require('roundround');
//var router = express.Router();

var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');

const isReachable = require('is-reachable');
/**********IMPORTS END**********/

//THIS LOAD BALANCER IS RUNNING ON PORT 8002
const load_balancer_port = 8002;

//I removed http:// from all these since is-reachable would say some of them are offline if i included it 
const bbServer1 = '127.0.0.1';
const bbServer2 = '127.0.0.1'; //set to 8002 for now but that will change
const bbServer1withPort = '127.0.0.1:8000';
const bbServer2withPort = '127.0.0.1:8005'; //set to 10.000 for now but that will change
const bbServer1Port = 8000;
const bbServer2Port = 10000; 

// array of server ip intended to be used in the loadbalancer
var serverips = [bbServer2withPort,bbServer1withPort];
// implement a algo to select server 
var ips = roundround(serverips);

app.use(cors());

//Check if the servers are up and runnning before we attempt to connect to them
//performs a handshake with the server and returns true if the server responded and is up
function checkAvailability(){
    (async ()=>{
        console.log('check if blackboard1 is up: ' + await isReachable(bbServer2withPort));
        console.log('check if blackboard2 is up: ' + await isReachable(bbServer1withPort));
        if(await isReachable(bbServer1withPort)){
            console.log('its all true! well 1 atleast');
        }
        if(!await isReachable(bbServer2withPort)){
            console.log('its all false! well 1 atleast');
        }
    })();
}

function proxyRequestTo (ip,endpoint){
    
    
    app.use(endpoint, (req,res)=>{   
        (async ()=>{
            console.log('   BEGINNING OF method, the initial ip: '+ip+endpoint);
            if( !await isReachable(bbServer1withPort) && !await isReachable(bbServer2withPort) ){ //these should be if(false and false)
                //both servers are down, nothing we can do but wait for them to go back up and redo request
                console.log('ALL SERVERS OFFLINE');
            }
            else if(await isReachable(ip)){ //if the server is online we reroute request to it
                console.log(await isReachable(ip));
                console.log('The first server tried was online');
                let url = 'http://'+ip + endpoint;
                console.log('reroute to: ' + url);
                req.pipe(request(url)).pipe(res);
                
            }
            else{ //if the first server we tried is down we try again.
                console.log(await isReachable(ip));
                console.log('first server tried was not online, try again with recursive call');
                ip = ips();
                console.log(ip); //should be the next ip in the array
                return proxyRequestTo(ip,endpoint);
            }
        })();
    });
    

 
}

checkAvailability();
proxyRequestTo(ips(),'/api/gitProjects'); 



///All the stuff an app.js needs. (Not sure if we need all of them).
//Now we can run balanceController.js on port 8002 so that we can make a request from the front end to port 8002
//and the balancer will reroute it
app.use(bodyParser.json());
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');

/********** Listening to a port **************/
// DISTRIBUTED
        // let load_balancer = '192.168.43.168';      //want to replace this later with a constand from the constants file
// LOCAL TESTING - POINTS TO SELF
        let load_balancer = '127.0.0.1';

app.listen(load_balancer_port, load_balancer, function(err) {
    if ( err ) throw err;
    console.log("load_balancer listening on port " + load_balancer_port);
});
/**************************************/

// Error handler (must be registered last)
var env = app.get('env');
app.use(function(err, req, res, next) {
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

module.exports = app;
//module.exports = router;