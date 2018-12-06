var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var cmd = require('node-cmd');
const { exec } = require('child_process');
const fs = require('fs');
const xmlReader = require('xml-reader');
const xmlQuery = require('xml-query');
var xpath = require('xpath')
var dom = require('xmldom').DOMParser
var xml2js = require('xml2js');
_ = require("underscore");
var jp = require('jsonpath');
//var folderName = 'timmarcus';
/** CLUSTERING  **/
// fork can only create new NodeJs processes. You give it a js file
// to execute
/*const { fork } = require('child_process');
const child = fork('server/otherApp.js');

// process.on receives a message while process.send sends a message to
// another process
child.on('message', message => {
    console.log('message from child: ', message);
    child.send("parent says hello.");
});*/
/********************************/

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlDB';
var port = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true }, function (err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

// Create Express app
var app = express();
//use cors to allow github
app.use(cors());
// Parse requests of content-type 'application/json'
app.use(bodyParser.json());
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');

// Import routes
app.use(require('./controllers/index'));

/**********TARGET SERVER **************/
// target server listens on different port than proxy server
// proxy server sends request to this port
//app.listen(8001, '0.0.0.0');
/**************************************/

// Error handler (must be registered last)
var env = app.get('env');
app.use(function (err, req, res, next) {
    console.error(err.stack);
    var err_res = {
        "message": err.message,
        "error": {}
    };
    if (env === 'development') {
        err_res["error"] = err;
    }
    res.status(err.status || 500);
    res.json(err_res);
});
//var port = 3000;
var arrayOfClass = [];

app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend: http://localhost:${port}/`);
    /*exec('srcml repos/timmarcus', (err, stdout, stderr) => {
        console.log(stdout);
        console.log(err);
        console.log(stderr);
        }
    );*/




    var parser = new xml2js.Parser();
    fs.readFile('timmarcus.xml', function (err, data) {
        parser.parseString(data, function (err, result) {

            /* console.dir(JSON.stringify(result));
             console.log('Done');
             console.log(JSON.stringify(result.unit.unit.name));
             var test= Object.keys(result);
             console.log(test);
             console.log(Object.keys(result.unit));
             console.log(Object.keys(result.unit.$));
             console.log(Object.keys(result.unit.unit));
             console.log(Object.keys(result.unit.$.revision));
             */

            var object = result.unit.unit;
            //console.log(object);

            fs.writeFileSync('timmarcus3.json', JSON.stringify(object, null, 2));

            var count = 0;
            
           // findClass(object);
            testRegex(object);
            for (let i = 0; i < arrayOfClass.length; i++) {
                //console.log(object, arrayOfClass);

            }

            //console.log("Length " + arrayOfClass.length);
           
            function testRegex(object) {
                var allClasses = [];
                for (var i = 0; i < object.length; i++) {
                    var currentName = object[i].class[0].name;
                    allClasses.push(currentName);
                }
                for(var i=0; i<allClasses.length; i++){
                for (var j = 0; j < allClasses.length; j++) {
                    
                    var currentClass = JSON.stringify(object[i]);
                    var pattern = new RegExp('"decl":.{"type":.{"name":."' + allClasses[j] + '".}]', 'g')
                    var match;
                    var result = [];
                    while ((match = pattern.exec(currentClass)) != null) {
                        result.push(match);
                        console.log("current class: " + allClasses[i]);
                        console.log("RELATIONSHIP WITH: " +match);
                    }
                }

            }

        }
           
        
           
           
           
            var dependencies = findDependency(object, arrayOfClass);

            dependencies.forEach( data => {
                console.log(data);
            })

            //console.log(JSON.stringify(dependencies));

            function findClass(object) {
                // var arrayOfClass = [];
                for (var key in object) {

                    if (object.hasOwnProperty(key)) {
                        var property = object[key];
                    }
                    for (key in property) {
                        if (property.hasOwnProperty(key)) {
                            if (key == "class") {
                                findClass(property[key]);
                            }
                            if (key == "name") {
                                // console.log("Hallå2 " + property[key]);
                                arrayOfClass.push(property[key]);
                            }
                            else {
                                findClass(object[key]);
                            }
                        }
                    }
                }
            }


            function findDependency(object, arrayOfClass) {
                var classDepends = [];
                for (var i = 0; i < arrayOfClass.length; i++) {
                    var currentClass = object[i];
                    classDepends[i] = arrayOfClass[i];
                    console.log("Current: \n " + JSON.stringify(currentClass));
                    let result = scan2(currentClass);
                    classDepends[i].push(result);
                }
                return classDepends;
            }

            function scan(object) {
                let results = [];
                for (var key in object) {
                    //console.log("KEYYY" + object[key]);
                    if (object.hasOwnProperty(key)) {
                        if (key == "class" || key == 0 || key == "block" || key == "decl_stmt" || key == "decl" || key == "type") {
                            var test = object[key];

                            var scanResult = scan(test);
                            if (Array.isArray(scanResult)) {
                                results.push.apply(results, scanResult);
                            }
                            else {
                                results.push(scanResult);
                            }
                        }
                        else if(key == "name") {
                            var test2 = object[key];
                            return test2;
                           // console.log("Test2: " + test2); 
                        }
                    }
                } 
                return results;
            }

            function scan2(object) {
                let results = [];
                for (var key in object) {
                    //console.log("KEYYY" + object[key]);
                    if (object.hasOwnProperty(key)) {
                        let property = object[key];
                        if ( key == '0') {
                            return;
                        }
                        if (key !== 'decl_stmt' || key !== 'decl') {
                           
                           var scanResult = scan2(property);
                            if (Array.isArray(scanResult)) {
                                results.push.apply(results, scanResult);
                            }
                        }
                        else if(key == 'decl_stmt' || key == 'decl') {
                           let singleName = getDeclName(property);
                           results.push(singleName);
                           // console.log("Test2: " + test2); 
                        }
                    }   
                } 
                return results;
            }

            function getDeclName(object) {
                for ( var key in object) {
                    if(object.hasOwnProperty(key)) {
                        let property = object[key];
                        if(key == 'decl' || key == 'type') {
                            return getDeclName(property);
                        }
                        else if (key == 'name') {
                            return property;
                        }
                    }
                }
            }


            /*
                       
                        function findDependency(arrayOfClass) {
                            console.log("ARRAY1 : " + arrayOfClass)
                            for (var key in arrayOfClass) {
                                if (arrayOfClass.hasOwnProperty(key)) {
                                    console.log(typeof arrayOfClass == "object");
                                    currentNode = arrayOfClass[key];
                                    console.log("ARRAY" + typeof (arrayOfClass));
                                    var scan = object[key].class[0];
                                    if (currentNode == scan.name) {
                                        for (var key in scan.block) {
                                            //console.log(typeof scan.block[0].decl_stmt)
                                            console.log(scan.block);
                                            if (scan.block.hasOwnProperty(key)) {
                                                console.log("TESTAR23" + key);
                                                if (key != "decl_stmt") {
                                                    console.log(currentNode);
                                                    findDependency(scan)
            
                                                }
                                            }
                                        }
                                    }
            
                                }
            
                            }
                        } */



        });
    });



})






