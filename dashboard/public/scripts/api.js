/* globals define */
define(['jquery', 'bootstrap-modal', 'bootstrap-select', 'uniform'], function ($) {
  'use strict';
  /**
  Core script to handle the entire theme and core functions
  **/

  var Api = function () {

    var API = {};

    API['update-status'] = function (el) {
      var id = $(el).data('id');
      var status = $(el).closest('tr').find('.status').text();
      var $modal = $('#update-status');
      $modal.find('.order-number').text(id);
      $modal.find('.order-status').text(status);
      $modal.modal('show');
    };

    API['view-details'] = function () {
      // Ajax requesst to get full order details
      var $modal = $('#view-details');
      $modal.modal('show');
    };

    API['reset-form'] = function (el) {
      var $form = $(el).closest('form');
      $form.find('input').each(function () {
        $(this).val('');
      });
      $form.find('input[type="checkbox"]').each(function () {
        $(this).prop('checked', false);
      });
      $.uniform.update($form.find('input[type="checkbox"]'));
      $form.find('select').each(function () {
        $(this).val('');
      });
      $form.find('.bs-select').each(function () {
        $(this).selectpicker('refresh');
      });
    };

    var handleInit = function () {
      $(document).on('click', '[data-action]', function (ev) {
        ev.preventDefault();
        var action = $(this).data('action');
        API[action](this);
      });
    };

    return {

      init: function () {
        handleInit();
      }

    };
  }();
  return Api;
});
