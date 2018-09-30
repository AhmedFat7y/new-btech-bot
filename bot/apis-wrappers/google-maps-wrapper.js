"use strict";
const request = require('request');
const {GOOGLE_MAPS_AUTHENTICATION} = require('../../config');
const addresses = require('../resources/addresses');
const destinations = addresses.map(destination => destination.lat + ',' + destination.lng).join('|');


class GoogleMapsAPI {
  constructor() {
    this.distanceMatrixKey = GOOGLE_MAPS_AUTHENTICATION.DISTANCE_MATRIX_API_KEY;
    this.geocodingKey = GOOGLE_MAPS_AUTHENTICATION.GEOCODING_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
    this.apis = this.constructRequestBase();
  }

  constructRequestBase() {
    let self = this;
    return request.defaults({
      baseURL: self.baseUrl,
    });
  }

  getCoordinatesFromAddress(addressText, callback) {
    this.apis.get(`${this.baseUrl}/geocode/json`, {
      qs: {
        address: addressText,
        key: this.geocodingKey,
        region: 'eg'
      }
    }, (err, res, body) => {
      let {results, status} = JSON.parse(body);
      if (results.length === 0) {
        callback(null, null);
      }
      let place1 = results[0];
      callback(null, place1.geometry.location);
    });
  }

  // outputs [‌{"distance":{"text":"4.6 km","value":4559},"duration":{"text":"10 mins","value":611},"status":"OK","address":"Banks Center St, Cairo Governorate, Egypt"}]
  getDistanceMatrix(coordinates, _destinations, locale, callback) {
    let self = this;
    this.apis.get(`${this.baseUrl}/distancematrix/json`, {
      qs: {
        key: self.distanceMatrixKey,
        language: locale,
        units: 'metric',
        origins: coordinates.data,
        destinations: destinations,
      }
    }, (err, res, body) => {
      let {destination_addresses, origin_addresses, rows, status} = JSON.parse(body);
      let locations = rows[0].elements;
      locations.forEach((loc, index) => {
        loc.details = addresses[index];
      });
      locations.sort((a, b) => {
        let valueA = a.distance.value, valueB = b.distance.value;
        return (valueA > valueB) ? 1 : valueA < valueB ? -1 : 0;
      });
      callback(null, locations);
    });
  }
}

let googleMapsAPI = new GoogleMapsAPI();
module.exports = googleMapsAPI;