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
}]);
