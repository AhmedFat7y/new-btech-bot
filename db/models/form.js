let db = require('./../connector');
let mongoose = db.connect();

function createSchema() {
  return new mongoose.Schema({
    formId: {type: String, index: true},
    title: {type: String, index: true},
    submissionId: {type: String},
    ip: {type: String},
    type: {type: String},
    createdAt: {type: Date, default: Date.now},
  }, {autoIndex: false});
}

let formSchema = createSchema();

let formModel = mongoose.model('Form', formSchema);

module.exports = {
  schema: formSchema,
  Form: formModel,
};
