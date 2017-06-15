angular.module('app-base.menu',[
])
.directive('mainMenu',['$mdSidenav','User',function($mdSidenav,User){
    return {
        restrict: 'E',
        templateUrl: 'js/menu/menu.html',
        link: function($scope,$element,$attrs) {
            $scope.appTitle = $attrs.appTitle;
            $scope.toggle = function() { $mdSidenav('main-side-nav').toggle(); };
            $scope.me = User.me();
            $scope.$on('$locationChangeSuccess',function(){
                $mdSidenav('main-side-nav').close();
            });
        }
    };
}])
.directive('mapMenu',['$log','$location',function($log,$location){
    return {
        restrict: 'E',
        template: '<md-list-item><md-button class="md-primary" href="#!/layer-admin">Layer Admin</md-button></md-list-item>',
        scope: {},
        link: function($scope) {
            $scope.$on('$locationChangeSuccess',function(event,url){
                $scope.active = $location.path();
            });
        }
    };
}]);
