angular.module("vidlytics").controller("CustomerCtrl", ['$scope', '$stateParams', '$rootScope', '$meteor',
	function ($scope, $stateParams, $rootScope, $meteor) {

		$scope.customer = $rootScope.currentUser;

		$meteor.subscribe('streams');
		$scope.streams = $meteor.collection(Streams);

		$scope.showAddStream = function () {
			$('#addStreamModal').modal('show');
		}

		$scope.addStream = function () {
			$scope.streams.push($scope.newStream);

			Meteor.call('addStream', {
				customerId: $scope.customer._id,
				name: $scope.newStream.name,
				address: $scope.newStream.address
			}, function (error, data) {
				if (data == 'success') {
					$scope.newStream = '';
				}
			});
		};

		$scope.removeStream = function (stream) {
			$scope.streams.splice($scope.streams.indexOf(stream), 1);
		};

	}]);
