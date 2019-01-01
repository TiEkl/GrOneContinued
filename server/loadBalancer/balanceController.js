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
// round robin selection of server
var ips = roundround(serverips);
app.use(cors());

//here is the working version of balanceLoad, tested and working for all cases
function balanceLoad(req,res){
    var http = 'http://';
    var current_ip = ips();
    console.log('           ***current: '+current_ip);
    (async ()=>{
        if( !await isReachable(bbServer1withPort) && !await isReachable(bbServer2withPort) ){ //these should be if(false and false)
            //both servers are down, nothing we can do but wait for them to go back up and redo request
            console.log('ALL SERVERS OFFLINE');
            res.status(500).send({message:'Server offline'}); //should send back error msg to front end so that it can go into the catch brackets
        }
        else if(await isReachable(current_ip)){
            const request_url = http + current_ip + req.url;
            console.log('The first server tried was online');
            const request_server = request({ url: request_url}).on('error', (error) => {
                res.status(500).send(error.message);
            }); 
            req.pipe(request_server).pipe(res); 
            
        }
        else{ //if we know 1 BB is online but the first one we tried was not, we try again with the 2nd one using a callback.
            console.log('The first server tried was NOT online, try NEXT');
            return balanceLoad(req,res);
        }
    })();
}

//Method that allows us to use any number of bb's (Not working currently saved bc we might need it later)
/*function balanceLoad(req,res){
    //console.log('WHERE we SEND the stuff '+serverips[current] + req.url);
    var http = 'http://';
    var current_ips = ips();
    console.log('           ***current: '+current_ips);
    (async ()=>{
        if(!checkAvailability()){
        console.log('All servers down');
         return;
         }
         else{ 
            if(await isReachable(current_ips)){
                const request_url = http + current_ips + req.url;
                console.log('The first server tried was online');
                const request_server = request({ url: request_url}).on('error', (error) => {
                    res.status(500).send(error.message);
                }); 
                req.pipe(request_server).pipe(res);
            }
            else{
                console.log('The first server tried was NOT online, try NEXT');
            return balanceLoad(req,res);
            }
        }
    })();
}
   */ 
//Check if the servers are up and runnning before we attempt to connect to them
//performs a handshake with the server and returns true if the server responded and is up
/*
function checkAvailability(){
    (async ()=>{
        var i;
            for(i = 0; i <= serverips.length, i++;){
                if(await isReachable(serverips[i])){
                 return true;
                } 
            return false;
            }
    })();
}
*/

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
