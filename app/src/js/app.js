angular.module('app-base',[
    'ngRoute',
    'ngMaterial',
    'ngMessages',
    'templates-app-base',
    'app-base.menu',
    'app-container-common',
    'app-container-user'
])
.config(['$routeProvider','$httpProvider','$mdThemingProvider',function($routeProvider,$httpProvider,$mdThemingProvider){
    $routeProvider.when('/user-administration',{template:'<user-administration></user-administration>'});
    $routeProvider.when('/user-profile',{template:'<user-profile></user-profile>'});
    $routeProvider.otherwise({template:'<div class="solo-view"><section class="app-panel">'+
    '<md-toolbar class="md-toolbar-tools"><h2 flex md-truncate>Welcome</h2></md-toolbar>'+
    '<md-content>'+
    '<md-button class="md-primary">Primary</md-button>'+
    '<md-button class="md-accent">Accent</md-button>'+
    '<md-button class="md-warn">Warn</md-button>'+
    '<md-content></section></div>'});

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
