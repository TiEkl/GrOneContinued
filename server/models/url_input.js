const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let url_input_schema = new Schema({
  url: {
    type: String,
    minLength: 10,
    required: true
  }
  //,
  //filtered: {
  //    type: boolean,
  //    default: false
  //}
});

module.exports = mongoose.model('urls', url_input_schema);