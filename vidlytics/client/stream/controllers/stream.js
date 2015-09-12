angular.module("vidlytics").controller("StreamCtrl", ['$scope', '$stateParams', '$rootScope', '$meteor', '$location', '$sce',
	function ($scope, $stateParams, $rootScope, $meteor, $location, $sce) {

		$scope.customer = $rootScope.currentUser;

		$scope.searchStreams = {};

		$meteor.subscribe('streams');
		$scope.streams = $meteor.collection(Streams);

		for (var i = 0; i < $scope.streams.length; i += 1) {
			if ($scope.streams[i]._id == $location.path().split("/")[2]) {
				$scope.stream = $scope.streams[i];
				stream = $scope.streams[i];
				break;
			}
		}

		$scope.trustSrc = function (url) {
			return $sce.trustAsResourceUrl(url);
		}

		$scope.logout = function () {
			Meteor.logout();
			$location.path('/');
		}

		$scope.streamLabels = ["180p", "280p", "400p", "480p", "720p", "1080p"];
		$scope.streamData = [
				[65, 59, 90, 81, 56, 55]
			];

		$scope.userLabels = ["January", "February", "March", "April", "May", "June", "July"];
		$scope.userSeries = ['No. of Users'];
		$scope.userData = [
				[0, 0, 1, 2, 2, 3, 5]
			];

		$scope.removeStream = function () {
			for (var i = 0; i < $scope.streams.length; i += 1) {
				if ($scope.stream._id == $scope.streams[i]._id) {
					$scope.streams.splice(i, 1);
					$scope.stream = undefined;
					$location.path('/dashboard');
				}
			}
		};

	}]);
