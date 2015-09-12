angular.module("vidlytics").run(["$rootScope", "$state", function ($rootScope, $state) {
	$rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
		// We can catch the error thrown when the $requireUser promise is rejected
		// and redirect the user back to the main page
		if (error === "AUTH_REQUIRED") {
			$state.go('parties');
		}
	});
}]);

angular.module('vidlytics').config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
	function ($urlRouterProvider, $stateProvider, $locationProvider) {

		$locationProvider.html5Mode(true);

		$stateProvider
			.state('index', {
				url: '/',
				templateUrl: 'client/home/views/index.ng.html',
				controller: 'HomeCtrl'
			})
			.state('login', {
				url: '/login',
				templateUrl: 'client/login/views/index.ng.html',
				controller: 'LoginCtrl'
			})
			.state('customer', {
				url: '/customer',
				templateUrl: 'client/customers/views/index.ng.html',
				controller: 'CustomerCtrl',
				resolve: {
					"currentUser": ["$meteor", function ($meteor) {
						return $meteor.requireUser();
          			}]
				}
			});

		$urlRouterProvider.otherwise('/');

	}]);
