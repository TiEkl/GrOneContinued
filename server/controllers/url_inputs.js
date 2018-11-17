var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Url_Input = require('../models/url_input.js');

module.exports.getUrls = router.get('/', function(req, res, next) {
   Url_Input.find(function(err, urls){
      if (err) { return next(err); }
      res.json({urls});
   });
});

module.exports.getUrlById = router.get('/:_id', function(req, res, next) {
   var id = req.params._id;
   Url_Input.findById(id, function(err, url) {
      if (err) { return next(err);
      }
      if (url == null) {
         return res.status(404).json({
            "message": "Url not found"
         });
      }
      res.json(url);
   });
});




module.exports.postUrl = router.post('/', function(req, res, next) {
    let url_input = new Url_Input(req.body);
    url_input.save(function(err) {
        if (err) { return next(err); }
        res.status(201).json(url_input);
    });
});


module.exports.deleteUrls = router.delete('/', function(req, res, next){
   Url_Input.remove({}, function(err, urls) {
      if(err) {
         return next(err);
      }
      res.json({urls});
   });
});


module.exports = router;
