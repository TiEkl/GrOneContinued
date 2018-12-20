var express = require('express');
var cors = require('cors');
var request = require('request');
var app = express();

app.use(cors());
var port = 8000;
// array of server ip intended to be used in the loadbalancer
var serverip = ['0.0.0.0','10.0.0.0'];

// make a roundrobin algo to select server


// add a check to make sure the server selected is not down : if it dosent respond in x time go to the next server.

function proxyRequestTo (ip,port,endpoint){
    app.use(endpoint, (req,res)=>{
        let url = 'http://'+ ip + ':' + port + endpoint;
        console.log('reroute to: ' + url);
        req.pipe(request(url)).pipe(res);
    });
}

proxyRequestTo(ip, port,'/api/gitProjects');