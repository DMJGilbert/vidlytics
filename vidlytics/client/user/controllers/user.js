angular.module("vidlytics").controller("UserCtrl", ['$scope', '$stateParams', '$rootScope', '$meteor', '$location', '$sce',
	function ($scope, $stateParams, $rootScope, $meteor, $location, $sce) {

		$scope.customer = $rootScope.currentUser;

		$scope.searchStreams = {};

		$meteor.subscribe('streams');
		$scope.streams = $meteor.collection(Streams);

		for (var i = 0; i < $scope.streams.length; i += 1) {
			if ($scope.streams[i]._id == $location.path().split("/")[2]) {
				$scope.stream = $scope.streams[i];
				for (var j = 0; j < $scope.stream.users.length; j += 1) {
					if ($scope.stream.users[j]._id == $location.path().split("/")[4]) {
						$scope.user = $scope.stream.users[j];
					}
				}
			}
		}

		$scope.logout = function () {
			Meteor.logout();
			$location.path('/');
		}

	}]);
