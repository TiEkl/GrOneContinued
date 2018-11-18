var express = require("express");
var mongoose = require("mongoose");
// var http = require("http");
// var https = require("https");
var axios = require("axios");
var router = express.Router();

//do i need this?
var Url_Input = require("../../models/url_input.js");

var Url_Controller = require("../url_inputs.js");

//gets the full url_input object's url attribute
router.get("/:_id", function(req, res, next) {
  var id = req.params._id;

  // These variables all deal with getting the github api url
  var url_string; //actual url string
  var repo; //section of url that specifies repo
  var owner; //section of url that specifies owner
  var path_string; //entire path string
  var path; //Array with path sectioned. [1] is owner, [2] is repo.
  var target_url; //entire github api url

  //Couldnt get axios working on this, so i just copypasted url_inputs.js get function
  Url_Input.findById(id, function(err, url) {
    //checks valid url
    if (err) {
      return next(err);
    }
    if (url == null) {
      return res.status(404).json({
        message: "Url not found"
      });
    }

    //getting the url object allows us to populate the variables now
    url_string = new URL(url.url); //first url is object, second is actual string
    path_string = url_string.pathname;
    path = path_string.split("/"); //splits string according to '/', creates array
    owner = path[1];
    repo = path[2];
    target_url = "https://api.github.com/repos/" + owner + "/" + repo;

    //gets actual repository with github's api. returns a bunch of stuff.
    axios.get(target_url)
      .then(response => {
        //This is only an example of how you can access the status code
        if (response.status !== 200) {
          console.log("Wrong status code: " + response.status);
        }

        //returns repository.
        res.json(response.data);
      })
      .catch(error => {
        console.log(error);
      })
      .then(function() {
        //This code is always executed, independent of the request being successful or not.
      });
  });
});

module.exports = router;
