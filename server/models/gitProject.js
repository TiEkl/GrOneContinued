var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gitProjectSchema = new Schema ({
    owner: {type: String},
    repo: {type: String},
    files: {type: []}

});
module.exports = mongoose.model('gitProject', gitProjectSchema);