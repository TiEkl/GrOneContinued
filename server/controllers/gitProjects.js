var express = require('express');
var router = express.Router();
var gitProject = require('../models/gitProject');

// Return a list of all projects
/*router.get('/', function(req, res, next) {
    gitProject.find(function(err, gitProjects) {
        if (err) { return next(err); }
        res.json({"data": gitProjects});
    });
});
*/

// Create a new gitProject
router.post('/', function(req, res, next) {
    var gitProject = new gitProject(req.body);
    gitProject.save(function(err) {
        if (err) { return next(err); }
        res.status(201).json(gitProject);
    });
});






module.exports = router