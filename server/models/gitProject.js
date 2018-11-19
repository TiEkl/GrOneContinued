var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gitProjectSchema = new Schema ({
    name: {type: String},
    files: {type: [Object]}

});
module.exports = mongoose.model('gitProject', gitProjectSchema);