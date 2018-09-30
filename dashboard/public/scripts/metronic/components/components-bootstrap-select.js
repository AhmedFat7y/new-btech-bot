define(['jquery', 'bootstrap-select'], function ($) {
  'use strict';

  var ComponentsBootstrapSelect = function () {
    var handleBootstrapSelect = function () {
      $('.bs-select').selectpicker({
        iconBase: 'fa',
        tickIcon: 'fa-check'
      });
    };
    return {
      //main function to initiate the module
      init: function () {
        handleBootstrapSelect();
      }
    };
  }();
  return ComponentsBootstrapSelect;
});
