"use strict"; 
let db = require('./../connector'); 
let mongoose = db.connect(); 
let autoIncrement = require('mongoose-auto-increment')

autoIncrement.initialize(mongoose.connection);

let IssueSchema  = new mongoose.Schema({
    fbId: {type: String},
    name: {type: String}, 
    phone: {type: String}, 
    text: [String], 
    isHandled: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    handledAt: {type: Date, default: Date.now}
    
}); 

IssueSchema.plugin(autoIncrement.plugin, {
    model: 'Issue',
    field: 'complaintNo',
    startAt: 10000
}); 
let IssueModel = mongoose.model('Issue', IssueSchema); 

module.exports = IssueModel; 