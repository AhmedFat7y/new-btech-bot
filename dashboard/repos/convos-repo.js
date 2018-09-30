const async = require('async');
const { User } = require('../../db/models/user');
const { Message } = require('../../db/models/message');
const { Category } = require('../../db/models/category');
const { Groups } = require('../../db/models/groups');
const queryBuilder = require('./query-builder');

class ConvosRepo {

  static getGroupCount(group, callback) {
    queryBuilder.getUsersCount(group.filters).exec((err, result) => {
      if (!err && result && result.length) {
        group.usersCount = result[0].count;
      } else {
        group.usersCount = 0;
      }
      callback(err);
    });
  }

  static getAllGroups(withCount, callback){
    queryBuilder.getGroups().lean().exec((err, groupsList) => {
      if (withCount) {
        async.eachLimit(groupsList, 4, ConvosRepo.getGroupCount,  err => {
          callback(err, groupsList);
        });
      } else {
        callback(err, groupsList)
      }
    });
  }

  //static that inserest a new group to the list of groups
  static insertGroup(groupName, filters, callback) {
    delete filters.pageNumber;
    let displayedFilters = Object.assign({}, filters);
    if (filters.category) {
      filters['extraData.text']= { '$exists': true, '$ne': null };
      filters['extraData.categoryId']= parseInt(filters.category);
      filters['extraData.key']= 'categoryFilters';
      delete filters.category;
    }
    Groups.create({ name: groupName, filters, displayedFilters }, callback);
  }

  //static that gets the interests with their user count
  static getInterestsUserCount(timeStampMatch, callback) {
    queryBuilder.getInterestsUsersCount(timeStampMatch).exec((err, interestsUserCount) => {
      callback(err, interestsUserCount);
    });

  }

  static getUsersIdsAndCount(filters, pageNumber, callback) {
    async.parallel([
      parallelCallback => queryBuilder.getUsersPaged(filters, pageNumber).exec(parallelCallback),
      parallelCallback => queryBuilder.getUsersCount(filters).exec((err, result) => {
        let usersCount = (result && result.length && result[0] && result[0].count) || 0
        parallelCallback(err, usersCount);
      }),
    ], (err, [usersIds, usersCount]) => {
      let usersIdsObj = {};
      usersIds.forEach(userId => {
        usersIdsObj[userId.fbId] = userId.latestInteraction;
      });
      queryBuilder.getUsersWithIds(Object.keys(usersIdsObj)).exec((err, usersList) => {
        usersList.forEach(user => {
          user.latestInteraction = usersIdsObj[user.fbId];
          user.formattedLatestInteraction = usersIdsObj[user.fbId].toString();
        });
        callback(err, usersList, usersCount);
      })
    });
  }

  //static take page number and call back as input and returns the users in this page
  static getUserswithPage(categoryMatch, groupMatch, genderMatch, timeStampMatch, pageNumber, callback) {
    let filter = queryBuilder.createUsersFilter(timeStampMatch, genderMatch, categoryMatch);
    async.waterfall([
      nextFunc => {
        if (groupMatch) {
          Groups.findOne({ name: groupMatch }, (err, group) => {
            nextFunc(null, group.filters);
          });
        } else {
          nextFunc(null, filter);
        }
      }
    ], (err, filters) => ConvosRepo.getUsersIdsAndCount(filters, pageNumber, callback));
  }

  //static to get user count
  static getUsersCount(genderMatch, timeStampMatch, callback) {
    let filter = queryBuilder.createUsersFilter(timeStampMatch, genderMatch);
    User.find(filter).count().exec(callback);
  }

  //gets all categories from db
  static getCategories(callback) {
    Category.ar.find({}).exec(callback);
  }

