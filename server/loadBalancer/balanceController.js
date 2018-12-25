/*********IMPORTS***********/
var express = require('express');
var cors = require('cors');
var request = require('request');
var app = express().post('*', balanceLoad).get('*', balanceLoad);
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

var current = 0;

app.use(cors());

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
                current = (current+1) % serverips.length;
                
            }
            else{ //if the first server we tried is down we try again.
                current = (current+1) % serverips.length;
                console.log(await isReachable(ip));
                console.log('first server tried was not online, try again with recursive call');
                ip = serverips[current];
                console.log(ip); //should be the next ip in the array
                return proxyRequestTo(ip,endpoint);
            }
        })();
    });
}

//this is very similar to the other function, but for this function the recursive call works 
//(which it didnt for the other one since it was set as a middleware)
//so with this one is a BB is down it will not try to connect to it. and it will use the recursive call to try to find it again
//for some reason there is still the problem that I think the method is sending the same request twice for some reason
function balanceLoad(req,res){
    console.log('WHERE we SEND the stuff '+serverips[current] + req.url);
    var http = 'http://';
    (async ()=>{
        if( !await isReachable(bbServer1withPort) && !await isReachable(bbServer2withPort) ){ //these should be if(false and false)
            //both servers are down, nothing we can do but wait for them to go back up and redo request
            console.log('ALL SERVERS OFFLINE');
        }
        else if(await isReachable(serverips[current])){
            console.log('The first server tried was online');
            req.pipe(request({url: http + serverips[current] + req.url})).pipe(res); //will not work now since we are not just calling /api/gitprojects in the front end!!
            current = (current+1) % serverips.length;
        }
        else{ //a bit hardcoded so should change this bit!
            console.log('The first server tried was NOT online, try NEXT');
            current = (current+1) % serverips.length;
            return balanceLoad(req,res);
        }
    })();
    
}

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

checkAvailability();
//proxyRequestTo(serverips[current],'/api/gitProjects'); 



///All the stuff an app.js needs. (Not sure if we need all of them).
//Now we can run balanceController.js on port 8002 so that we can make a request from the front end to port 8002
//and the balancer will reroute it
app.use(bodyParser.json({limit: '50mb', extended: true}));
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