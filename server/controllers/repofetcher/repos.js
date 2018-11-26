/*
var express = require("express");

var mongoose = require("mongoose");
// var http = require("http");
// var https = require("https");
var axios = require("axios");
var router = express.Router();


//library to work with the api
const octokit = require('@octokit/rest')();
var oauthToken = token.txt;
//Authentication to be able to work with the api
octokit.authenticate({
  type: 'oauth',
  token: oauthToken
})
// file system
const fs = require('fs');
// This will be the owner and repo name.
var ownerUrl;
var RepoURL;
// Store the files on the computer first.
var targetDirectory = "C:\Users\lappa\GroneVisualizationSoftware\repositories";

// func to actually download 

async function dlRepo (ownerURL,repoURL,targetDirectory){
  var repo = repoURL;
  var owner = ownerURL;
  octokit.repos.getContents({
    "owner": owner,
    "repo": repo, 
    headers: {
    accept : 'application/vnd.github.VERSION.raw'       
  }})
  .then(result => {
    result.data.array.forEach(element => {
      // for each element save to mondo db as MONGOSE schema gitprojects
      var target = targetDirectory;
      fs.writeFile(target,
        buffer.from(result.data.content) , function(err){
          if(err) console.log(err);
        })

    });
  
}






  

  



  







function getGitApiUrl(url_string) {
  var repo; //section of url that specifies repo
  var owner; //section of url that specifies owner
  var path_string; //entire path string
  var path; //Array with path sectioned. [1] is owner, [2] is repo.
  var base_github_url; //entire github api url

  //getting the url object allows us to populate the variables now
  path_string = url_string.pathname;
  path = path_string.split("/"); //splits string according to '/', creates array
  owner = path[1];
  repo = path[2];
  base_github_url = "https://api.github.com/repos/" + owner + "/" + repo;

  return base_github_url;
}

function getOwner(url_string) {
   var repo; //section of url that specifies repo
   var owner; //section of url that specifies owner
   var path_string; //entire path string
   var path; //Array with path sectioned. [1] is owner, [2] is repo.

   //getting the url object allows us to populate the variables now
   path_string = url_string.pathname;
   path = path_string.split("/"); //splits string according to '/', creates array
   owner = path[1];
   repo = path[2];

   return owner;
}

function getRepo(url_string) {
   var repo; //section of url that specifies repo
   var owner; //section of url that specifies owner
   var path_string; //entire path string
   var path; //Array with path sectioned. [1] is owner, [2] is repo.

   //getting the url object allows us to populate the variables now
   path_string = url_string.pathname;
   path = path_string.split("/"); //splits string according to '/', creates array
   owner = path[1];
   repo = path[2];

   return repo;
}
//do i need this?
var Url_Input = require("../../models/url_input.js");

// var Url_Controller = require("../url_inputs.js");

//entire get function retrieves repo - NOT ITS CONTENTS
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
    //who the shit knew you could use axios here
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

router.post("/", function(req, res, next) {
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
     target_url = "https://api.github.com/repos/" + owner + "/" + repo + "/contents";
    
      

    
    axios.get(target_url)
      .then(response => {
        //This is only an example of how you can access the status code
        if (response.status !== 200) {
          console.log("Wrong status code: " + response.status);
        }

        //returns repository.
        res.raw(response.data);
      })
      .catch(error => {
        console.log(error);
      })
      .then(function() {
        //This code is always executed, independent of the request being successful or not.
      });
  
});

});




//returns github api url
router.get("/:_id/url", function(req, res, next) {
  var id = req.params._id;
  var url_string; //actual url string
  var target_url; //entire github api url

  Url_Input.findById(id, function(err, url) {
    //checks valid url
    if (err) { return next(err); }
    if (url == null) {
      return res.status(404).json({ message: "Url not found" });
    }
    url_string = new URL(url.url); //first url is object, second is actual string
    target_url = getGitApiUrl(url_string);
    res.json(target_url);
  });
});

router.get("/:_id/url/owner", function(req, res, next) {
   var id = req.params._id;
   var url_string; //actual url string
   var owner;

   Url_Input.findById(id, function(err, url) {
     //checks valid url
     if (err) { return next(err); }
     if (url == null) {
       return res.status(404).json({ message: "Url not found" });
     }
     url_string = new URL(url.url); //first url is object, second is actual string
     owner = getOwner(url_string);
     res.json(owner);
   });
});

router.get("/:_id/url/repo", function(req, res, next) {
   var id = req.params._id;
   var url_string; //actual url string
   var repo;

   Url_Input.findById(id, function(err, url) {
     //checks valid url
     if (err) { return next(err); }
     if (url == null) {
       return res.status(404).json({ message: "Url not found" });
     }
     url_string = new URL(url.url); //first url is object, second is actual string
     repo = getRepo(url_string);
     res.json(repo);
   });
});







module.exports = router;
*/