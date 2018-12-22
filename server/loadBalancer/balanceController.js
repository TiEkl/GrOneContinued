/*********IMPORTS***********/
var express = require('express');
var cors = require('cors');
var request = require('request');
var app = express();
var roundround = require('roundround');
//var router = express.Router();

var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');

const isReachable = require('is-reachable');
/**********IMPORTS END**********/

//THIS LOAD BALANCER IS RUNNING ON PORT 8002
const load_balancer_port = 8002;

const bbServer1 = 'http://127.0.0.1';
const bbServer2 = 'http://127.0.0.1'; //set to 8002 for now but that will change
const bbServer1withPort = 'http://127.0.0.1:8000';
const bbServer2withPort = 'http://127.0.0.1:8003'; //set to 8002 for now but that will change
const bbServer1Port = 8000;
const bbServer2Port = 2; //doesnt exist yet 

// array of server ip intended to be used in the loadbalancer
var serverips = [bbServer1withPort,bbServer2withPort];
// implement a algo to select server 
var ips = roundround(serverips);

app.use(cors());

//Check if the servers are up and runnning before we attempt to connect to them
//performs a handshake with the server and returns true if the server responded and is up
function checkAvailability(){
    (async ()=>{
        console.log('check if blackboard1 is up: ' + await isReachable(bbServer1withPort));
        console.log('check if blackboard2 is up: ' + await isReachable(bbServer2withPort));
    })();
}

function proxyRequestTo (ip,endpoint){
    app.use(endpoint, (req,res)=>{
        
        if((async ()=>{await isReachable(bbServer1withPort)})() && (async ()=>{await isReachable(bbServer2withPort)})()){
            //both servers are down, nothing we can do
        }
        else if((async ()=>{await isReachable(ip)})()){
            let url = ip + endpoint;
            console.log('reroute to: ' + url);
            req.pipe(request(url)).pipe(res);
        }
        else{ //maybe can do this better with a recursive function! (BUT then it could become a never ending LOOP if both servers are down)
            console.log('ip of ' + ip + ' not online');
            ip = ips(); //if the first one wasnt online we jump to the next one (not good cuz its hardcoded so if we add more servers this is bad)
            if((async ()=>{await isReachable(ip)})()){
                let url = ip + endpoint;
                console.log('reroute to: ' + url);
                req.pipe(request(url)).pipe(res);
            }
            else{
                console.log('both servers offline');
            }
        }
    
    });
}

// add a check to make sure the server selected is not down : 
//if it dosent respond in x time go to the next server.

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

// Import routes
//app.use(require('./balanceController'));

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