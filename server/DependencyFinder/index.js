var path = require('path');
var express = require('express');
var router = express.Router()

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
    res.sendfile(req.app.get('appPath') + '/index.html');
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

router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to your backend"});
});

getXML("/timmarcus.xml")

function getXML(xml){
let xhttp = new XMLHttpRequest();
xhhtp.onreadystatechange = function(){
    if (this.readyState == 4 && this.status ==200){
        showResult(xhttp.responseXML);
    }
    xhttp.open("GET", xml, true);
    xhttp.send();
}
function showResult(xml){
    var txt="";
    path ="/"
    if (xml.evaluate){
        var nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var result = nodes.iterateNext();
            while(result){
                txt+= result.childNodes[0].nodeValue + "<br>"
                result = nodes.iterateNext()
            }
    }
    console.log(txt);
}

}

module.exports = router
