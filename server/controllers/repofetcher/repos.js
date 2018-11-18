var express = require('express');
var mongoose = require('mongoose');
// var http = require("http");
// var https = require("https");
var axios = require('axios');
var router = express.Router();

//do i need this?
var Url_Input = require('../../models/url_input.js');

var Url_Controller = require('../url_inputs.js');

//gets the full url_input object's url attribute
router.get('/:_id', function(req, res, next) {
   var id = req.params._id;

   var url_string;
   var repo;
   var owner;
   var path_string;
   var path;
   var target_url;

   Url_Input.findById(id, function(err, url) {
      if (err) { return next(err);
      }
      if (url == null) {
         return res.status(404).json({
            "message": "Url not found"
         });
      }
      url_string = new URL(url.url);
      path_string = url_string.pathname;
      path = path_string.split('/');
      owner = path[1];
      repo = path[2];
      target_url = 'https://api.github.com/repos/' + owner + "/" + repo;

      axios.get(target_url)
            .then(
                response => {
                    //This is only an example of how you can access the status code
                    if (response.status!==200) {
                        console.log("Wrong status code: " + response.status);
                    }
                  res.json(response.data);
            })
            .catch(error => {
                console.log(error);
            })
            .then(function () {
                //This code is always executed, independent of the request being successful or not.
            });
   });
});















module.exports = router
