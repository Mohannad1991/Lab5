var ase = angular.module('ASE', ['ngRoute']);



ase.controller('loginController', function($scope, $window) {


    window.fbAsyncInit = function() {
        FB.init({
            appId      : '963901706990605',
            xfbml      : true,
            version    : 'v2.5'
        });
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                document.getElementById('status').innerHTML = 'We are connected.';
                document.getElementById('login').style.visibility = 'hidden';
                $window.location.href = "#/home";
            } else if (response.status === 'not_authorized') {
                document.getElementById('status').innerHTML = 'We are not logged in.'
            } else {
                document.getElementById('status').innerHTML = 'You are not logged into Facebook.';
            }
        });

        // login with facebook with extra permissions

    };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    $scope.login =function() {
        FB.login(function(response) {
            if (response.status === 'connected') {
                document.getElementById('status').innerHTML = 'We are connected.';
                document.getElementById('login').style.visibility = 'hidden';

                $window.location.href = "#/home";
            } else if (response.status === 'not_authorized') {
                document.getElementById('status').innerHTML = 'We are not logged in.'
            } else {
                document.getElementById('status').innerHTML = 'Connect with Facebook to continue';
            }
        }, {scope: 'email'});
    }

    $scope.getInfo = function() {
        FB.api('/me', 'GET', {fields: 'first_name,last_name,name,id'}, function(response) {


        });
    }
});

ase.controller('homeController', function($scope, syncfactory) {
        var jsonData;
        var lat= 0, lng=0;

        $scope.GetPlaces = function(place){

            var place = document.getElementById('input_place').value;
            syncfactory.getData(place)
                .then(function(data){
                    var jsonData = data;
                    var temp1 = jsonData.meta.requestId;
                    lat = jsonData.response.geocode.feature.geometry.center.lat;
                    lng = jsonData.response.geocode.feature.geometry.center.lng;
                    var mapOptions = {
                        zoom: 10,
                        center: new google.maps.LatLng(lat, lng),
                        mapTypeId: google.maps.MapTypeId.TERRAIN
                    }
                    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
                    for (i = 0; i < jsonData.response.venues.length; i++){
                        createMarker(jsonData.response.venues[i])
                    }
                });

            $scope.markers = [];

            var infoWindow = new google.maps.InfoWindow();

            var createMarker = function (info){

                var marker = new google.maps.Marker({
                    map: $scope.map,
                    position: new google.maps.LatLng(info.location.lat, info.location.lng),
                    title: info.name
                });
                marker.content = '<div class="infoWindowContent">' + info.location.address  + '</div>';

                google.maps.event.addListener(marker, 'click', function(){
                    infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                    infoWindow.open($scope.map, marker);
                });

                $scope.markers.push(marker);

            }



            $scope.openInfoWindow = function(e, selectedMarker){
                e.preventDefault();
                google.maps.event.trigger(selectedMarker, 'click');
            }



        }

    })
    .factory('syncfactory', function($http, $log, $q){
        return{
            getData: function(place){
                var deferred = $q.defer();
                $http.get("https://api.foursquare.com/v2/venues/search?near=" + place + "&categoryId=4bf58dd8d48988d17f941735&client_id=CA1CJQMHJQ1I3X4S1RM1021QJMGBPZZGIAKJC0RSYQSD4BUD&client_secret=X2VKR3PKKX0WLLQYM0AQJLFFFTHLR2I3WTZABTHPVZJNKJP2&v=20160222")
                    .success(function (data){
                        deferred.resolve(data);
                    })
                    .error(function (msg, code){
                        deferred.reject(msg);
                        $log.error(msg, code);
                    });
                return deferred.promise;

            }
        }
    })

ase.config(function($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl : 'login.html',
            controller  : 'loginController'
        })
        .when('/home', {
            templateUrl : 'home.html',
            controller  : 'homeController'
        })



});
