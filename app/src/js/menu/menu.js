angular.module('app-base.menu',[
])
.directive('mainMenu',['User',function(User){
    return {
        restrict: 'E',
        templateUrl: 'js/menu/menu.html',
        link: function($scope,$element,$attrs) {
            $scope.me = User.me();
        }
    };
}])
.directive('mapMenu',['$log','$location',function($log,$location){
    return {
        restrict: 'E',
        template: '<ul class="nav navbar-nav">'+
        '<li ng-class="{active: active === \'/find-feature\'}"><a href="#/find-feature">Find feature</a></li>'+
        '</ul>',
        scope: {},
        link: function($scope) {
            $scope.$on('$locationChangeSuccess',function(event,url){
                $scope.active = $location.path();
            });
        }
    };
}]);
