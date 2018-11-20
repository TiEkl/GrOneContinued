var express = require("express");
var router = express.Router();
var gitProject = require("../models/gitProject");
//library to work with the api
const octokit = require("@octokit/rest")();
// var oauthToken = token.txt;
// //Authentication to be able to work with the api
// octokit.authenticate({
//   type: 'oauth',
//   token: oauthToken
// })

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

  var new_git_project;
  // the actual files to be downloaded
  var fileArray;
  // method do download with github api
  octokit.repos.getContents({
      owner: owner,
      repo: repo,
      // path: '',
      headers: {
        accept: "application/vnd.github.VERSION.raw"
      }
    })
    .then(result => {
      // store the result in an array
      fileArray = result.data.content;
      // Save the whole thing in a mongoose model
      new_git_project = new gitProject(req.body, fileArray);
      new_git_project.save(function(err) {
        if (err) {
          return next(err);
        }
        res.status(201).json(new_git_project);
      });
    });

});

module.exports = router;
