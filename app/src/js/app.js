angular.module('app-base',[
    'ngRoute',
    'ngMaterial',
    'ngMessages',
    'templates-app-base',
    'app-base.menu',
    'app-container-common',
    'app-container-user',
    'app-container-geo',
    'geo-app.map'
])
.config(['$routeProvider','$httpProvider','$mdThemingProvider',function($routeProvider,$httpProvider,$mdThemingProvider){
    $routeProvider.when('/user-administration',{template:'<user-administration></user-administration>'});
    $routeProvider.when('/user-profile',{template:'<user-profile></user-profile>'});
    $routeProvider.when('/layer-admin',{template:'<layer-admin></layer-admin>'});
    $routeProvider.when('/find-feature',{template:'<div class="find-feature"></div>'});
    $routeProvider.when('/map',{template:'<the-map></the-map>'});
    $routeProvider.otherwise({template:'<the-map></the-map>'});

    if(typeof(csrfToken) !== 'undefined') {
        // the parent page must supply this global variable...
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = csrfToken;
    }
    $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('amber')
      .warnPalette('orange');
}])
.directive('showToast',['$mdToast',function($mdToast){
    return {
        restrict: 'E',
        link: function($scope,$elm,$attrs){
            if($attrs.toast){
                $mdToast.show(
                    $mdToast.simple().textContent($attrs.toast).theme($attrs.toastTheme||'default').position($attrs.toastPosition||'top right')
                );
            }
        }
    };
}]);
