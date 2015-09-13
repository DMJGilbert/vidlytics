angular.module("vidlytics").controller("UserCtrl", ['$scope', '$stateParams', '$rootScope', '$meteor', '$location', '$sce',
	function ($scope, $stateParams, $rootScope, $meteor, $location, $sce) {

		$scope.customer = $rootScope.currentUser;

		$scope.searchStreams = {};

		$meteor.subscribe('streams');
		$scope.streams = $meteor.collection(Streams);

		for (var i = 0; i < $scope.streams.length; i += 1) {
			if ($scope.streams[i]._id == $location.path().split("/")[2]) {
				$scope.stream = $scope.streams[i];
				for (var j = 0; j < $scope.stream.viewers.length; j += 1) {
					if ($scope.stream.viewers[j].ident == $location.path().split("/")[4]) {
						$scope.user = $scope.stream.viewers[j];
						$scope.user.event = $scope.user.event.reverse();
					}
				}
			}
		}

		var maxTimestamp = 0;
		var minTimestamp = null;
		for (var i=0; i<$scope.user.event.length ; i++) {
			if ($scope.user.event[i].timestamp > maxTimestamp) {
				maxTimestamp = $scope.user.event[i].timestamp;
			}
			if (!minTimestamp) {
				minTimestamp = $scope.user.event[i].timestamp;
			}
			else if (minTimestamp > $scope.user.event[i].timestamp) {
				minTimestamp = $scope.user.event[i].timestamp;
			}
		}

		for (var i=0; i<$scope.user.event.length ; i++) {
			var event = $scope.user.event[i];
			var left = (event.timestamp-minTimestamp)/(maxTimestamp-minTimestamp)*1550 + 'px';
			$scope.user.event[i].styleText = {left: left, position: "absolute"};
		}

		$scope.convertDate = function (date) {
			var d = new Date(date);
			return d.toLocaleString();
		}

		$scope.messageContains = function (message, term) {
			if (message.indexOf(term) > -1) {
				return true;
			}
			return false;
		}

		$scope.logout = function () {
			Meteor.logout();
			$location.path('/');
		}



	}]);
