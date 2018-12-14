var path = require('path');
var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');
const fs = require('fs');
const perf = require('execution-time')();
// lol gigigle


//gets to actual repository using the url
//router.use('/api/repos', require('./repofetcher/repos.js'))

/**********************TARGET SERVER*************/
// target server would have the different ways to handle the request. 
// eventually this should be in the different api/ files
router.get('/app1/',function(req,res) {
    console.log("server 1 sends its regards")
    res.send("Hello world From Server 1");
});
/*************************************************/
/*router.route('/').get(function (req, res) { //??
    console.log("test");
    res.sendFile(req.app.get('appPath') + '/index.html');
    
});*/

// Insert routes below
//router.use('/api/camels', require('./camels'));

// All other routes redirect to the index.html
// router.route('/owner').get(function (req, res) {
//     res.sendfile(req.app.get('appPath') + '/owner.html');
// });

// router.route('/buyer').get(function (req, res) {
//     res.sendfile(req.app.get('appPath') + '/buyer.html');
// });

router.route('/').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath +'/index.html')
    //res.sendFile('../../client/index.html');
    console.log("path:" + absoluteAppPath);
});

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your backend"});
});

router.route('/api/dependencies').get(function(req,res) {
    fs.readFile('./server/DependencyFinder/omni.xml', function(err, data) {
        findDependencies(data, function(result) {
            res.status(200).json(result);
        });

    })

})
//Function for finding dependencies with an xml file as input and a callback function
//that should handle the result from the function
function findDependencies(xml, callback) {
    var parser = new xml2js.Parser();

    perf.start();       //calculate time of excecution until perf.stop()
    parser.parseString(xml, function (err, result) {

        var object = result.unit.unit;  //each .java file in json

        var graphData = { 
            "nodes":[], 
            "links":[] };
        regexSearch(object);
        
        function regexSearch(object) {
            var allClasses = []; //Will contain all classnames
            var stringsJson = []; //Will contain all json representations of classes, stringified

            //For loop that creates each Node for the graphData, checks for classes and interfaces.
            //Also stringifies each class/interface to prepare for the regex matching.
            for (var i = 0; i < object.length; i++) {
                var currentNode = {"id": "", "package": "","group": 1, "count": 0};
                if (object[i].class != null) {      //check if the java file includes any class
                    var currentName = object[i].class[0].name;
                    var currentPackage = object[i].package[0].name;
                    currentNode.id = currentName.toString();
                    currentNode.package = currentPackage.toString();
                    stringsJson[i] = JSON.stringify(object[i].class); //object[i].class is the current class in java file at [i] .

                }
                else if (object[i].interface != null) {         //check if the java file includes any interface
                    var currentName = object[i].interface[0].name;
                    var currentPackage = object[i].package[0].name;
                    currentNode.id = currentName.toString();
                    currentNode.package = currentPackage.toString();
                    stringsJson[i] = JSON.stringify(object[i].interface);
                }
                graphData.nodes.push(currentNode);
                allClasses.push(currentName);
            }
            //Outer loop is the current class we're searching through
            for (var i = 0; i < allClasses.length; i++) {
                var countDep = 0;       //total amount of dependencies for current class for class [i].
                //Loop that searches for each class name [j] inside the stringsJson[i]
                for (var j = 0; j < allClasses.length; j++) {

                    if (i == j) {   
                        continue;
                    }
                    var pattern = new RegExp('"name":."' + allClasses[j]); 
                    var match;
                    var result = [];
                    if ((match = pattern.exec(stringsJson[i])) != null) {   //compares pattern (reg Expression) with stringsJson
                        result.push(match);
                        countDep++;
                        var links = { "source": allClasses[i].toString(), "target": allClasses[j].toString(), "value": 1 };
                        graphData.links.push(links);
                    }

                    
                }
                graphData.nodes[i].count = countDep;
            }
            //Stops execution timing and logs the time to the console
            const results = perf.stop();
            console.log(results.time);

            //Call callback function with the resulting graphData
            callback(graphData);



        }

    });
}


module.exports = router