/*
  var propSize = _.size(property.unit);
  console.log("UnitSize"+ propSize); 
  var className = [];
  for (var i = 0; i < propSize; i++) {
      className.push(property.unit[i].class[0].name);
  }
  //console.log(className);

 var allClasses= [];
 for (var i=0; i<propSize; i++){
   allClasses.push(property.unit[i]);
  // console.log("TEST123" + JSON.stringify(property.unit[i]));
 }
 

 console.log("alla klasser" +allClasses);
var testDecl = ["Database", "Book"];
 
  var declName = [];
  console.log("size: " + declSize);
  // console.log(allClasses[0].class[0].block[0].decl_stmt[0].decl[0].name);
  console.log("propSize:" + propSize);
  
  
  
  
  
  
  
  
 
  for (var i = 0; i < 17; i++) {
      var declSize = _.size(allClasses[i].class[0].block[0].decl_stmt);
      for (var j = 0; j < declSize; j++) {
          var typeName = allClasses[i].class[0].block[0].decl_stmt[j].decl[0].type[0].name;
         declName.push(typeName);
          for (var k = 0; k < propSize; k++) {
             
              if (JSON.stringify(className[k]) == JSON.stringify(typeName)) {
                  console.log(className[j] + " DEPENDENCY WITH: " + typeName);
              }

          }

      }
  }

  
  var names = jp.query(result, 'unit.class[*].name');
  console.log("names" + names);
  console.log( JSON.stringify(declName[7]) == JSON.stringify(className[15]));
 console.log( declName[7]);
 console.log(className[15]);
 declName[7] == className[15];*/
/*  console.log( declName);
for(var i=0; i<className.length; i++){
    for(var j=0; j<declName.length; j++){
     if(JSON.stringify(className[i]) == JSON.stringify(declName[j])){
     console.log(className[i]);
 }
 }
}
 
}

var classes =[]
for(var i=0; i<propSize; i++){
classes.push(property.unit[i].class);
}
console.log(classes);
 
 


/*
fs.readFile('timmarcus.xml', 'utf-8', function (err, data) {
//  const dataXml = xmlReader.parseSync(data);


var doc = new dom().parseFromString(data)
var nodes = xpath.select("/unit/class[contains(text(),'class')]/name", doc)

var depend = xpath.select("//init/decl/type/name", doc)
// console.log(nodes)
// console.log(depend)
for (var i = 0; i < nodes.length; i++) {

console.log(nodes[i].localName + ": " + nodes[i].firstChild.data)
console.log("dependencies: " + depend[i].firstChild.data)
}
// console.log("Node: " + nodes[i].toString())  


// showResult(dataXml);
});


});

/*

function showResult(xml) {
console.log("testar");
var txt = "";
path = "/bookstore/book/title"
if (xml.evaluate) {
var nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
var result = nodes.iterateNext();
while (result) {
txt += result.childNodes[0].nodeValue + "<br>";
result = nodes.iterateNext();
}

} /*else if (|| xhttp.responseType  == "msxml-document") {
xml.setProperty("SelectionLanguage", "XPath");
nodes = xml.selectNodes(path);
for (i = 0; i < nodes.length; i++) {
txt += nodes[i].childNodes[0].nodeValue + "<br>";
}
}
console.log(txt);
};*/

module.exports = app;