let bcrypt = require('bcrypt-nodejs');
let db = require('./../connector');
let mongoose = db.connect();

function createSchema() {
  return new mongoose.Schema({
    username: {type: String, index: true},
    password: {type: String},
    isSuper: {type: Boolean},
  }, {autoIndex: false});
}

let AdminSchema = createSchema();

// methods ======================
// generating a hash
AdminSchema.methods.generateHash = function(callback) {
  bcrypt.hash(this.password, bcrypt.genSaltSync(8), null, (err, hash) => {
    this.password = hash;
    callback(err);
  });
};

// checking if password is valid
AdminSchema.methods.validPassword = function(password, callback) {
  bcrypt.compare(password, this.password, callback);
};


let AdminModel = mongoose.model('Admin', AdminSchema);

module.exports = {
  schema: AdminSchema,
  Admin: AdminModel,
};
