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
     path.join(__dirname, 'repository', repo));

     console.log("   destination: " + destination);

    //function to clear destination
    rimraf(destination, function() {
      console.log("destination directory cleared.")
   })

   //this method DOWNLOADS and CONVERTS the repo into XML
    dlconrepo(res, repo,repoUrl,destination, function (res, repo) {
      getXMLdata(res,repo);
   })

    //This method gets xml data and sends it back in a response


});

function dlconrepo(res, repo,repoUrl,destination, callback){

    downloadRepo(repoUrl, destination, function (err) {
        console.log(err ? 'Error, dl repo unsuccessful': 'Successfully downloaded repository.')
        if (err) {
            console.log(err);
        }

        filterDir(destination, '.java');
        convertRepo(repo);
     })
     if (callback) {
        callback(res, repo);
     };
}

//function for getting xml data
//if the date exists we get it
//if not we try again later (using timeout)
function getXMLdata(res,repo){
    var pathToXML = path.normalize(
        path.join(__dirname, 'repository', 'xml',repo));

        if(fs.existsSync(pathToXML+'.xml')){
            res.set('Content-Type', 'text/xml');
            fs.readFile(pathToXML+'.xml',(err,data)=>{
                if(err) throw err;
                //console.log('***data here***: '+ data + "**** end data*****");
                res.status(201).send(data);
            })
        }
        // else{
        //     setTimeout(() => {
        //         getXMLdata(res,repo);
        //     }, 1000);
        // }
}

// structured like this '../LiteScript','.html'
// this is a recursive function
function filterDir(startPath,filter){

    // console.log('Starting from dir '+ startPath +'/');

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
            // console.log('-- found: ',filename);

        }
        else if (filename.indexOf(filter) <= 0) {
           // console.log('-- not Java: ',filename);

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
  var current = __dirname;
  // __dirname and process.cwd() doesnt seem to work because
  // the whole destination has spaces, which doesnt work as a command
  // therefore the path between the root and the destination should not have spaces

   var xmlDestination = path.normalize(
      path.join(current,'repository','xml')
   );
  // The folder to parse/convert to xml
   var shortDest = path.normalize(
      path.join('server','RepoHandler','repository', projectName)
   );

   // The output file
   var xmlFileDest = path.normalize(
      path.join('server','RepoHandler','repository','xml','/')) + projectName +'.xml';

   console.log("   Folder to Parse:   " + shortDest);
   console.log("   Output file:   " + xmlFileDest);

  fs.mkdir(xmlDestination ,{recursive: true}, (err) => {

    // Converts project to an XML file.
      exec('srcml '+ shortDest + ' -o ' + xmlFileDest, (error, stdout, stderr) => {
          console.log(stdout);
          console.log("err: --> " + err);
          console.log("error: --> " + error);
          console.log(stderr);

          console.log("         Repo Converted to XML.");
          }
      );
  })
};

module.exports = router;
