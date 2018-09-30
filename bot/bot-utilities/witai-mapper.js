const async = require('async');

const StateHello = require('../states/state-hello');
const StateBibo = require('../states/state-bibo');
const StateShowProductsList = require('../states/new-state-show-products-list');
const StateAskAboutAddressLocation = require('../states/state-ask-about-address-location');
const StateFindNearestStore = require('../states/state-find-nearest-store');
const StateHandleUserConfusion = require('../states/state-handle-user-confusion');

class WitAIMapper {
  constructor(stateManager) {
    this.stateManager = stateManager
    this.localesManager = stateManager.localesManager;
  }

  checkBranchLocationQuery(entities, callback) {
    let self = this;
    let near = entities['near'] && entities['near'][0] && entities['near'][0].value;
    let witLocation = entities['location'] && entities['location'][0] && entities['location'][0].value;
    if (witLocation) {
      this.stateManager.data.incomingMessage.text = witLocation;
      let locationVerifier = new StateAskAboutAddressLocation(this.stateManager);
      async.waterfall([
        nextFunc => locationVerifier.verifyInput(nextFunc),
        (status, nextFunc) => {
          let state = null;
          if (status) {
            state = StateFindNearestStore;
          } else {
            state = StateAskAboutAddressLocation;
          }
          nextFunc(null, state);
        }
      ], callback);
    } else {
      callback(null, StateAskAboutAddressLocation);
    }
  }

  checkProductSearchQuery(entities, callback) {
    let self = this;
    let price = entities['Price'];
    let brands = entities['Brand_name'] || entities['brands'];
    let categories = entities['categories'];
    let user = this.stateManager.data.user;
    if (categories && categories.length) {
      let category = categories[0];
      let magentoId = JSON.parse(category.metadata).magentoId;
      user.switchToCategory({
        magentoId,
        name: category.value,
      })
    }
    if (brands && brands.length) {
      let brand = brands[0];
      let magentoId = JSON.parse(brand.metadata).magentoId;
      user.filters.brand = {
        magentoId: magentoId,
        name: brand.value,
      }
    }
    callback(null, StateShowProductsList);
  }

  checkBotAge(entities, callback) {
    callback(null, {
      text: 'محدش قالي انا عندى كام سنة'
    });
  }

  checkBotStatus(entities, callback) {
    callback(null, {
      text: 'الحمد لله زالفول'
    });
  }

  getGreeting(entities, callback) {
    let self = this;
    this.stateManager.addPrompt({
      text: entities['Greetings'][0].value + ' ' + self.stateManager.data.user.getFullName()
    });
    callback(null, StateHello);
  }

  checkBotExistence(entities, callback) {
    callback(null, StateHello);
  }

  checkBotGratefulness(entities, callback) {
    callback(null, {
      text: 'العفو',
    });
  }

  checkAngerHelp(entities, callback) {
    callback(null, StateHandleUserConfusion);
  }

  checkRequirements(entities, callback) {
    callback(null, {
      text: 'Minicash requirements here'
    });
  }
  checkBiboEntityCallback(entities, callback) {
    console.log('I called bibo');
    callback(null, StateBibo);
  }

  mapEntity(entityName, entityValues, entities, callback) {
    let self = this;
    let flag = true;
    switch(entityName) {
      case 'Branch':
        self.checkBranchLocationQuery(entities, callback);
        break;
      case 'Bibo':
        self.checkBiboEntityCallback(entities, callback);
        break;
      case 'categories':
        self.checkProductSearchQuery(entities, callback);
        break;
      case 'Greetings':
        self.getGreeting(entities, callback);
        break;
      case 'How_old':
        self.checkBotAge(entities, callback);
        break;
      case 'How_are_you':
        self.checkBotStatus(entities, callback);
        break;
      case 'anyone':
        self.checkBotExistence(entities, callback);
        break;
      case 'thanks':
        self.checkBotGratefulness(entities, callback);
        break;
      case 'requirement':
        self.checkRequirements(entities, callback);
        break;
      case 'Help':
      case 'angry':
        self.checkAngerHelp(entities, callback);
        break;
      default: flag = false;
    }
    return flag;
  }

  get(entities, callback) {
    let self = this;
    let messages = [];
    let keys = Object.keys(entities);
    async.waterfall([
      nextFunc => {
        for (let key of keys) {
          let status = this.mapEntity(key, entities[key], entities, nextFunc);
          if (status) {
            return;
          }
        }
        nextFunc(null, null)
      },
    ], callback);
  }
}


module.exports = WitAIMapper;
