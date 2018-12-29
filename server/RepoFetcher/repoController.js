var express = require("express");
var router = express.Router();
//library to work with the api
var downloadRepo = require('download-git-repo');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

const exec =  require('child_process').exec;

// Method to download the repo to the filesystem
router.post("/", function(req, res, next) {
  // the strings that we get from the front end
  var owner = req.body.owner;
  var repo = req.body.repo;

  // this must have the absolute "/" due to a bug in the library.
  var repoUrl = owner + "/" + repo;
  console.log("RepoUrl:      " + repoUrl);

  //The place to download the repo
  var destination = path.normalize(
     path.join(process.cwd(), 'repository', repo));
     console.log("destination:           " + destination)

    //function to clear destination
    rimraf(destination, function() {
      console.log("destination directory cleared.")
   })

   //Actual method that downloads the files taking as input: owner/repo,directory.
   downloadRepo(repoUrl, destination, function (err) {
      console.log(err ? 'Error': 'Successfully downloaded repository.')
      if (err) {
        return next(err);
      }

      filterDir(destination, '.java');

   })
   res.status(201).json("Project Downloaded.");

});

// structured like this '../LiteScript','.html'
function filterDir(startPath,filter){

    console.log('Starting from dir '+ startPath +'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for(var i=0; i < files.length; i++){
        var filename = path.join(startPath,files[i]);

        //lstatsync returns file info details
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            filterDir(filename,filter); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            console.log('-- found: ',filename);
            
        }
        else if (filename.indexOf(filter) <= 0) {
           console.log('-- not Java: ',filename);

           // Because fs.unlink does not work on a directory, it is safer.
           // what is not safe is that filename can be a folder.
           fs.unlink(filename, (err) => {
             if (err) throw err;
             // console.log('---->' + filename + ' was deleted');
            });
        };
    };
    
};


function convertRepo(projectName) {
  var current = process.cwd();
  fs.mkdir(current + '/repository/xml' ,{recursive: true}, (err) => {
      
    // Converts project to an XML file.
      exec('srcml repository/'+projectName+ '-o repository/xml/'+projectName+'.xml', (error, stdout, stderr) => {
          console.log(stdout);
          console.log(err);
          console.log(error);
          console.log(stderr);
          }
      );
  })
};

module.exports = router;
