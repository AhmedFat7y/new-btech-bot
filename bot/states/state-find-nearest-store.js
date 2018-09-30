"use strict";
const StateBase = require('./state-base');
const fbapi = require('../apis-wrappers/facebook-wrapper');
const googleMapsAPI = require('../apis-wrappers/google-maps-wrapper');
const async = require('async');
// not used anymore
const destinations = '30.016028528824,31.281080513131|30.058994493676,31.495870469939|30.019447169114,31.41886961354|30.061355409717,31.337732790839|30.068841718,31.343853591811|29.965534132187,31.27020549668|29.977578713313,31.282589255702|29.847125155169,31.331425576341|30.108302027387,31.344600587022|30.11795757556,31.35499280585|30.12578990646,31.377538113725|30.090844703212,31.319338201415|30.103677517418,31.314960836303|30.127293777458,31.350509493482|30.082830891416,31.281902610194|30.039193780201,31.234896897208|30.052459894895,31.243467225563|30.06893804975,31.245077221524|30.066797837932,31.204124583733|30.036141538848,31.197555183303|30.01050550363,31.204448460471|29.998508470763,31.15962204231|30.087117537614,31.217070936095|30.005228381525,30.972512482536|29.962512156714,30.930059819352|31.195349344127,29.899437098634|31.223734577029,29.939102946651|31.246033493085,29.974770962131|31.226921605488,29.95968890084|31.093135882071,29.762275635135|31.272025047783,30.003484009635|31.21315548702,29.937383650672|30.818994004022,29.030185459983|30.829266861851,28.971101759803|30.964167504313,28.753440498244|29.970297536303,32.550764500034|30.592538008937,32.268990396392|30.787532878333,30.98251980437|31.046372508411,31.380041285288|30.980846546035,31.175382031929|31.039283541285,30.469543977511|30.559449173366,31.009897782337|30.453990250853,31.177077858579|31.086041785963,31.598604439628|30.586122607365,31.498575477731|29.305244588449,30.843250795138|29.07312198337,31.102512447965|28.097013946334,30.755828886163|27.186320517875,31.193596913349|27.178929968699,31.184567927253|30.044725655448,30.044725655448|26.163031947214,32.718255041969|25.689879231481,32.640978588593|24.089475792876,32.894764511716|27.912273667848,34.32172988249|27.259659018331,33.806840299499|27.397015882722,33.674355267417';

class StateFindNearestStore extends StateBase {
  constructor(stateManager, localesManager) {
    super(...arguments);
    this.pause = true;
  }

  buildStoreElement(storeLocation) {
    return {
      "title": storeLocation.details.address,
      "subtitle": `Distance: ${storeLocation.distance.text}, Duration: ${storeLocation.duration.text}`,
      "image_url": `https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=${storeLocation.details.lat},${storeLocation.details.lng}&markers=${storeLocation.details.lat},${storeLocation.details.lng}&zoom=17`,
      "default_action": {
        "type": "web_url",
        "url": `http://google.com/maps?q=${storeLocation.details.lat},${storeLocation.details.lng}&z=17`
      },
      "buttons": [
        {
          "type": "web_url",
          "url": `http://google.com/maps?q=${storeLocation.details.lat},${storeLocation.details.lng}&z=17`,
          "title": "Get Directions"
        }
      ]
    };
  }

  constructReply(storeLocations) {
    const self = this;
    let storeLocationsElements = [];
    let storeLocationsMessage = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": storeLocationsElements,
        }
      }
    };

    let messages = [
      {text: self.localesManager.phrases.hereAreNearbyLocations},
      storeLocationsMessage
    ];
    storeLocations.forEach(storeLocation => {
      storeLocationsElements.push(self.buildStoreElement(storeLocation));
    });
    messages.push(this.getImageServicesMessage());
    return messages;
  }


  sendMessage(callback) {
    let self = this;
    let {user} = this.stateManager.data;
    let message = {
      text: self.localesManager.phrases.waitUntilILookUpLocations
    };
    fbapi.sendMessage(user.fbId, message, callback);
  }

  execute(callback) {
    let data = this.stateManager.data;
    let self = this;
    let {location} = data;
    async.series([
      seriesCallback => self.sendMessage(seriesCallback),
      seriesCallback => googleMapsAPI.getDistanceMatrix(location, destinations, self.localesManager.locale, (err, locations) => {
        self.storeLocations = (locations.length && locations.slice(0, 10)) || [];
        seriesCallback(null);
      }),
    ], err => {
      this.managePrompts(this.constructReply(self.storeLocations), callback);
    });
  }
}
module.exports = StateFindNearestStore;