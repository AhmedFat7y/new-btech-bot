const moment = require('moment');
const async = require('async');
const streamify = require('stream-array');
const csv = require('csv');
const pump = require('pump');
const queryBuilder = require('../repos/query-builder');
const convosRepo = require('../repos/convos-repo');

function streamCSV(mongooseCursor, csvHeader, transformCallback, resourceName, res, transformOptions) {
  let csvStream = csv.stringify({
    columns: csvHeader,
    header: true
  });
  let csvTransformStream = csv.transform(transformCallback, transformOptions || {});
  let filename = `${resourceName}_${new Date().toISOString()}.csv`;
  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=${filename}`);
  res.status(200);
  debugger;
  pump(mongooseCursor, csvTransformStream, csvStream, res, err => {
    if (err) {
      console.error('Error Streaming for', filename, err);
    }
    console.log('streaming is done for', filename);
  });
}

class ExportCSVController {

  static maintenanceRequests(req, res, next) {
    let timestampMatch = queryBuilder.createTimeStampFilter(req.query || {});
    let mongooseStream = queryBuilder.getMaintenanceRequests(timestampMatch).lean().cursor();
    let csvHeader = ['name', 'phone', 'category', 'brand', 'created at', 'is handled', 'handled at'];
    let transformCallback = doc => [
      doc.name,
      doc.phone,
      doc.product.category,
      doc.product.brand,
      doc.createdAt.toString(),
      doc.isHandled || 'Not Handled Yet',
      doc.handledAt || 'Not Handled Yet',
    ];
    let resourceName = 'maintenance_requests';
    streamCSV(mongooseStream,  csvHeader, transformCallback, resourceName, res);
  }
  
  static forms(req, res, next) {
    let timestampMatch = queryBuilder.createTimeStampFilter(req.query || {});
    // it's aggregate so we need to do cursor().exec().stream();
    let mongooseStream = queryBuilder.getAllForms(timestampMatch).cursor().exec().stream();
    let csvHeader = ['form id', 'form title', 'submissions count', 'type', 'ip', 'first submission date', 'last submission date'];
    let transformCallback = doc => [
      doc.formId,
      doc.title,
      doc.submissionsCount,
      doc.type,
      doc.ip,
      doc.firstSubmissionDate,
      doc.lastSubmissionDate,
    ];
    let resourceName = 'forms';
    streamCSV(mongooseStream,  csvHeader, transformCallback, resourceName, res);
  }

  static profiles(req, res, next) {
    let timestampMatch = queryBuilder.createTimeStampFilter(req.query || {});
    let filters = queryBuilder.createUsersFilter(timestampMatch, req.query.gender, req.query.category);
    let groupMatch = req.query.group;
    // it's aggregate so we need to do cursor().exec().stream();
    let csvHeader = ['fb id', 'full name', 'gender', 'locale', 'timezone', 'national id', 'phone', 'needs support', 'joined at'];
    let transformCallback = ({fbId}, done) => {
      queryBuilder.getUserByFbId(fbId).exec((err, doc) => {
        done(err, doc && [
          doc.fbId,
          (doc.firstName || '') + (doc.lastName || ''),
          doc.gender,
          doc.locale,
          doc.timezone,
          doc.nationalId,
          doc.phone,
          doc.needsSupport,
          doc.joinedAt,
        ]);
      });
    };
    let transformOptions = {parallel: 10};
    let resourceName = 'profiles';
    async.waterfall([
      nextFunc => {
        if (groupMatch) {
          Groups.findOne({ name: groupMatch }, (err, group) => {
            nextFunc(null, group.filters);
          });
        } else {
          nextFunc(null, filters);
        }
      }
    ], (err, filters) => {
      let mongooseStream = queryBuilder.getUsersPaged(filters, 0).cursor().exec().stream();
      streamCSV(mongooseStream,  csvHeader, transformCallback, resourceName, res, transformOptions)
    });
  }

  static profile(req, res, next) {
    let fbId = req.params.fbId;
    let timestampMatch = queryBuilder.createTimeStampFilter(req.query || {});
    // it's aggregate so we need to do cursor().exec().stream();
    let mongooseStream = queryBuilder.getUserMessages(fbId, timestampMatch).cursor().exec().stream();
    let csvHeader = ['from user', 'bot reply', 'timestamp', 'replied', 'is failure'];
    let transformCallback = message => [
      message.text || (message.extraData && message.extraData.text) || 'Buttons/Carousal',
      message.replies.map(reply => reply.text || 'Buttons/Carousal').join(' === '),
      message.timestamp.toString(),
      message.replied.toString(),
      message.isFailure.toString(),
    ];
    let resourceName = 'profile_' + fbId;
    streamCSV(mongooseStream,  csvHeader, transformCallback, resourceName, res);
 
  }

  static groups(req, res, next) {
    convosRepo.getAllGroups(true, (err, groupsList) => {
      let mongooseStream = streamify(groupsList);
      let csvHeader = ['name', 'filters', 'createdAt'];
      let transformCallback = group => [
        group.name,
        JSON.stringify(group.displayedFilters),
        group.createdAt.toString(),
      ];
      let resourceName = 'groups';
      streamCSV(mongooseStream,  csvHeader, transformCallback, resourceName, res);
    });
  }

  static forms(req, res, next) {
    let timestampMatch = queryBuilder.createTimeStampFilter(req.query || {});
    // it's aggregate so we need to do cursor().exec().stream();
    let mongooseStream = queryBuilder.getAllForms(timestampMatch).cursor().exec().stream();
    let csvHeader = ['formId', 'title', 'submissions count', 'first submission date', 'last submission date'];
    let transformCallback = form => [
      form.formId,
      form.title,
      form.submissionsCount,
      form.firstSubmissionDate,
      form.lastSubmissionDate,
    ];
    let resourceName = 'forms';
    streamCSV(mongooseStream,  csvHeader, transformCallback, resourceName, res);
  }

  static interests(req, res, next) {
    let timestampMatch = queryBuilder.createTimeStampFilter(req.query || {});
    // it's aggregate so we need to do cursor().exec().stream();
    let mongooseStream = queryBuilder.getInterestsUsersCount(timestampMatch).cursor().exec().stream();
    let csvHeader = ['category', 'interested users count', 'total interested messages'];
    let transformCallback = interest => [
      interest._id,
      interest.userCount,
      interest.count,
    ];
    let resourceName = 'interests';
    streamCSV(mongooseStream,  csvHeader, transformCallback, resourceName, res);
  }

}

module.exports = ExportCSVController;