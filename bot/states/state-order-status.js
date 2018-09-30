"use strict";
const StateBase = require('./state-base');
const STATE_NAME = 'StateOrderStatus';
const btechApis = require('../apis-wrappers/btech-wrapper');
const async = require('async');
class StateOrderStatus extends StateBase {
    constructor(stateManager, localesManager) {
        super(...arguments);
        this.pause = true;
        this.needsInputVerification = true;
    }

    constructReply() {
        const self = this;
        return {
            text: self.localesManager.questions.enterOrderId,
        };
    }


    execute(callback) {
        console.log('Executing State getting order status');
        this.skipPrompt = false;
        this.prompt(callback);
    }

    prompt(callback) {
        this.managePrompts(this.constructReply(), callback);
    }

    constructFailurePrompt() {
        const self = this;
        return {
            text: self.localesManager.validations.enterValidOrderId,
        };
    }

    constructSuccessPrompt() {
        return {
            text: "This is valid Order Id!"
        };
    }
    failurePrompt(callback) {
        callback(null, false, this.constructFailurePrompt());
    }

    successPrompt(callback) {
        var {incomingMessage, user} = this.stateManager.data;
        this.getOrderStatus(incomingMessage.text.trim(), callback);
    }


    verifyInput(callback) {
        console.log('Verifying order input status');
        //checking order number validity
        var {incomingMessage, user} = this.stateManager.data;
        if (!isNaN(incomingMessage.text.trim())) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    }

    getOrderStatus(orderId, callback) {
        let isSuccess = true;
        async.waterfall([
            nextFunc => btechApis.getOrderStatus(orderId, nextFunc),
        ], (err, orderDetails) => {
            if (err) {
                console.error('error fetching order data', err);
                isSuccess = false;
            } else {
                console.log(orderDetails);

            }
            callback(null, isSuccess);
        });
    }
}
module.exports = StateOrderStatus;