var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');

// Variables
var port = process.env.PORT || 9000;

// Create Express app
var app = express();

// Parse requests of content-type 'application/json'
app.use(bodyParser.json({limit: '150mb', extended: true}));
//use cors to allow github
app.use(cors());
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/../..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');

// Import routes
app.use(require('./index'));

/**********TARGET SERVER **************/
// target server listens on different port than proxy server
// proxy server sends request to this port
/*app.listen(port, '0.0.0.0', function(err) {
    if ( err ) throw err;
    console.log("target server listening on port 9000");
    console.log("CWD: " + process.cwd());
});*/
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
