var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var classSchema = new Schema ({
    nodes: {type: []},
    links: {type: []},
});

var projectSchema = new Schema ({
    classes: classSchema,
    graphid:{
        type: String
    }
});
module.exports = mongoose.model('projectNode', projectSchema);