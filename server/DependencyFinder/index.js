var path = require('path');
var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');
const fs = require('fs');
const perf = require('execution-time')();
// lol gigigle

router.use('/api/urls', require('./url_inputs.js'));

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
router.route('/').get(function (req, res) { //??
    console.log("test");
    res.sendFile(req.app.get('appPath') + '/index.html');
    
});

// Insert routes below
//router.use('/api/camels', require('./camels'));

// All other routes redirect to the index.html
// router.route('/owner').get(function (req, res) {
//     res.sendfile(req.app.get('appPath') + '/owner.html');
// });

// router.route('/buyer').get(function (req, res) {
//     res.sendfile(req.app.get('appPath') + '/buyer.html');
// });

/*router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile('index.html', { root: path.join(__dirname, '../../client') })
    //res.sendFile('../../client/index.html');
    console.log("path:" + absoluteAppPath);
});*/

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your backend"});
});

router.route('/api/dependencies').get(function(req,res) {
    fs.readFile('./server/DependencyFinder/omni.xml', function(err, data) {
        findDependencies(data, function(result) {
            console.log("Test Callback");
            res.status(200).json(result);
        });

    })


})

function findDependencies(xml, callback) {
    var parser = new xml2js.Parser();
    perf.start();
    parser.parseString(xml, function (err, result) {

        var object = result.unit.unit;

        var graphData2 = { 
            "nodes":[], "links":[] };
        testRegex(object);
        
        function testRegex(object) {
            var allClasses = [];
            var stringsJson = [];
            for (var i = 0; i < object.length; i++) {
                var currentNode = {"id": "", "group": 1, "count": 0};
                if (object[i].class != null) {  
                    var currentName = object[i].class[0].name;
                    currentNode.id = currentName.toString();
                    stringsJson[i] = JSON.stringify(object[i].class);
                    //graphData2.nodes.push(nodes);
                }

                else if (object[i].interface != null) {
                    var currentName = object[i].interface[0].name;
                    currentNode.id = currentName.toString();
                    stringsJson[i] = JSON.stringify(object[i].interface);
                   // graphData2.nodes.push(nodes);
                }
                graphData2.nodes.push(currentNode);
                allClasses.push(currentName);
            }

            for (var i = 0; i < allClasses.length; i++) {
                var countDep = 0;
                for (var j = 0; j < allClasses.length; j++) {

                    if (i == j) {
                        continue;
                    }
                    var pattern = new RegExp('"name":."' + allClasses[j])
                    var match;
                    var result = [];
                    if ((match = pattern.exec(stringsJson[i])) != null) {
                        result.push(match);
                        countDep++;
                        //console.log("\n");
                        //console.log(allClasses[i] + "  RELATIONSHIP WITH:  " + allClasses[j]);
                        var links = { "source": allClasses[i].toString(), "target": allClasses[j].toString(), "value": 1 };
                        graphData2.links.push(links);
                    }
                    currentNode.count = countDep;
                    
                }
                graphData2.nodes[i].count = countDep;
            }
            const results = perf.stop();
            console.log(results.time);
            callback(graphData2);
            //fs.writeFileSync('graphData2.json', JSON.stringify(graphData2, null, 2));


        }

    });
}


module.exports = router
