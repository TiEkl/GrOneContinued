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
            
            var object = result
            fs.writeFileSync('timmarcus2.json', JSON.stringify(object)); 
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var property = object[key];
                }
                
              var propSize = _.size(property.unit);
                console.log("UnitSize"+ propSize); 
                var className = [];
                for (var i = 0; i < propSize; i++) {
                    className.push(property.unit[i].class[0].name);
                }
                console.log(className);

               var allClasses= [];
               for (var i=0; i<propSize; i++){
                 allClasses.push(property.unit[i]);
                 console.log("TEST123" + JSON.stringify(property.unit[i]));
               }
               
              var testDecl = ["Database", "Book"];
               
                var declName = [];
                console.log("size: " + declSize);
                // console.log(allClasses[0].class[0].block[0].decl_stmt[0].decl[0].name);
                console.log("propSize:" + propSize);

                for (var i = 0; i < propSize; i++) {
                    var declSize = _.size(allClasses[i].class[0].block[0].decl_stmt);
                    for (var j = 0; j < declSize; j++) {
                        var typeName = allClasses[i].class[0].block[0].decl_stmt[j].decl[0].type[0].name;
                        declName.push(typeName);
                        console.log(typeName);
                        for (var k = 0; k < propSize; k++) {
                            if (JSON.stringify(className[k]) == JSON.stringify(typeName)) {
                                console.log(className[j] + " DEPENDENCY WITH: " + typeName);
                            }

                        }

                    }
                }
                /*console.log( JSON.stringify(declName[7]) == JSON.stringify(className[15]));
               console.log( declName[7]);
               console.log(className[15]);
               declName[7] == className[15];*/
                 console.log( declName);
               for(var i=0; i<className.length; i++){
                   for(var j=0; j<declName.length; j++){
                    if(JSON.stringify(className[i]) == JSON.stringify(declName[j])){
                    console.log(className[i]);
                }
                }
               }
               
        }
/*
            var classes =[]
            for(var i=0; i<propSize; i++){
            classes.push(property.unit[i].class);
            }
            console.log(classes);
           
           */
        });
    });


})


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