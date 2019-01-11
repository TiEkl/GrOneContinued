var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
// Variables

// Please only modify port here.
var repoHandlerPort = process.env.PORT || 8001;
// Create Express app
var app = express();
//use cors to allow github
app.use(cors());
// Parse requests of content-type 'application/json'
app.use(bodyParser.json({limit: '150mb', extended: true}));
// HTTP request logger
app.use(morgan('dev'));

// Import routes
app.use('/api/repo', require('../controllers/repoController.js'));
app.listen(repoHandlerPort, function(err) {
    if ( err ) throw err;
    console.log("repoHandler listening on port " + repoHandlerPort);
});

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
