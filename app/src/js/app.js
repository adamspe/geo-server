angular.module('app-base',[
    'ngRoute',
    'ui.bootstrap',
    'templates-app-base',
    'app-base.menu',
    'app-container-common',
    'app-container-user'
])
.config(['$routeProvider','$httpProvider',function($routeProvider,$httpProvider){

    $routeProvider.when('/uadmin',{template:'<user-administration></user-administration>'});
    $routeProvider.when('/profile',{template:'<user-profile></user-profile>'});
    $routeProvider.otherwise({template:'<h1>Welcome</h1>'});

    if(typeof(csrfToken) !== 'undefined') {
        // the parent page must supply this global variable...
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = csrfToken;
    }
}]);
