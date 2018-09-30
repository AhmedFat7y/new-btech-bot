const convosRepo = require('../repos/convos-repo');
const genericRepo = require('../repos/generic-repo');
const queryBuilder = require('../repos/query-builder');
const moment = require('moment');
const async = require('async');
const KVStore = require('../../db/models/kv-store').KVStore.en;

/**
 * This is a class wrapper for controller methods for dashboard. All methods must be static and accept (req, res, next) passed by express router.
 */
class DashboardController {
  
  static index(req, res, next) {
    res.render('dashboard/index');
  }

  static groups(req, res, next) {
    let groupMatch = req.query.group;
    convosRepo.getAllGroups(true, (err, groupsList) => {
      res.render('dashboard/groups', { groupsList: (groupsList || []) });
    });
  }
  
  static profiles(req, res, next) {
    let lastMessTimes = [];
    let pagesCount = 0;
    let filters = req.query || {};
    filters.pageNumber = parseInt(filters.pageNumber) || 1;
    let pageNumber = filters.pageNumber;
    let timeStampMatch = queryBuilder.createTimeStampFilter(filters);
    let genderMatch = filters.gender;
    let categoryMatch = filters.category;
    let groupMatch = filters.group;
    async.parallel([
      parallelCallback => convosRepo.getUserswithPage(categoryMatch, groupMatch, genderMatch, timeStampMatch, pageNumber, parallelCallback),
      parallelCallback => convosRepo.getAllGroups(false, parallelCallback),
      parallelCallback => convosRepo.getCategories(parallelCallback),
    ], (err, [[usersDetails, usersCount], groups, categories]) => {
      let pagesCount = Math.ceil(usersCount / 30);
      res.render('dashboard/profiles', {
        filters,
        groups,
        pagesCount,
        usersDetails,
        categories
      });
    });
  }

  /**
  /* Creates a group with group name and filters
  */
  static createGroup(req, res, next) {
    let groupName = req.body.groupName;
    let filters = JSON.parse(req.body.filters || '{}');
    convosRepo.insertGroup(groupName, filters, err => {
      res.redirect('/dashboard/groups');
    });
  }

  /**
  /*Fetches all the Interests with their User counts
  */
  static interests(req, res, next) {
    let timeStampMatch = queryBuilder.createTimeStampFilter(req.query);
    convosRepo.getInterestsUserCount(timeStampMatch, (err, interestsUserCount) => {
      res.render('dashboard/interests', { interestsUserCount });
    });
  }

  /**
   * Fetches different genders counts, number of people who need support, top 10 profiles, top 10 interests and pass them to view/dashboard/summary.pug
  */
  static summary(req, res, next) {
    let timeStampMatch = queryBuilder.createTimeStampFilter(req.query);
    async.parallel([
      parallelCallback => convosRepo.getGenderCount(timeStampMatch, parallelCallback),
      parallelCallback => convosRepo.supportNeeded(timeStampMatch, parallelCallback),
      parallelCallback => genericRepo.getNoOfOpenMaintainanceRequest(timeStampMatch, parallelCallback),
      parallelCallback => convosRepo.getTop10Interests(timeStampMatch, parallelCallback),
      parallelCallback => convosRepo.getTop10ProfilesID(timeStampMatch, parallelCallback),
      parallelCallback => convosRepo.engagementTimeline(timeStampMatch, parallelCallback),
    ], (err, [users, noOfSupportNeeded, maintenanceRequestN, top10Interests, profilesName, timeline]) => {
      if (err) {
        console.error('Error at summary queries:', err);
      }
      let females = users && users.length && (users[0]._id === 'female' ? users[0] : users[1]);
      let males = users && users.length && (users[0]._id === 'male' ? users[0] : users[1]);
      // console.log(timeline);
      res.render('dashboard/summary', {
        males: (males && males.count) || 0,
        females: (females && females.count) || 0,
        maintenanceRequestN: maintenanceRequestN || 0,
        noOfSupportNeeded: noOfSupportNeeded || 0,
        top10Interests: top10Interests || [],
        profilesName: profilesName || [],
        timeline: timeline || {},
        filters: req.query,
      });
    });
  }

