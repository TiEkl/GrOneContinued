var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

Url_Input = require('../../models/url_input.js')

router.get('/', function(req, res, next) {
   var url = getUrlById(req.params._id, function(req, res, next) {
      if (err) {
         return next(err);
      }
   }).url;


})















module.exports = router
