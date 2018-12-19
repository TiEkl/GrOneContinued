var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');

// =========== "npm run dev" ============//

//request module is used to route the reqests
var request = require('request');

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlDB';

// Please only modify the port here ffs
var port = process.env.PORT || 8000;
// This variable is here for the proxy request.
var repo_fetcher_port = process.env.PORT || 8001;
var dependency_finder_port = process.env.PORT || 9000;

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

///PROXY REQUESTS START

// LOCAL TESTING - POINTS TO SELF RIGHT NOW
const repo_fetcher = '127.0.0.1';   //want to replace this later with a constant from the constants file
const dependency_finder = '127.0.0.1'; 
// change this ip to other comp when distributed.

//A method that can be reused to reroute requests to different endpoints to be handled by different servers
//note, the endpoint used on the front end should be the same as the endpoint we use here
//and the endpoint we are rerouting to should also be the same, so it should match in 3 places (unless we change the method)


function proxyRequestTo (ip,port,endpoint){
    app.use(endpoint, (req,res)=>{
        let url = 'http://'+ ip + ':' + port + endpoint;
        console.log('reroute to: ' + url);
        req.pipe(request(url)).pipe(res);
    });
}


// here we are telling the program to reroute all requests to /api/repo_fetch
// to the other computer (different ip) on another port
//proxyRequestTo(repo_fetcher,'8001','/api/repo_fetcher');


proxyRequestTo(repo_fetcher, repo_fetcher_port,'/api/gitProjects');
proxyRequestTo(dependency_finder, dependency_finder_port,'/api/dependencies');

///PROXY REQUESTS END



app.use(bodyParser.json({limit: '50mb', extended: true}));
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');


// Import routes
app.use(require('./controllers/index'));  //moved this above body parser

/**********MAIN SERVER listening to 8001 for repo_fetcher**************/
//repo_fetcher is running on port 8001 so main server listens there
// proxy server sends request to this port
// const main_server = '192.168.1.171';    //want to replace this later with a constand from the constants file

// FOR LOCAL TESTING
 const main_server = '127.0.0.1';


app.listen(port, main_server);

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
