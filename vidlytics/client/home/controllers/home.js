angular.module("vidlytics").controller("HomeCtrl", ['$scope', '$stateParams', '$location',
	function ($scope, $stateParams, $location) {
		if (Meteor.user()) {
			$location.path('/customer');
		} else {

		}
	}]);
