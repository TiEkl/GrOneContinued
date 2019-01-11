var path = require('path');
var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
const perf = require('execution-time')();

router.route('/api/dependencies').post(function (req, res) {
    var xml = req.body.xml;

    var repoName = req.body.repoName;
    var ownerName = req.body.owner;
    // repoName is used to obtain the correct projectName
    findDependencies(repoName, ownerName, xml, function (result) {
        console.log('Finding dependencies success!');
        res.status(201).json(result);
    });

})

//Function for finding dependencies with an xml file as input and a callback function
//that should handle the result from the function
function findDependencies(repoName, owner, xml, callback) {

    perf.start();       //calculate time of excecution until perf.stop()

    //Convert XML to a JSON object
    parseString(xml, function (err, result) {
        var object;

        if (result != undefined) {
            object = result;

            if (result.unit != undefined) {
                object = result.unit;

                if (result.unit.unit != undefined) {
                    object = result.unit.unit;  //each .java file in json
                }
            }
        }
        else {
            console.log("Result is undefined! Error incoming!");
        }

        var project;
        if (object[0].$.filename != null) {
            project = repoName;
        }

        var graphData = {
            "nodes": [],
            "links": [],
            "graphid": project + owner
        };
        regexSearch(object);

        function regexSearch(object) {
            var allClasses = []; //Will contain all classnames
            var stringsJson = []; //Will contain all json representations of classes, stringified

            //For loop that creates each Node for the graphData, checks for classes and interfaces.
            //Also stringifies each class/interface to prepare for the regex matching.
            for (var i = 0; i < object.length; i++) {

                var currentNode = { "id": "", "package": "", "count": 0 };

                if (object[i].class != null) {      //check if the java file is a regular class
                    var currentName = object[i].class;

                    if (object[i].class[0] != undefined) {
                        currentName = object[i].class[0];

                        if (object[i].class[0].name != undefined) {
                            currentName = object[i].class[0].name;

                            if (object[i].class[0].name[0] != undefined) {
                                currentName = object[i].class[0].name[0];

                                if (object[i].class[0].name[0].name != undefined) {
                                    currentName = object[i].class[0].name[0].name;
                                }
                            }
                        }
                    }
                    //Finds a variety of hierarchical package structures for a project
                    if (object[i].package != null) {

                        if (object[i].package != undefined) {
                            var currentPackage = object[i].package;

                            if (object[i].package[0] != undefined) {
                                var currentPackage = object[i].package[0];

                                if (object[i].package[0].name != undefined) {
                                    var currentPackage = object[i].package[0].name;

                                    if (object[i].package[0].name[0].name != undefined) {
                                        var currentPackage = object[i].package[0].name[0].name;
                                    }
                                }
                            }
                        }
                        currentNode.package = currentPackage[currentPackage.length - 1].toString();
                    }

                    currentNode.id = currentName.toString();
                    stringsJson[i] = JSON.stringify(object[i].class); //object[i].class is the current class in java file at [i] .

                }
                else if (object[i].interface != null) {         //check if the java file is an interface
                    var currentName = object[i].interface[0].name;

                    if (object[i].package != null) {
                        var currentPackage = object[i].package[0].name[0].name;
                        currentNode.package = currentPackage[currentPackage.length - 1].toString();
                    }

                    currentNode.id = currentName.toString();
                    stringsJson[i] = JSON.stringify(object[i].interface);
                }
                graphData.nodes.push(currentNode);
                allClasses.push(currentName);
            }

            //Outter loop is the current class we're searching through
            for (var i = 0; i < allClasses.length; i++) {
                var countDep = 0;       //total amount of dependencies for current class for class [i].
                //Loop that searches for each class name [j] inside the stringsJson[i]
                for (var j = 0; j < allClasses.length; j++) {

                    if (i == j) {
                        continue;
                    }

                    if (object[j] != undefined) {

                        var comparePackage = object[j];
                        if (object[j].package == undefined) {
                            //Undefined packages default to unknown
                            comparePackage = ["unknown"];
                        }
                        if (object[j].package != undefined) {
                            comparePackage = object[j].package;

                            if (object[j].package[0] != undefined) {
                                comparePackage = object[j].package[0];

                                if (object[j].package[0].name != undefined) {
                                    comparePackage = object[j].package[0].name;

                                    if (object[j].package[0].name[0].name != undefined) {
                                        comparePackage = object[j].package[0].name[0].name;
                                    }
                                }
                            }
                        }
                    }
                    var pattern = new RegExp('"name":."' + allClasses[j]);
                    var match;
                    var result = [];
                    if ((match = pattern.exec(stringsJson[i])) != null) {   //compares pattern (reg Expression) with stringsJson
                        result.push(match);
                        countDep++;
                        var withinPackage = null;

                        if (comparePackage != undefined) {

                            if (comparePackage[comparePackage.length - 1].toString() != undefined) {

                                if (graphData.nodes[i].package === comparePackage[comparePackage.length - 1].toString()) {
                                    withinPackage = true;
                                }
                                else {
                                    withinPackage = false;
                                }
                            }

                            if (comparePackage[0] === "unknown") {
                                console.log("       Comparepackage Name is unknown!!! : " + comparePackage[comparePackage.length - 1].toString())
                                withinPackage = null;
                            }
                        }
                        var link = {
                            "source": allClasses[i].toString(), "target": allClasses[j].toString(),
                            "value": 1, "withinPackage": withinPackage, "srcPkg": graphData.nodes[i].package, "targetPkg": comparePackage[comparePackage.length - 1]
                        };

                        graphData.links.push(link);
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

module.exports = router;