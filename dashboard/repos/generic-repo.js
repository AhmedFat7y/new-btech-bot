const async = require('async');
const { MaintenanceRequest } = require('../../db/models/maintenance-request');
const { InstallationRequest } = require('../../db/models/installation-request');
const { Form } = require('../../db/models/form');
const queryBuilder = require('./query-builder');

class GenericRepo {
  static getMaintenanceRequests(timeStampMatch, callback) {
    async.parallel([
      parallelCallback => queryBuilder.getMaintenanceRequests(timeStampMatch).exec(parallelCallback),
      parallelCallback => queryBuilder.getMaintenanceRequestsCount(timeStampMatch).exec(parallelCallback),
    ], (err, [requests, count]) => {
      callback(err, requests, count);
    });
  }
  static getComplaints(timeStampMatch, callback) {
    async.parallel([
      parallelCallback => queryBuilder.getComplaints(timeStampMatch).exec(parallelCallback),
      parallelCallback => queryBuilder.getComplaints(timeStampMatch).exec(parallelCallback)
    ], (err, [complaints, count]) => {
      callback(err, complaints, count); 
    });
  }
  //fnunction to get number of open maintenance-request / which needs handling
  static getNoOfOpenMaintainanceRequest(timeStampMatch, callback) {
    queryBuilder.getOpenMaintenanceRequestsCount(timeStampMatch).exec((err, MaintenanceRequestN) => {
      callback(err, MaintenanceRequestN);
    });
  }

  static addFormSubmission(data, callback) {
    Form.create(data, callback);
  }

  static getAllForms(timeStampMatch, callback) {
    queryBuilder.getAllForms(timeStampMatch).exec((callback));
  }
}

module.exports = GenericRepo;
