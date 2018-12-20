var express = require('express');
var cors = require('cors');
var request = require('request');
var app = express();
var roundround = require('roundround');

app.use(cors());
var port = 8000;

function proxyRequestTo (ip,port,endpoint){
    app.use(endpoint, (req,res)=>{
        let url = 'http://'+ ip + ':' + port + endpoint;
        console.log('reroute to: ' + url);
        req.pipe(request(url)).pipe(res);
    });
}

// array of server ip intended to be used in the loadbalancer
var serverip = ['0.0.0.0','10.0.0.0'];

// implement a algo to select server 
var ip = roundround(serverip);


// add a check to make sure the server selected is not down : 
//if it dosent respond in x time go to the next server.


proxyRequestTo(ip(), port,'/api/gitProjects');