  /**
   * Retrieves single user data given his ID in req.params (as part of the url in routes). Then, it's passed to views/dashboard/profile.pug for rendering
  */
  static profile(req, res, next) {
    console.log('called profile for', req.params.fbId);
    let fbId = req.params.fbId;
    let timeStampMatch = queryBuilder.createTimeStampFilter(req.query);
    async.parallel([
      parallelCallback => convosRepo.getUserDetails(fbId, parallelCallback),
      parallelCallback => convosRepo.getLatestMessageTime(fbId, parallelCallback),
      parallelCallback => convosRepo.getMessageNumber(fbId, parallelCallback),
      parallelCallback => convosRepo.getConversationDetails(fbId, timeStampMatch, parallelCallback),
    ], (err, [userDetails, latestMessage, messageCount, conversationDetails]) => {
      if (err) {
        console.error('Error at profile calls', err);
      }
      res.render('dashboard/profile', {
        userDetails,
        latestMessage,
        messageCount,
        flag: userDetails && userDetails.needsSupport,
        messages: conversationDetails,
        filters: req.query
      });
    });
  }

  /**
   * Retrieve conversations list (alternative name to users list) and it's passed to views/dashboard/conversations.pug for rendering
  */
  static conversationsList(req, res, next) {
    convosRepo.getConversations((err, convos) => {
      res.render('dashboard/conversations', { convos: convos });
    });

  }

  static installationRequests(req, res, next) {
    genericRepo.getInstallationRequests((err, requests) => {
      res.render('dashboard/installation-requests', { requests: requests });
    });

  }

  static maintenanceRequests(req, res, next) {
    let timeStampMatch = queryBuilder.createTimeStampFilter(req.query);
    genericRepo.getMaintenanceRequests(timeStampMatch, (err, requests, count) => {
      requests.forEach(request => {
        request.formattedTime = moment(request.time).format('LLL');
        request.status = request.isHandled ? 'Handeled' : 'Pending';
      });
      let pagesCount = Math.ceil(count / 30);
      res.render('dashboard/maintenance-requests', { requests, filters: req.query, pagesCount });
    });
  }

  static conversationDetails(req, res, next) {
    convosRepo.getConversationDetails(req.params, (err, conversationDetails) => {
      res.send({ error: false, messages: conversationDetails });
    });
  }

  static forms(req, res, next) {
    let timestampFilter = queryBuilder.createTimeStampFilter(req.query);
    genericRepo.getAllForms(timestampFilter, (err, formsList) => {
      formsList.forEach(function(form) {
        form.firstFormattedTimestamp = moment(form.firstSubmissionDate).toString();
        form.lastFormattedTimestamp = moment(form.lastSubmissionDate).toString();
      });
      res.render('dashboard/forms', {formsList, filters: req.query});
    });
  }

  static jotFormWebhook(req, res, next) {
    let formInfo = req.body;
    let formObj = {
      formId: formInfo.formID,
      title: formInfo.formTitle,
      submissionId: formInfo.submissionID,
      ip: formInfo.ip,
      type: formInfo.type,
    };
    res.status(200).end();
    genericRepo.addFormSubmission(formObj, err => {
      if (err) {
        console.error('Error Saving Form Submission', err);
      }
    });
  }

  static globalSwitch(req, res, next) {
    async.waterfall([
      nextFunc => KVStore.findOne({key: 'global-switch'}, nextFunc),
    ], (err, globalSwitch) => {
      let globalSwitchValue = (globalSwitch && globalSwitch.value) || 'off';
      res.render('dashboard/global-switch', {globalSwitchValue});
    });
  }

  static toggleBotSwitch(req, res, next) {
    async.waterfall([
      nextFunc => KVStore.findOne({key: 'global-switch'}, nextFunc),
      (globalSwitch, nextFunc) => {
        let globalSwitchValue = (globalSwitch && globalSwitch.value) || 'off';
        globalSwitchValue = globalSwitchValue === 'off'? 'on' : 'off';
        KVStore.update(
          {key: 'global-switch'},
          {key: 'global-switch', value: globalSwitchValue},
          {upsert: true}, err => {
            nextFunc(err, globalSwitchValue)
        });
      }
    ], (err, globalSwitchvalue) => {
      res.send({globalSwitch: globalSwitchvalue});
    });
  }

  static complaint(req, res, next) {
    let timeStampMatch = queryBuilder.createTimeStampFilter(req.query);
    genericRepo.getComplaints(timeStampMatch, (err, complaints, count) => {
      complaints.forEach(complaint => {
        complaint.formattedTime = moment(complaint.createdAt).format('LLL');
        complaint.status = complaint.isHandled ? 'Handeled' : 'Pending';
        console.log(complaint.status); 
      });
      
      let pagesCount = Math.ceil(count / 30);
      res.render('dashboard/complaint', { complaints, filters: req.query, pagesCount });
    });
  }
}

module.exports = DashboardController;