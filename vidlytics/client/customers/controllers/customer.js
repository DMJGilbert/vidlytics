angular.module("vidlytics").controller("CustomerCtrl", ['$scope', '$stateParams', '$rootScope', '$meteor',
	function ($scope, $stateParams, $rootScope, $meteor) {

		$scope.customer = $rootScope.currentUser;

		$meteor.subscribe('streams');
		$scope.streams = $meteor.collection(Streams);

		$scope.showAddStream = function () {
			$('#addStreamModal').modal('show');
		}

		$scope.selectStream = function (stream) {
			$scope.selectedStream = stream;

			$scope.streamLabels = ["180p", "280p", "400p", "480p", "720p", "1080p"];
			$scope.streamData = [
				[65, 59, 90, 81, 56, 55]
			];

			$scope.userLabels = ["AWS", "Akami"];
			$scope.userData = [3, 5];
		}

		$scope.addStream = function () {
			Streams.insert({
				customerId: $scope.customer._id,
				name: $scope.newStream.name,
				address: $scope.newStream.address
			}, function (er, _id) {
				if (_id) {
					$scope.newStream = {};
				}
			});
		};

		$scope.removeStream = function () {
			for (var i = 0; i < $scope.streams.length; i += 1) {
				if ($scope.selectedStream._id == $scope.streams[i]._id) {
					$scope.streams.splice(i, 1);
					$scope.selectedStream = undefined;
				}
			}
		};

	}]);
