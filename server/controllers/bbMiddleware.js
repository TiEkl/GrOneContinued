var express = require('express');
var router = express.Router();

var projectSchema = require('../models/projectNode.js');

router.get('/', function ( req, res ) {
    console.log("in get all depe");
    projectSchema.find(function(err,projectSchema){
        if (err) { return next(err); }
        res.json(projectSchema).status(200);
    });
});

router.get('/:id', function(req, res, next) {
	projectSchema.findById(req.params.id, function (err, projectSchema) {
		if (err) { return next(err); }
		res.status(200).json({"data" : projectSchema});
	});
});

router.post('/', function (req, res) {
    console.log("in post all depen");
    console.log(req.body);    
    var projects = new projectSchema(req.body);
    projects.save(function(err) {
    if (err) {
      return next(err);
    }
      res.status(201).json(projects);
    });
})

router.put('/:id', function(req, res, next) {
    console.log("in PUT");
    var id = req.params.id;
    projectSchema.findById(id, function(err, project) {
        console.log(id);
      if (err) { return next(err); }
      if(project === null) {
          console.log("no project");
        return res.status(404).json(
          {"message": "project not found"});
      }
      console.log(req.body);
      project.projectName = (req.body.projectName || project.projectName);
      project.classes = (req.body.classes || project.classes);
      project.save();
      res.json(project);
    });
  });

module.exports = router