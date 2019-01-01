var path = require('path');
var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
const fs = require('fs');
const perf = require('execution-time')();

var projectSchema = require('../models/projectNode.js');

router.route('/').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath +'/index.html')
});

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your backend"});
});


router.route('/api/dependencies').get(function(req,res,next) {
    projectSchema.find(({}), (err, data)=>{
        if(err){
            return next(err)
        }
        //console.log('**jsonRES** '+ JSON.stringify(data) + ' end jsonRES***');
        res.status(200).json({ 'data' : data });
    });
});

//Post request, uncomment the fs.readfile stuff and comment our var xml if you want
//to run this with an XML file from the file system.
router.route('/api/dependencies').post(function(req,res) {
    var xml = req.body.xml;
    //fs.readFile('./GarageIOTest.xml', function(err, xml) {
        findDependencies(xml, function(result) {
            //console.log('**postREQjsonRES** '+ JSON.stringify(result) + ' end jsonRES***');
            res.status(201).json(result);
        });

    //})

});

//Function for finding dependencies with an xml file as input and a callback function
//that should handle the result from the function
function findDependencies(xml, callback) {

    perf.start();       //calculate time of excecution until perf.stop()

    parseString(xml, function (err, result) {

      // testing stuff
      var object;

      if (result != undefined) {
         console.log("  result:" + result);
         object = result;

         if (result.unit != undefined) {
            console.log("     result.unit: " + result.unit);
            object = result.unit;

            if (result.unit.unit != undefined) {
               console.log("        res.unit.unit: " + result.unit.unit);
               object = result.unit.unit;  //each .java file in json
            }
         }
      }
      else {
         console.log("Result is undefined! Error incoming!");
      }

      // end

        // var object = result.unit.unit;  //each .java file in json
        // // if (result != undefined) {
        //    throw Error("error! result undefined");
        // }

        var project;
        //Project name will probably be have to be fetched from the xmlhttprequest once that's implemented
        if(object[0].$.filename != null) {
            project = object[0].$.filename.toString().split("\\")[1];
        }
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
               console.log("              Current object length: >>  " + i);
               var currentNode = {"id": "", "package": "", "count": 0};

               if (object[i].class != null) {      //check if the java file includes any class
                  if (object[i].class[0].name != undefined) {
                     var currentName = object[i].class[0].name;
                     // console.log("Current Name in class[0].name");

                     if (object[i].class[0].name[0].name != undefined) {
                        var currentName = object[i].class[0].name[0].name;
                        console.log("Current Name in inception level 1");

                        if (object[i].class[0].name[0].name[0].name != undefined) {
                           var currentName = object[i].class[0].name[0].name[0].name;
                           console.log("Current Name in inception level 2");
                        }
                     }
                  }
                    // var currentName = object[i].class[0].name;
                    console.log("Current Name: " + currentName);

                    //test if statements
                    if (object[i].package != null) {

                       if (object[i].package != undefined) {
                          var currentPackage = object[i].package;
                          // console.log("     ~ currently - object[i].package <");

                          if (object[i].package[0] != undefined) {
                            var currentPackage = object[i].package[0];
                            // console.log("     ~ currently - object[i].package[0] <");

                            if (object[i].package[0].name != undefined) {
                              var currentPackage = object[i].package[0].name;
                              // console.log("     ~ currently - object[i].package[0].name <");

                              if (object[i].package[0].name[0].name != undefined) {
                                var currentPackage = object[i].package[0].name[0].name;
                                console.log("     ~ currently - object[i].package.name[0].name <");
                             }
                           }
                         }
                       }

                       console.log("   currentPackage: " + currentPackage);

                      //end tests

                        currentNode.package = currentPackage[currentPackage.length-1].toString();
                    }

                    currentNode.id = currentName.toString();

                    stringsJson[i] = JSON.stringify(object[i].class); //object[i].class is the current class in java file at [i] .

                }
                else if (object[i].interface != null) {         //check if the java file includes any interface
                    var currentName = object[i].interface[0].name;

                    if (object[i].package != null) {
                        var currentPackage = object[i].package[0].name[0].name;
                        currentNode.package = currentPackage[currentPackage.length-1].toString();
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
                    //testing
                     if (object[j] != undefined) {

                       var comparePackage = object[j];
                       // console.log("     > in  object[j] <");
                       // console.log(object[j]);

                       // So for some stupid reason some projects(especially the ones we have made ourselves)
                       // Do not have a package attribute defined. This makes it so i dont really know how to compare the packages.
                       // As a temp fix i have set it to an empty string, allowing the visualization to work,
                       // but the links' color to be always red(outside of package).
                       if (object[j].package == undefined) {
                          console.log(" There is no package defined to compare to. Defaulting to 'unknown'.");
                          console.log(" Also Tim says Put your files in proper packages or get off my lawn.");
                          comparePackage = ["unknown"];
                       }
                        if (object[j].package != undefined) {
                             comparePackage = object[j].package;
                             // console.log("     >> in  object[j].package <");

                             if (object[j].package[0] != undefined) {
                                comparePackage = object[j].package[0];
                                // console.log("     >>> in  object[j].package[0] <");

                                if (object[j].package[0].name != undefined) {
                                  comparePackage = object[j].package[0].name;
                                  // console.log("     >>>> in  object[j].package[0].name <");

                                  if (object[j].package[0].name[0].name != undefined) {
                                     comparePackage = object[j].package[0].name[0].name;
                                     // console.log("     >>>>> in  object[j].package[0].name[0].name <");
                                  }
                               }
                            }
                         }
                      }

                    console.log("      comparePackage: " + comparePackage);



                    //end testing

                    var pattern = new RegExp('"name":."' + allClasses[j]);
                    var match;
                    var result = [];
                    if ((match = pattern.exec(stringsJson[i])) != null) {   //compares pattern (reg Expression) with stringsJson
                        result.push(match);
                        countDep++;
                        var withinPackage = null;

                        if (comparePackage != undefined) {
                           console.log("comparePackage EXISTS");

                           if (comparePackage[comparePackage.length-1].toString() != undefined) {
                              if(graphData.nodes[i].package === comparePackage[comparePackage.length-1].toString()) {
                                 console.log ("          Comparepackage.length-1 Name: " + comparePackage[comparePackage.length-1].toString())
                                 // console.log ("    Comparepackage Name: " + comparePackage.toString())
                                  withinPackage = true;
                              }
                              else {
                                  withinPackage = false;
                              }
                           }

                           if (comparePackage[0] === "unknown") {
                              console.log ("       unknown!!! Comparepackage Name: " + comparePackage[comparePackage.length-1].toString())
                              withinPackage = null;
                           }
                        }



                        var link = { "source": allClasses[i].toString(), "target": allClasses[j].toString(), "value": 1, "withinPackage": withinPackage };
                        graphData.links.push(link);
                    }
                }
                graphData.nodes[i].count = countDep;
            }
            var projectNode = new projectSchema({
                projectName: project,
                classes: graphData,
            });
            projectNode.save( function(error) {
                console.log("project node and its dependencies saved");
                if (error){
                    console.error(error);
                }
            });
            //Stops execution timing and logs the time to the console
            const results = perf.stop();
            console.log(results.time);

            //Call callback function with the resulting graphData
            callback(graphData);



        }

    });
}


module.exports = router;
