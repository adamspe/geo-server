angular.module('geo-app.map',[
    'uiGmapgoogle-maps'
])
.config(['uiGmapGoogleMapApiProvider',function(uiGmapGoogleMapApiProvider){
    uiGmapGoogleMapApiProvider.configure({
        //key: '',
        libraries: ['geometry','drawing']
    });
}])
.factory('InitMapService',['$location',function($location){
    var initFeatureId,
        service = {
            setInitFeatureId: function(fid) {
                initFeatureId = fid;
            },
            getInitFeatureId: function() {
                // one time deal;
                var id = initFeatureId;
                initFeatureId = undefined;
                return id;
            },
            goToFeature: function(id) {
                initFeatureId = id;
                $location.path('/map');
            }
        };
    return service;
}])
.directive('goToFeature',['InitMapService',function(InitMapService){
    return {
        restrict: 'E',
        template: '<a href ng-click="goToFeature(feature._id)"><span ng-if="label">{{label}} </span><i class="fa fa-map-o" aria-hidden="true"></i></a>',
        scope: {
            feature: '=',
            label: '@'
        },
        link: function($scope) {
            $scope.goToFeature = InitMapService.goToFeature;
        }
    };
}])
.controller('FindFeatureController',['$scope','$mdDialog','$typeAheadFinder','InitMapService','Layer','Feature',function($scope,$mdDialog,$typeAheadFinder,InitMapService,Layer,Feature){
    $scope.findLayer = $typeAheadFinder(Layer,function(s){
        return 'contains(name,\''+s+'\')';
    });
    $scope.findFeature = $typeAheadFinder(Feature,function(s){
        var filter = '';
        if($scope.selectedLayer) {
            filter += '_layer eq \''+$scope.selectedLayer._id+'\' and ';
        }
        filter += 'contains(featureName,\''+s+'\')';
        return {
            $filter: filter,
            $select: 'featureName'
        };
    });
    $scope.$watch('selectedLayer',function(layer){
        $scope.featureMinLength = layer ? 0 : 2;
    });
    $scope.cancel = $mdDialog.cancel;
    $scope.ok = function() {
        InitMapService.setInitFeatureId($scope.selectedFeature._id);
        $mdDialog.hide();
    };
}])
.directive('findFeature',['$mdDialog',function($mdDialog){
    return {
        restrict: 'E',
        template: '<md-button id="find-feature" class="md-raised md-icon-button" ng-click="find()"><md-tooltip md-direction="right">Find feature</md-tooltip></md-button>',
        scope: {},
        link: function($scope) {
            $scope.find = function() {
                $mdDialog.show({
                    templateUrl: 'js/map/find-feature.html',
                    controller: 'FindFeatureController'
                }).then(angular.noop,angular.noop);
            };
        }
    };
}])
.directive('theMap',['$log','uiGmapGoogleMapApi','uiGmapIsReady','InitMapService','MapLayerService','DialogService',function($log,uiGmapGoogleMapApi,uiGmapIsReady,InitMapService,MapLayerService,DialogService){
    return {
        restrict: 'E',
        template:'<div class="the-map"><ui-gmap-google-map ng-if="map" center="map.center" zoom="map.zoom" options="map.options" events="map.events">'+
        '<ui-gmap-marker ng-if="marker" coords="marker.coords" options="marker.options" events="marker.events" idkey="marker.id">'+
        '</ui-gmap-marker>'+
        '</ui-gmap-google-map>'+
        '<div class="feature-controls" ng-show="currentFeatures.length"></div><find-feature></find-feature></div>',
        scope: {},
        link: function($scope) {
            $('body').addClass('map');
            $scope.$on('$destroy',function(){
                $('body').removeClass('map');
            });
            var markerIndex = 0;
            uiGmapGoogleMapApi.then(function(google_maps){
                function layerSetter(map){
                    return function(layer) {
                        $scope.currentMapLayer = layer.map(map).add().fit();
                        $scope.currentFeatures = layer.features();
                    };
                }

                function reset() {
                    if($scope.currentMapLayer) {
                        $scope.currentMapLayer.remove();
                    }
                    delete $scope.currentMapLayer;
                    delete $scope.currentFeatures;
                    delete $scope.marker;
                }
                $scope.map = {
                    center: { latitude: 41.135760, longitude: -99.157679 },
                    zoom: 4,
                    options: {
                        scrollwheel: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        mapTypeId: google_maps.MapTypeId.HYBRID,
                        panControl: false,
                        zoomControl: true,
                        disableDoubleClickZoom: true,
                        zoomControlOptions: {
                            style: google_maps.ZoomControlStyle.SMALL,
                            position: google_maps.ControlPosition.RIGHT_TOP
                        }
                    },
                    events : {
                        dblclick: function(map,eventName,args) {
                            var latLng = args[0].latLng,
                                lat = latLng.lat(),
                                lng = latLng.lng(),i;
                            $log.debug('dblclick:['+lat+','+lng+']');
                            reset();
                            $scope.marker = {
                                id: markerIndex++,
                                coords: {
                                    latitude: lat,
                                    longitude: lng
                                },
                                events: {
                                    'click': function(/*marker,eventName,model,args*/) {
                                        $log.debug('marker click');
                                        //DialogService.buildConservationPlan($scope.currentMapLayer);
                                    }
                                }
                            };
                            $scope.featureProperties = [];
                            MapLayerService.getForPoint(lat,lng).then(layerSetter(map));
                        }
                    }
                };
                uiGmapIsReady.promise(1).then(function(instances){
                    var map = instances[0].map;
                    map.data.addListener('mouseover',function(event){
                        map.data.overrideStyle(event.feature, {strokeWeight: 3});
                    });
                    map.data.addListener('mouseout',function(event) {
                        map.data.revertStyle();
                    });
                    map.data.addListener('click',MapLayerService.featureClickProperties($scope,map));
                    $scope.$watch(function(){
                        return InitMapService.getInitFeatureId();
                    },function(fid){
                        if(fid) {
                            reset();
                            MapLayerService.getForFeature(fid).then(layerSetter(map));
                        }
                    });
                });
            });
        }
    };
}])
.filter('mapFeatureLabel',[function(){
    return function(item) {
        if(item) {
            return item.layerName()+' - '+item.name();
        }
    };
}])
.directive('featureControls',[function(){
    return {
        restrict: 'C',
        template:'<div layout="column">'+
        '<div layout="row" ng-repeat="f in currentFeatures">'+
        '<md-checkbox ng-model="f.$controlIsOn" ng-change="toggleFeature(f)">{{f | mapFeatureLabel}}</md-checkbox>'+
        ' <a class="fit-bounds" href ng-click="f.fit()"><i class="fa fa-arrows-alt" aria-hidden="true"></i></a>'+
        '</div>'+
        '</div>',
        link: function($scope) {
            $scope.$watch('currentFeatures',function(features) {
                (features||[]).forEach(function(f){
                    f.$controlIsOn = f.isOn();
                });
            });
            $scope.toggleFeature = function(f) {
                if(f) {
                    f.$controlIsOn = f.toggle();
                }
            };
        }
    };
}]);
