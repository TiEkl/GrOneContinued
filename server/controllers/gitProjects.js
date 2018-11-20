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

// Create a new gitProject
router.post('/', function(req, res, next) {
    var owner = req.body.owner;
    var repo = req.body.repo;
    var fileArray;
    octokit.repos.getContents({
        "owner": owner,
        "repo": repo,
        headers: {
        accept : 'application/vnd.github.VERSION.raw'       
      }})
      .then(result => {
          fileArray = result;

    var gitProject = new gitProject(req.body,fileArray);

    gitProject.save(function(err) {
        if (err) { return next(err); }
        res.status(201).json(gitProject);
    });
});
});





module.exports = router