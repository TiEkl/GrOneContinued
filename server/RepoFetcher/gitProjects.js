var express = require("express");
var router = express.Router();
//library to work with the api
var downloadRepo = require('download-git-repo');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

const exec =  require('child_process').exec;

// Return a list of all projects
router.get("/", function(req, res, next) {
  gitProject.find(function(err, gitProjects) {
    if (err) {
      return next(err);
    }
    res.json({ gitProjects });
  });
});

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

      var javaFiles = filterDir(destination, '.java');
      //*** For UNIX Systems ***/
      // const filterCommand = exec('find ./repository -type f ! -name "*.java" -delete');
      //*** For Windows Systems ***/
      //const filterCommand = exec('dir /s /b .\\repository | findstr /e .js');
      //const filterCommand = exec('DEL /S /F /Q .\\repository /e "*.js"') //this line doesn't work
      // filterCommand.stdout.on('data', function(data){
      //   console.log(data);
      // });
      //
      // filterCommand.stderr.on('data', function(data){
      //   console.log(data);
      // });



   })
   res.status(201).json("Project Downloaded.");

});

// structured like this '../LiteScript','.html'
function filterDir(startPath,filter){

    var results = [];

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
            results.push(filename);
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
    return results;
};


module.exports = router;
