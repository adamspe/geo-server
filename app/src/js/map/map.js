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
.directive('findFeature',['$log','$typeAheadFinder','InitMapService','Layer','Feature',function($log,$typeAheadFinder,InitMapService,Layer,Feature){
    return {
        restrict: 'C',
        templateUrl: 'js/map/find-feature.html',
        scope: {},
        link: function($scope) {
            Layer.query({},function(response){
                $scope.layers = response.list;
            });
            $scope.findFeature = $typeAheadFinder(Feature,function(s){
                var filter = '';
                if($scope.selectedLayer) {
                    filter += '_layer eq \''+$scope.selectedLayer._id+'\' and ';
                }
                filter += 'contains(featureName,\''+s+'\')';
                return filter;
            });
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
        '<div class="feature-controls" ng-show="currentFeatures.length"></div></div>',
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
                            if($scope.currentMapLayer) {
                                $scope.currentMapLayer.remove();
                            }
                            delete $scope.currentMapLayer;
                            delete $scope.currentFeatures;
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
                    var fid = InitMapService.getInitFeatureId();
                    if(fid) {
                        MapLayerService.getForFeature(fid).then(layerSetter(map));
                    }
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
        template: '<ul class="list-unstyled">'+
        '<li ng-repeat="f in currentFeatures"><div class="checkbox"><label>'+
        '<input type="checkbox" ng-model="f.$controlIsOn" ng-change="toggleFeature(f)"/> '+
        '{{f | mapFeatureLabel}}'+
        '</label> <a href ng-click="f.fit()"><i class="fa fa-arrows-alt" aria-hidden="true"></i></a></div></li>'+
        '</ul>',
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
