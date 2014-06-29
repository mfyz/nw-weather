document.addEventListener('deviceready', function(){
	console.log('Device Ready!');
});

weatherApp = angular.module('WeatherApp', ['ngRoute', 'ngTouch', 'LocalStorageModule']);

weatherApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/weather', {
			templateUrl: 'views/weather.html',
			controller:  'WeatherController'
		}).
		otherwise({
			redirectTo: '/weather'
		});
}]);

weatherApp.controller('WeatherController', ['$scope', '$http', 'localStorageService', '$timeout',
function($scope, $http, storage, $timeout){
	$scope.ready = false;
	$scope.model = {
		show_settings: false,
		metric: (storage.get('metric') ? storage.get('metric') : 'C')
	};
	$scope.location_lat = storage.get('location_lat');
	$scope.location_lon = storage.get('location_lon');
	$scope.location_name = storage.get('location_name');

	$scope.getWeather = function(){
		apiUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + $scope.location_lat + '&lon=' + $scope.location_lon;

		$http({
			url: apiUrl,
			method: 'GET'
		}).success(function(data, status, headers, config) {
			console.log(data);

			$scope.ready = true;
			$scope.fahrenheit = parseInt((data.main.temp - 273.15) * 1.8 + 32);
			$scope.celsius = parseInt(data.main.temp - 273.15);
			$scope.weather = data.weather[0];
			$scope.location_name = data.name;
			storage.set('location_name', data.name);
			$scope.icon = $scope.translateIcon($scope.weather.icon);
		});
	};

	$scope.refreshWeather = function(){
		$scope.ready = false;
		$timeout(function(){
			$scope.getWeather();
		}, 300);
	};

	$scope.translateIcon = function(icon){
		switch (icon) {
			case '01d': return 'sun'; break;
			case '01n': return 'moon'; break;
			case '02d': return 'cloudSun'; break;
			case '02n': return 'cloudMoon'; break;
			case '03d': return 'cloud'; break;
			case '03n': return 'cloud'; break;
			case '04d': return 'cloudFill'; break;
			case '04n': return 'cloudFill'; break;
			case '09d': return 'cloudDrizzleSunAlt'; break;
			case '09n': return 'cloudDrizzleMoonAlt'; break;
			case '10d': return 'cloudRainSun'; break;
			case '10n': return 'cloudRainMoon'; break;
			case '11d': return 'cloudLightning'; break;
			case '11n': return 'cloudLightningMoon'; break;
			case '13d': return 'cloudSnowSunAlt'; break;
			case '13n': return 'cloudSnowMoonAlt'; break;
			case '50d': return 'cloudFogSun'; break;
			case '50n': return 'cloudFogMoon'; break;
			default: return 'thermometer50';
		}
	};

	$scope.set_location = function(){
		$scope.ready = false;
		$scope.model.show_settings = false;

		navigator.geolocation.getCurrentPosition(
			function(position) {
				$scope.location_lat = position.coords.latitude;
				$scope.location_lon = position.coords.longitude;
				//alert(position.coords.latitude + ' - ' + position.coords.longitude);
				storage.set('location_lat', position.coords.latitude);
				storage.get('location_lon', position.coords.longitude);
				$scope.model.show_settings = false;
				$scope.refreshWeather();
			},
			function() {
				navigator.notification.alert('Error detecting your location!', null, 'Close');
			});
	};

	$scope.set_metric = function(type){
		$scope.model.metric = type;
		storage.set('metric', type);
		$scope.model.show_settings = false;
	};

	$scope.getWeather();
}]);