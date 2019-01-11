var express = require("express");
var router = express.Router();
//library to work with the api
var downloadRepo = require('download-git-repo');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');
const exec = require('child_process').exec;

// Method to download the repo to the filesystem
router.post("/", function (req, res, next) {
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
    rimraf(destination, function () {
        console.log("destination directory cleared.")
    })

    //this method DOWNLOADS a repo and has callbacks for filtering
    //out non-java files, converting the repo, and sending the XML as a response

    downloadRepo(repoUrl, destination, function (err) {
        console.log(err ? 'Error, dl repo unsuccessful' : 'Successfully downloaded repository.')
        if (err) {
            console.log(err);
            return next(err);
        }
        else {
            filterDir(destination, '.java', res, repo, function (res, repo) {
                convertRepo(repo, res, function (res, repo) {
                    getXMLdata(res, repo);
                })
            })
        }
    });
});

//function for getting xml data
//if the data exists we get it
//if not we try again later (using timeout)
function getXMLdata(res, repo) {
    var pathToXML = path.normalize(
        path.join(__dirname, 'repository', 'xml', repo));

    if (fs.existsSync(pathToXML + '.xml')) {
        res.set('Content-Type', 'text/xml');
        fs.readFile(pathToXML + '.xml', (err, data) => {
            if (err) throw err;
            //console.log('***data here***: '+ data + "**** end data*****");
            res.status(201).send(
                data
            );
        })
    }
    else {
        console.log("Could not get XML");

    }
}


// structured like this '../pathname','.<filetype>'
//Deletes all the files that do not belong to the filetype
function filterDir(startPath, filter, res, repo, convertCallback) {

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);

        //lstatsync returns file info details
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            filterDir(filename, filter); //recurse
        }
        //If the filename doesn't include the filetype
        //Delete the file
        else if (filename.indexOf(filter) <= 0) {

            // Because fs.unlink does not work on a directory, it is safer.
            // what is not safe is that filename can be a folder.
            fs.unlink(filename, (err) => {
                if (err) throw err;
            });
        };
    };
    if (convertCallback) {
        convertCallback(res, repo);
    }
};


//Converts a project directory into an .XML through srcML
function convertRepo(projectName, res, xmlCallback) {

    var current = __dirname;
    var xmlDestination = path.normalize(
        path.join(current, 'repository', 'xml')
    );
    // The folder to parse/convert to xml
    var shortDest = path.normalize(
        path.join('server', 'RepoHandler', 'repository', projectName)
    );

    // The output file
    var xmlFileDest = path.normalize(
        path.join('server', 'RepoHandler', 'repository', 'xml', '/')) + projectName + '.xml';

    fs.mkdir(xmlDestination, { recursive: true }, (err) => {
        // Converts project to an XML file.
        exec('srcml ' + shortDest + ' -o ' + xmlFileDest, (error, stdout, stderr) => {
            console.log("error: --> " + error);
            console.log(stderr);
            console.log("Repo Converted to XML.");
            if (xmlCallback) {
                xmlCallback(res, projectName);
            }

        })
    });
};

module.exports = router;
