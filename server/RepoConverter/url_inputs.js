var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Url_Input = require('../models/url_input.js');

//TEST
router.get('/app1',function(req,res) {
    res.send("Hello world From Server 1");
});

//gets a list of all url objects in db
router.get('/', function(req, res, next) {
   Url_Input.find(function(err, urls){
      if (err) { return next(err); }
      res.json({urls});
   });
});

//gets a specific url object
router.get('/:_id', function(req, res, next) {
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


//creates and adds to db a url object
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
