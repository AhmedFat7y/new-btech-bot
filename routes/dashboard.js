"use strict";
let express = require('express');
let dashboardController = require('../dashboard/controllers/dashboard');
let exportCSVController = require('../dashboard/controllers/export-csv');
let router = express.Router();

router.get('/', dashboardController.index);
router.get('/conversations', dashboardController.conversationsList);
router.get('/conversations/:userId/messages', dashboardController.conversationDetails);
router.get('/installation-requests', dashboardController.installationRequests);
router.get('/summary', dashboardController.summary);
router.get('/global-switch', dashboardController.globalSwitch);

router.get('/maintenance-requests', dashboardController.maintenanceRequests);
router.get('/profiles', dashboardController.profiles);
router.get('/profiles/:fbId/view', dashboardController.profile);
router.get('/groups', dashboardController.groups);
router.get('/forms', dashboardController.forms);
router.get('/interests', dashboardController.interests);
router.get('/complaints', dashboardController.complaint);

router.get('/maintenance-requests/export', exportCSVController.maintenanceRequests);
router.get('/profiles/export', exportCSVController.profiles);
router.get('/profiles/:fbId/export', exportCSVController.profile);
router.get('/groups/export', exportCSVController.groups);
router.get('/forms/export', exportCSVController.forms);
router.get('/interests/export', exportCSVController.interests);
router.post('/groups', dashboardController.createGroup);
router.post('/global-switch', dashboardController.toggleBotSwitch);

module.exports = router;