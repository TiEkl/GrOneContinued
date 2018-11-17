var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

//do i need this?
var Url_Input = require('../../models/url_input.js');

var Url_Controller = require('../url_inputs.js');

//gets the full url_input object's url attribute
router.get('/:_id', function(req, res, next) {
   var id = req.params._id;
   var url = Url_Controller.getUrlById(id, function(req, res, next) {
      if (err) {
         return next(err);
      }
   }).url

//.url gets the actual url string
   if (url === null) {
      return res.status(404).json({
         "Message" : "Url not found"
      });
   }
   res.json({url});

   // var owner = url
   // var repo =

});















module.exports = router
