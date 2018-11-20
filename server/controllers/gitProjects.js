var express = require('express');
var router = express.Router();
var gitProject = require('../models/gitProject');

// Return a list of all projects
router.get('/', function(req, res, next) {
    gitProject.find(function(err, gitProjects) {
        if (err) { return next(err); }
        res.json({gitProjects});
    });
});


// Create a new gitProject
router.post('/', function(req, res, next) {
    var new_git_project = new gitProject(req.body);
    new_git_project.save(function(err) {
        if (err) { return next(err); }
        res.status(201).json(new_git_project);
    });
});






module.exports = router
