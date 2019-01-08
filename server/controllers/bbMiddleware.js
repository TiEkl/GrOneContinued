var express = require('express');
var router = express.Router();
var axios = require('axios');
var ip = require('ip');

var projectSchema = require('../models/projectNode.js');

// These variables should change to whichever computer carries the individual components
var repoHandler = '192.168.1.2:8001';
var dependencyFinder = '192.168.1.2:9000';

router.get('/', function (req, res) {
    console.log("in get all depe");
    projectSchema.find(function (err, projectSchema) {
        if (err) { return next(err); }
        res.json({ "projectSchemas": projectSchema }).status(200);
    });
});

router.get('/:ownerName/:repoName', function (req, res, next) {
    console.log('        index   id: ' + req.params.ownerName + req.params.repoName);
    var ownerName = req.params.ownerName;
    var repoName = req.params.repoName;
    var the_id = ownerName + repoName;
    projectSchema.findOne(({
        graphid: the_id
    }), (err, project) => {
        if (project !== null) {
            console.log("project in db");
            var data = {
                projectNode: project,
                ip: ip.address()
            };
            res.status(200).json(data);
        } else {
            axios.post('http://' + repoHandler + '/api/gitProjects', { owner: ownerName, repo: repoName })
                .then((response) => {
                    console.log("get xml Success: " + response.status);
                    //send XML data to the dependency finder        
                    return axios.post('http://' + dependencyFinder + '/api/dependencies', { xml: response.data, repoName: repoName, owner: ownerName });
                }).then((response2) => {
                    console.log(response2.data);
                    var projectNode = new projectSchema({
                        classes: response2.data,
                        graphid: ownerName + repoName
                    });
                    projectNode.save(function (err) {
                        if (err) {
                            console.log("error");
                            return next(err);
                        }
                    var data = {
                        projectNode: projectNode,
                        ip: ip.address()
                    };
                    res.status(201).json(data);
                    })
                })
        }
        if (err) {
            return next(err)
        }
    });
});

// POST for syncing
router.post('/', function (req, res) {
    var projects = new projectSchema(req.body);
    projects.save(function (err) {
        if (err) {
            console.log("error");
            return next(err);
        }
        res.status(201).json(projects);
    });
});

module.exports = router