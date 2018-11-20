var express = require('express');
var router = express.Router();
var gitProject = require('../models/gitProject');
//library to work with the api
const octokit = require('@octokit/rest')();
var oauthToken = token.txt;
//Authentication to be able to work with the api
octokit.authenticate({
  type: 'oauth',
  token: oauthToken
})

// Create a new gitProject this will store the repo and its files in the db
router.post('/', function(req, res, next) {
    // the strings that we get from the front end
    var owner = req.body.owner;
    var repo = req.body.repo;
    // the actual files to be downloaded
    var fileArray;
    // method do download with github api
    octokit.repos.getContents({
        "owner": owner,
        "repo": repo,
        headers: {
        accept : 'application/vnd.github.VERSION.raw'       
      }})
      .then(result => {
          // store the result in an array
          fileArray = result;
     // Save the whole thing in a mongoose model
    var gitProject = new gitProject(req.body,fileArray);

    gitProject.save(function(err) {
        if (err) { return next(err); }
        res.status(201).json(gitProject);
    });
});
});





module.exports = router