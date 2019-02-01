
//Settings for deployment
module.exports = {
    bbManager1: "192.168.1.2:8000",
    bbManager2: "192.168.43.168:8000",
    DepenencyFinder: "192.168.1.2:9000",
    RepoHandler: "192.168.1.2.8001",
    loadBalancerPort: 8002,
    d3Get: function(ownerName, repoName) {return `/api/bb/${ownerName}/${repoName}`;}
}

//Local Testing
/*module.exports = {
    bbManager1: "127.0.0.1:8000",
    bbManager2: "127.0.0.1:8000",
    DepenencyFinder: "127.0.0.1:9000",
    RepoHandler: "127.0.0.1.8001",
    loadBalancerPort: 8002,
    d3Get: function() {return "data/omninotes.json";}
}*/