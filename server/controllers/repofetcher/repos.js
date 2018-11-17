var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

//do i need this?
Url_Input = require('../../models/url_input.js')

//gets the full url_input object's url attribute
router.get('/_id', function(req, res, next) {
   var url = getUrlById(req.params._id, function(req, res, next) {
      if (err) {
         return next(err);
      }
   }).url;  //.url gets the actual url string
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
