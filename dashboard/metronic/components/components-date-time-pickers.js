define([
  'jquery',
  'app',
  'moment',
  'bootstrap-datepicker',
  'bootstrap-datetimepicker'], function ($, App, moment, datepicker) {

    var ComponentsDateTimePickers = function () {
        var handleDatePickers = function () {
            $('.date-picker').datepicker({
                rtl: App.isRTL(),
                orientation: 'left',
                autoclose: true
            });
        };

        var handleDatetimePicker = function () {

            $('.form_datetime').datetimepicker({
                autoclose: true,
                bootcssVer: 3,
                // isRTL: App.isRTL(),
                format: 'dd MM yyyy - hh:ii'
            });

            $('.form_advance_datetime').datetimepicker({
                isRTL: App.isRTL(),
                format: 'dd MM yyyy - hh:ii',
                autoclose: true,
                todayBtn: true,
                startDate: '2013-02-14 10:00',
                pickerPosition: App.isRTL() ? 'bottom-right' : 'bottom-left',
                minuteStep: 10
            });

            $('.form_meridian_datetime').datetimepicker({
                isRTL: App.isRTL(),
                format: 'dd MM yyyy - HH:ii P',
                showMeridian: true,
                autoclose: true,
                pickerPosition: App.isRTL() ? 'bottom-right' : 'bottom-left',
                todayBtn: true
            });

            $('body').removeClass('modal-open'); // fix bug when inline picker is used in modal

            $('#opening-time').datetimepicker({
              pickDate: false,
              format: 'hh:mm:ss'
            });

        };

        var handleClockfaceTimePickers = function () {

            $('.clockface_1').clockface();

            $('#clockface_2').clockface({
                format: 'HH:mm',
                trigger: 'manual'
            });

            $('#clockface_2_toggle').click(function (e) {
                e.stopPropagation();
                $('#clockface_2').clockface('toggle');
            });

            $('#clockface_2_modal').clockface({
                format: 'HH:mm',
                trigger: 'manual'
            });

            $('#clockface_2_modal_toggle').click(function (e) {
                e.stopPropagation();
                $('#clockface_2_modal').clockface('toggle');
            });

            $('.clockface_3').clockface({
                format: 'H:mm'
            }).clockface('show', '14:30');

        };

        return {
            //main function to initiate the module
            init: function () {
                handleDatePickers();
                handleDatetimePicker();
               // handleClockfaceTimePickers();
            }
        };
    }();
    return ComponentsDateTimePickers;
});
