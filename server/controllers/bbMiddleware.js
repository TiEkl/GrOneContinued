var express = require('express');
var router = express.Router();
var axios = require('axios');

var projectSchema = require('../models/projectNode.js');

// These variables should change to whichever computer carries the individual components
var repoHandler = '127.0.0.1:8001';
var dependencyFinder = '127.0.0.1:9000';

router.get('/', function ( req, res ) {
    console.log("in get all depe");
    projectSchema.find(function(err,projectSchema){
        if (err) { return next(err); }
        res.json({"projectSchemas": projectSchema}).status(200);
    });
});

router.get('/:graphid', function(req, res, next) {
  console.log('        index   id: '+ req.params.graphid);
  var the_id = req.params.graphid;
  projectSchema.findOne(({
      graphid: the_id
  }), (err, data)=>{
      if(err){
          return next(err)
      }
      //console.log('**jsonRES** '+ JSON.stringify(data) + ' end jsonRES***');
      res.status(200).json(data);
  });
});

router.post('/', function (req, res) {
    console.log("in posting all dependencies");
    var ownerName = req.body.owner;
    var repoName = req.body.repo;

    axios.post('http://' + repoHandler + '/api/gitProjects', {owner: ownerName,repo:  repoName})
    .then((response)=>{
        console.log("get xml Success: " + response.status);
        //console.log('***xml from backend*** '+ response.data + ' ***');
        //here we use the response from the previous request in order to
        //send XML data to the dependency finder        
        return axios.post('http://' + dependencyFinder +'/api/dependencies',{xml: response.data, repoName: repoName, owner : ownerName});
    }).then((response2) => {
        console.log(response2.data);
        var projectNode = new projectSchema({
            classes: response2.data,
            graphid: repoName + ownerName
        });
        projectNode.save(function(err) {
            if (err) {
                console.log("error");
                return next(err);
            }
            res.status(201).json(projectNode);
        })
    })
})

    /// we are going to have to have a next('/') where it has this version of posting as well to handle the syncing. 
    // dont know havent fully thought out the solution.
    /*var projects = new projectSchema(req.body);
    projects.save(function(err) {
    if (err) {
      console.log("error");
      return next(err);
    }
      res.status(201).json(projects);
    });*/


module.exports = router