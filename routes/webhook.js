const multer = require('multer');
let express = require('express');
let botController = require('../bot/bot-controller');
let dashboardController = require('../dashboard/controllers/dashboard');


let multipartForm = multer();
let router = express.Router();

router.get('/', botController.verifyWebHook);
router.post('/', botController.processIncomingEvent);
router.get('/jotform', (req, res, next) => {
  res.send('Hello to jetform integration point');
});
router.post('/jotform', multipartForm.fields([]), dashboardController.jotFormWebhook);

module.exports = router;