/* globals requirejs */

requirejs.config({
  baseUrl: '/scripts',
  shim: {
    'bootstrap-affix': { 'deps': ['jquery'] },
    'bootstrap-alert': { 'deps': ['jquery'] },
    'bootstrap-button': { 'deps': ['jquery'] },
    'bootstrap-carousel': { 'deps': ['jquery'] },
    'bootstrap-collapse': { 'deps': ['jquery', 'bootstrap-transition'] },
    'bootstrap-dropdown': { 'deps': ['jquery'] },
    'bootstrap-modal': { 'deps': ['jquery'] },
    'bootstrap-popover': { 'deps': ['jquery', 'bootstrap-tooltip'] },
    'bootstrap-scrollspy': { 'deps': ['jquery'] },
    'bootstrap-tab': { 'deps': ['jquery'] },
    'bootstrap-tooltip': { 'deps': ['jquery'] },
    'bootstrap-transition': { 'deps': ['jquery'] },

    'bootstrap-hover-dropdown': { 'deps': ['jquery'] },
    'bootstrap-select': { 'deps': ['jquery'] },

    'flot': { 'deps': ['jquery'], 'exports': '$.plot' },
    'flot-resize': { 'deps': ['flot'] },
    'flot-categories': { 'deps': ['flot'] },
    'flot-pie': { 'deps': ['flot'] },
    'flot-stack': { 'deps': ['flot'] },
    'flot-crosshair': { 'deps': ['flot'] },
    // 'twbsPagination': { 'deps': ['jquery'], 'exports': '$.pagination' },
    'uniform': { 'deps': ['jquery'], 'exports': '$.uniform' },
},
  paths: {
    'jquery': 'lib/jquery/jquery',
    'moment': 'lib/moment/moment',

    // jQuery plugins
    'uniform': 'lib/jquery/plugins/uniform',
    'minicolors': 'lib/jquery/plugins/minicolors',
    'twbsPagination': 'lib/jquery/plugins/jquery.twbsPagination.min',
    'simplePagination': 'lib/jquery/plugins/jquery.simplePagination',

    // Metronic files
    'app': 'metronic/app',
    'layout': 'metronic/layout',

    'api': 'api',

    'components-bootstrap-select': 'metronic/components/components-bootstrap-select',
    'components-date-time-pickers': 'metronic/components/components-date-time-pickers',
    'components-color-pickers': 'metronic/components/components-color-pickers',

    //Bootstrap
    'bootstrap-affix': 'lib/bootstrap/affix',
    'bootstrap-alert': 'lib/bootstrap/alert',
    'bootstrap-button': 'lib/bootstrap/button',
    'bootstrap-carousel': 'lib/bootstrap/carousel',
    'bootstrap-collapse': 'lib/bootstrap/collapse',
    'bootstrap-dropdown': 'lib/bootstrap/dropdown',
    'bootstrap-modal': 'lib/bootstrap/modal',
    'bootstrap-popover': 'lib/bootstrap/popover',
    'bootstrap-scrollspy': 'lib/bootstrap/scrollspy',
    'bootstrap-tab': 'lib/bootstrap/tab',
    'bootstrap-tooltip': 'lib/bootstrap/tooltip',
    'bootstrap-transition': 'lib/bootstrap/transition',

    //Bootstrap addons
    'bootstrap-datepicker': 'lib/bootstrap-addons/datepicker',
    'bootstrap-daterangepicker': 'lib/bootstrap-addons/daterangepicker',
    'bootstrap-hover-dropdown': 'lib/bootstrap-addons/bootstrap-hover-dropdown',
    'bootstrap-select': 'lib/bootstrap-addons/bootstrap-select',

    //Flot
    'flot': 'lib/flot/jquery.flot',
    'flot-resize': 'lib/flot/jquery.flot.resize',
    'flot-categories': 'lib/flot/jquery.flot.categories',
    'flot-pie': 'lib/flot/jquery.flot.pie',
    'flot-stack': 'lib/flot/jquery.flot.stack',
    'flot-crosshair': 'lib/flot/jquery.flot.crosshair',
    'datatables': 'lib/data-tables/datatables.min',
    'bot-script': 'main',
    'ddtf': 'lib/ddtf/ddtf',
  }
});
