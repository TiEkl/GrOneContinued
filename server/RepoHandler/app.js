var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');

// =========== "npm run repohandler" ============//

// Variablea
// Please only modify port here.
var repo_fetcher_port = process.env.PORT || 8001;

// Create Express app
var app = express();
//use cors to allow github
app.use(cors());
// Parse requests of content-type 'application/json'
app.use(bodyParser.json({limit: '50mb', extended: true}));
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');

// Import routes
app.use(require('./index'));

/**********TARGET SERVER **************/
// target server listens on different port than proxy server
// proxy server sends request to this port

// DISTRIBUTED
// let repo_fetcher = '192.168.43.168';      //want to replace this later with a constand from the constants file

// LOCAL TESTING - POINTS TO SELF
let repo_fetcher = '127.0.0.1';


app.listen(repo_fetcher_port, repo_fetcher, function(err) {
    if ( err ) throw err;
    console.log("repo_fetcher listening on port " + repo_fetcher_port);
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
