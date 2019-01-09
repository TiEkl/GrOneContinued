var express = require('express');
var router = express.Router();
var axios = require('axios');
var ip = require('ip');

const followRedirects = require('follow-redirects');
followRedirects.maxRedirects = 10;
followRedirects.maxBodyLength = 500 * 1024 * 1024 * 1024;

var projectSchema = require('../models/projectNode.js');

// These variables should change to whichever computer carries the individual components
var repoHandler = '127.0.0.1:8001';
var dependencyFinder = '127.0.0.1:9000';

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
            console.log('Sending data to RepoHandler');
            axios.post( 'http://' + repoHandler + '/api/gitProjects', { owner: ownerName, repo: repoName })
                .then((response) => {
                    console.log("Get XML from RepoHandler Success: " + response.status);
                    //send XML data to the dependency finder
                    console.log('Sending XML to DependencyFinder');
                    return axios.post('http://' + dependencyFinder + '/api/dependencies', { xml: response.data, repoName: repoName, owner: ownerName });
                }).then((response2) => {
                    console.log('DepdendencyFinder conversion success, sending data for visualization');
                    //console.log(response2.data);
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
                .catch((error)=>{
                    res.status(500).send({message: 'Error in process'});
                });
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