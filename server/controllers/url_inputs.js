var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Url_Input = require('../models/url_input.js');

router.post('/', function(req, res, next) {
    var url_input = new Url_Input(req.body);
    url_input.save(function(err) {
        if (err) { return next(err); }
        res.status(201).json(url_input);
    });
});

module.exports = router;