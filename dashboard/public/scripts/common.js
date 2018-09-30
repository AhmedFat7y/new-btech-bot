/* globals requirejs */
var mutexE = false;

requirejs(['jquery', 'app', 'layout', 'api', 'bootstrap-hover-dropdown', 'bootstrap-dropdown', 'bootstrap-collapse', 'bot-script'], function ($, App, Layout, Api, bhd, bd, bc, Bot) {
    'use strict';
    // Generl layout stuff required by Metronic

    if(!mutexE) {
        mutexE = true;
        App.init();
        Layout.init();
        Api.init();
        Bot.init();
    }
});