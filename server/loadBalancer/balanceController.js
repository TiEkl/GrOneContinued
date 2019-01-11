/*********IMPORTS***********/
var express = require('express');
var cors = require('cors');
var request = require('request');
var app = express().post('*', balanceLoad).get('*', balanceLoad);
var roundround = require('roundround');

var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');

const isReachable = require('is-reachable');
/**********IMPORTS END**********/

//THIS LOAD BALANCER IS RUNNING ON PORT 8002
const load_balancer_port = 8002;

//I removed http:// from all these since is-reachable would say some of them are offline if i included it 
const bbServer1withPort = '192.168.43.26:8000';
const bbServer2withPort = '192.168.43.168:8000'; 

// array of server ip intended to be used in the loadbalancer
var serverips = [bbServer2withPort,bbServer1withPort];
// round robin selection of server
var ips = roundround(serverips); 
app.use(cors());

//LoadBalancer for requests, if all servers are down we send error back
//if at least 1 server is down we try one, and if its online we route the request to it
//of it was offline we try again with the next server in the list using a recursive call
function balanceLoad(req,res){
    var http = 'http://';
    var current_ip = ips();
    //console.log('           ***current: '+current_ip);
    (async ()=>{
        if( !await isReachable(bbServer1withPort) && !await isReachable(bbServer2withPort) ){ //these should be if(false and false)
            //both servers are down, nothing we can do but wait for them to go back up and redo request
            console.log('ALL SERVERS OFFLINE');
            res.status(500).send({message:'Server offline'}); //should send back error msg to front end so that it can go into the catch brackets
        }
        else if(await isReachable(current_ip)){
            const request_url = http + current_ip + req.url;
            console.log('Rerouting to: ' + request_url);
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



///***************************************************************/
///All the stuff an app.js needs. (Not sure if we need all of them).
//Now we can run balanceController.js on port 8002 so that we can make a request from the front end to port 8002
//and the balancer will reroute it
app.use(bodyParser.json({limit: '150mb', extended: true}));
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

app.listen(load_balancer_port, function(err) {
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
