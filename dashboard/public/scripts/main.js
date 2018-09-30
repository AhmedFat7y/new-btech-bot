/* globals define, filters */
'use strict';
define(['jquery', 'bootstrap-modal', 'bootstrap-select', 'uniform', 'moment', 'bootstrap-daterangepicker', 'twbsPagination', 'simplePagination'], function ($, modal, bootstrapSelect, uniform, moment, bootstrapDateRangePicker, twbsPagination, simplePagination) {
  // filters = filters || {};
  function applyFilters() {
    var url = window.location.href;
    url = url.split('#')[0];
    window.location = url.split('?')[0] + '?' + $.param(filters);
  }
  
  function resetFilters() {
    window.location = window.location.href.split('?')[0];
  }

  function datePickerApply(startDate, endDate) {
    //console.log('Start', startDate, ', End', endDate);
    $('.date').val(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
    filters.start = startDate.toISOString();
    filters.end = endDate.toISOString();
    applyFilters();
  }

  function start() {
    $('#pagination').twbsPagination({
      //itemOnPage: 30,
      currentPage: 1,
      totalPages: pagesCount,
      visiblePages: 10,
      startPage: filters.pageNumber || 1,
      cssStyle: '',
      initiateStartPageClick: false,
      prevText: '<span aria-hidden="true">&laquo;</span>',
      nextText: '<span aria-hidden="true">&raquo;</span>',
      onPageClick: function (ev, pageNumber) {
        filters.pageNumber = pageNumber;
        applyFilters();
      }
    });

    $('.show-group-form').click(function (e) {
      $('#create-group-col').hide();
      $('#make-group').show();
    });
    
    var $groupForm = $('#make-group form');
    var $createButton = $('.create-group');
    $createButton.click(function (e) {
      $createButton.prop('disabled', true);
      $groupForm.find('[name="filters"]').val(JSON.stringify(filters));
      $groupForm.submit();
    });

    $('.reset-filters').click(function (ev) {
      resetFilters();
    });

    var $filtersForm = $('#form1');
    if (filters.gender)  {
      $filtersForm.find('#gender').val(filters.gender);
    }
    if (filters.category) {
      $filtersForm.find('#interests').val(filters.category);
    }
    if (filters.group) {
      $filtersForm.find('#group-name').val(filters.group);
    }
    $filtersForm.submit(function (e) {
      e.preventDefault();
      var url = window.location.href;
      var gender = $('#gender').val();
      var category = $('#interests').val();
      var group = $('#group-name').val();
      if (gender) {
        filters.gender = gender;
      }
      if (category) {
        filters.category = category;
      }
      if (group) {
        filters.group = group;
      }
      applyFilters();
    });
    $('#report-daterange').daterangepicker({
      startDate: filters.start,
      endDate: filters.end,
      ranges: {
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    }, datePickerApply);
    
    var $convoDetails = $('.convo-details');
    if ($convoDetails.length) {
      $convoDetails.scrollTop($convoDetails[0].scrollHeight);
    }

    var globalSwitchMutex = false;
    $('.global-switch-btn').click(function(ev){
      globalSwitchMutex = true;
      ev.preventDefault();
      var self = $(ev.target);
      self.prop('disabled', true);
      self.addClass('loading');
      $.post('/dashboard/global-switch')
        .always(function(data, status) {
          self.removeClass('loading');
          self.prop('disabled', false);
          if (status === "error") {
            return 
          }
          if (data.globalSwitch === 'on') {
            self.addClass('active');
            self.html('Turn OFF The Bot');
          } else {
            self.removeClass('active');
            self.html('Turn ON The Bot');
          }
          globalSwitchMutex = false;
        });
    });
  }
  return {
    init() {
      start();
    }
  };
});