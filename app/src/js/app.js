angular.module('app-base',[
    'ngRoute',
    'ui.bootstrap',
    'templates-app-base',
    'app-base.menu',
    'app-container-common',
    'app-container-user',
    'app-container-geo',
    'geo-app.map'
])
.config(['$routeProvider','$httpProvider',function($routeProvider,$httpProvider){
    $routeProvider.when('/uadmin',{template:'<user-administration></user-administration>'});
    $routeProvider.when('/profile',{template:'<user-profile></user-profile>'});
    $routeProvider.when('/layer-admin',{template:'<layer-admin></layer-admin>'});
    $routeProvider.when('/find-feature',{template:'<div class="find-feature"></div>'});
    $routeProvider.when('/map',{template:'<the-map></the-map>'});
    $routeProvider.otherwise({template:'<the-map></the-map>'});

    if(typeof(csrfToken) !== 'undefined') {
        // the parent page must supply this global variable...
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = csrfToken;
    }
}]);
