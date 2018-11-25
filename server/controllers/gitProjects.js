var express = require("express");
var router = express.Router();
//library to work with the api
var downloadRepo = require('github-download'), exec = require('exec');

// Return a list of all projects
router.get("/", function(req, res, next) {
  gitProject.find(function(err, gitProjects) {
    if (err) {
      return next(err);
    }
    res.json({ gitProjects });
  });
});

// Create a new gitProject this will store the repo and its files in the db
router.post("/", function(req, res, next) {
  // the strings that we get from the front end
  var owner = req.body.owner;
  var repo = req.body.repo;
  var dir = 'C:\Users\lappa\GroneVisualizationSoftware\repositories';
   
    downloadRepo({user:owner, repo: repo, ref: 'master',dir}) 
      
  
        if (err) {
          return next(err);
        }
        res.status(201);
      });

  


module.exports = router;
