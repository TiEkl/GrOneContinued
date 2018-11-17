var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Url_Input = require('../models/url_input.js');

router.get('/', function(req, res, next) {
   Url_Input.find(function(err, urls){
      if (err) { return next(err); }
      res.json({urls});
   });
});

router.post('/', function(req, res, next) {
    let url_input = new Url_Input(req.body);
    url_input.save(function(err) {
        if (err) { return next(err); }
        res.status(201).json(url_input);
    });
});


router.delete('/', function(req, res, next){
   Url_Input.remove({}, function(err, urls) {
      if(err) {
         return next(err);
      }
      res.json({urls});
   });
});


module.exports = router;