  //static used to get the engagment timeline in the summary page
  static engagementTimeline(timeStampMatch, callback) {
    Message.aggregate([
      { $match: { 'timestamp': timeStampMatch.filter } },
      {
        $group: {
          _id: { month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' }, year: { $year: '$timestamp' } },

          users: { $addToSet: '$fbId' },
          count: { $sum: 1 },
          time1: {
            $push: {
              $cond: {
                if: {
                  $and: [{ $gte: [{ $hour: '$timestamp' }, 8] },
                  { $lt: [{ $hour: '$timestamp' }, 12] }]
                }, then: '$_id', else: false
              }
            }
          },
          time2: {
            $push: {
              $cond: {
                if: {
                  $and: [{ $gte: [{ $hour: '$timestamp' }, 12] },
                  { $lt: [{ $hour: '$timestamp' }, 16] }]
                }, then: '$_id', else: false
              }
            }
          },
          time3: {
            $push: {
              $cond: {
                if: {
                  $and: [{ $gte: [{ $hour: '$timestamp' }, 16] },
                  { $lt: [{ $hour: '$timestamp' }, 20] }]
                }, then: '$_id', else: false
              }
            }
          },
          time4: {
            $push: {
              $cond: {
                if: {
                  $and: [{ $gte: [{ $hour: '$timestamp' }, 20] },
                  { $lte: [{ $hour: '$timestamp' }, 23.59] }]
                }, then: '$_id', else: false
              }
            }
          },
          time5: {
            $push: {
              $cond: {
                if: {
                  $and: [{ $gte: [{ $hour: '$timestamp' }, 0] },
                  { $lt: [{ $hour: '$timestamp' }, 4] }]
                }, then: '$_id', else: false
              }
            }
          },
          time6: {
            $push: {
              $cond: {
                if: {
                  $and: [{ $gte: [{ $hour: '$timestamp' }, 4] },
                  { $lt: [{ $hour: '$timestamp' }, 8] }]
                }, then: '$_id', else: false
              }
            }
          },
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          count: 1,
          time1: 1,
          time2: 1,
          time3: 1,
          time4: 1,
          userCount: { $size: '$users' },
          time1Count: { $size: { '$setDifference': ['$time1', [false]] } },
          time2Count: { $size: { '$setDifference': ['$time2', [false]] } },
          time3Count: { $size: { '$setDifference': ['$time3', [false]] } },
          time4Count: { $size: { '$setDifference': ['$time4', [false]] } },
          time5Count: { $size: { '$setDifference': ['$time5', [false]] } },
          time6Count: { $size: { '$setDifference': ['$time6', [false]] } },

        }
      }
    ]).exec((err, timeline) => {
      callback(err, timeline);
    });
  }

  //static to get number of message for a specific person
  static getMessageNumber(fbId, callback) {
    Message.aggregate([
      { $match: { 'fbId': fbId } },
      { '$group': { _id: '$fbId', count: { $sum: 1 } } }
    ]
    ).exec((err, messageCount) => {
      callback(err, messageCount);
    });
  }


  //functon to get the latest message
  static getLatestMessageTime(fbId, callback) {
    Message.aggregate([
      { $match: { 'fbId': fbId } },
      { $group: { _id: { day: { $dayOfMonth: '$timestamp' }, month: { $month: '$timestamp' }, year: { $year: '$timestamp' }, hour: { $hour: '$timestamp' }, minute: { $minute: '$timestamp' } } } },
      { $sort: { '_id': -1 } },
      { $limit: 1 }
    ]
    ).exec(callback);
  }

  //get the number of each gender in the user database
  static getGenderCount(timeStampMatch, callback) {
    User.aggregate([
      { '$match': { joinedAt: timeStampMatch.filter } },
      { '$group': { _id: '$gender', count: { $sum: 1 } } }
    ]).exec(callback);
  }

  //static that gives the number of users who needs support
  static supportNeeded(timeStampMatch, callback) {
    User.count({ needsSupport: true, needsSupportAt: timeStampMatch.filter }).exec(callback);
  }

  //get the top 10 categories of interest
  static getTop10Interests(timeStampMatch, callback) {
    Message.aggregate(
      [
        {
          $match: {
            'timestamp': timeStampMatch.filter,
            'extraData.text': { '$exists': true, '$ne': null },
            'extraData.key': 'categoryFilters',
          },
        },
        { $group: { _id: '$extraData.text', 'count': { $sum: 1 } } },
        { $sort: { 'count': -1 } },
        { $limit: 10 }
      ]
    ).exec(callback);
  }

  //get the top 10 profiles that talk to bebo
  static getTop10ProfilesID(timeStampMatch, callback) {
    Message.aggregate(
      [
        { $match: { timestamp: timeStampMatch.filter } },
        { $group: { _id: '$fbId', 'count': { $sum: 1 } } },
        { $sort: { 'count': -1 } },
        { $limit: 10 }
      ]
    ).exec((err, profilesID) => {
      User.find({ fbId: { $in: profilesID } }).exec(callback);
    });
  }

  //Get the details of user using an Id
  static getUserDetails(fbId, callback) {
    User.findOne({ fbId: fbId }).exec(callback);

  }

  static getLatestMessage(user, callback) {
    Message.findOne({ fbId: user.fbId }).sort({ 'timestamp': -1 }).exec(callback);
  }

  static appendLastMessageToUsers(users, callback) {
    async.each(users, (user, eachCallback) => {
      async.waterfall([
        nextFunc => ConvosRepo.getLatestMessage(user, nextFunc),
      ], (err, latestMessage) => {
        user.latestMessage = latestMessage;
        eachCallback(null, user);
      });
    }, err => {
      callback(err, users);
    });
  }

  // static getConversations(callback) {
  //   async.waterfall([
  //     getUsers,
  //     appendLastMessageToUsers,
  //   ], callback);
  // }

  static getConversationDetails(fbId, timeStampMatch, callback) {
    queryBuilder.getUserMessages(fbId, timeStampMatch).exec(callback);
  }

}

module.exports = ConvosRepo;
