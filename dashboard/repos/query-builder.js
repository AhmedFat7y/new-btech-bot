const async = require('async');
const { User } = require('../../db/models/user');
const { Message } = require('../../db/models/message');
const { Category } = require('../../db/models/category');
const { Groups } = require('../../db/models/groups');
const { MaintenanceRequest } = require('../../db/models/maintenance-request');
const { InstallationRequest } = require('../../db/models/installation-request');
const { Form } = require('../../db/models/form');
const Issue = require('../../db/models/issue');
class QueryBuilder {
  static getGroups() {
    return Groups.find({filters: {$exists: true}}).sort({ 'name': 1 });
  }

  static getUsersCount(filters) {
    return Message.aggregate([
      {$match: filters},
      {$group: {_id: '$fbId'}},
      {$group: {_id:1, count: {$sum : 1 }}}
    ]);
  }

  static getUsersPaged(filters, pageNumber) {
    let mongoFilters = [];
    mongoFilters.push({ $sort: { timestamp: -1 } });
    mongoFilters.push({ $match: filters });
    mongoFilters.push({ $group: { 
      _id: '$fbId',
      latestInteraction: { $first: '$timestamp' }
    }});
    if (pageNumber !== 0) {
      mongoFilters.push({ $skip: 30 * (pageNumber - 1) });
      mongoFilters.push({ $limit: 30 });
    }
    mongoFilters.push({ $project: { _id: false, fbId: '$_id', latestInteraction: true }});
    return Message.aggregate(mongoFilters);
  }

  static getUsersWithIds(usersIds) {
    return User.find({ fbId: { $in:  usersIds} });
  }

  static createUsersFilter(timeStampMatch, genderMatch, categoryMatch) {
    let filter = { joinedAt: timeStampMatch.filter };
    if (genderMatch) {
      filter.gender = genderMatch;
    }
    if (categoryMatch) {
      filter['extraData.text']= { '$exists': true, '$ne': null };
      filter['extraData.categoryId']= parseInt(categoryMatch);
      filter['extraData.key']= 'categoryFilters';
    }
    return filter;
  }
  static getMaintenanceRequestsCount(timeStampMatch) {
    return MaintenanceRequest.count({createdAt: timeStampMatch.filter});
  }
  static getMaintenanceRequests(timeStampMatch, pageNumber) {
    let q =  MaintenanceRequest.find({createdAt: timeStampMatch.filter}).sort({createdAt: -1});
    if (pageNumber) {
      q = q.skip(30 * (pageNumber - 1)).limit(30);
    }
    return q;
  }

  static getOpenMaintenanceRequestsCount(timeStampMatch) {
    return MaintenanceRequest.count({ isHandled: false, createdAt: timeStampMatch.filter });
  }

  static getAllForms(timeStampMatch) {
    return Form.aggregate([
      {$match: {
        createdAt: timeStampMatch.filter
      }},
      {$group: {
        _id: '$formId',
        firstSubmissionDate: {$first: '$createdAt'},
        lastSubmissionDate: {$last: '$createdAt'},
        title: {$first: '$title'},
        submissionsCount: {$sum: 1} 
      }},
      {$project: {
        _id: false,
        formId: '$_id',
        firstSubmissionDate: true,
        lastSubmissionDate: true,
        title: true,
        submissionsCount: true,
      }}
    ]);
  }

  static createTimeStampFilter(filters) {
    let timeStampMatch = { filter: null };
    if (filters.start && filters.end) {
      let startDate = new Date(filters.start), endDate = new Date(filters.end);
      timeStampMatch.filter = { $gte: startDate, $lte: endDate };
    } else {
      timeStampMatch.filter = { $lte: new Date() };
    }
    return timeStampMatch;
  }

  static getUserByFbId(fbId) {
    return User.findOne({fbId});
  }
  static getUserMessages(fbId, timeStampMatch) {
    return Message.aggregate([
      { $match: { fbId: fbId, timestamp: timeStampMatch.filter } },
      { $sort: { 'timestamp': 1 } },
    ])
  }

  static getInterestsUsersCount(timeStampMatch) {
    return Message.aggregate(
      [
        {
          $match: {
            'timestamp': timeStampMatch.filter,
            'extraData.text': { '$exists': true, '$ne': null },
            'extraData.key': 'categoryFilters',
          }
        },
        {
          $group: {
            _id: '$extraData.text',
            count: { $sum: 1 },
            users: { $addToSet: '$fbId' }
          }
        },
        { $sort: { 'count': -1 } },
        {
          $project: {
            _id: 1,
            count: 1,
            userCount: { $size: '$users' },
          }
        }
      ]
    );
  }
  static getComplaints(timeStampMatch, pageNumber) {
    let q = Issue.find({createdAt: timeStampMatch.filter}).sort({createdAt: -1});
    if (pageNumber) {
      q = q.skip(30 * (pageNumber - 1)).limit(30);
    }
    return q;
  }
  static getComplaintsCount(timeStampMatch, pageNumber) {
    let q = Issue.count({ isHandled: false, createdAt: timeStampMatch.filter });
    if (pageNumber) {
      q = q.skip(30 * (pageNumber - 1)).limit(30);
    }
    return q;
  }
}

module.exports = QueryBuilder;
