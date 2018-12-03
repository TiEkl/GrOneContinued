var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');

// =========== "npm run dev" ============//

//request module is used to route the reqests
var request = require('request');

/** CLUSTERING  **/
// fork can only create new NodeJs processes. You give it a js file
// to execute
/*const { fork } = require('child_process');
const child = fork('server/otherApp.js');

// process.on receives a message while process.send sends a message to
// another process
child.on('message', message => {
    console.log('message from child: ', message);
    child.send("parent says hello.");
});*/
/********************************/

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlDB';

// Please only modify the port here ffs
var port = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true }, function(err) {
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
// Parse requests of content-type 'application/json'


///PROXY REQUESTS START
const repo_fetcher = '127.0.0.1';   //want to replace this later with a constand from the constants file

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

//here we are telling the program to reroute all requests to /api/repo_fetch
//to the other computer (different ip) on another port
//proxyRequestTo(repo_fetcher,'8001','/api/repo_fetcher');

//////// The 8001 below should be changed into a var ///////
proxyRequestTo(repo_fetcher,'8001','/api/gitProjects');
///PROXY REQUESTS END


app.use(bodyParser.json());
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');

// Import routes
app.use(require('./controllers/index'));

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

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend: http://localhost:${port}/`);
});

module.exports = app;
