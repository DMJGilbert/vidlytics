angular.module("vidlytics").controller("DashboardCtrl", ['$scope', '$stateParams', '$rootScope', '$meteor', '$location',
	function ($scope, $stateParams, $rootScope, $meteor, $location) {

		$scope.customer = $rootScope.currentUser;

		$meteor.subscribe('streams');
		$scope.streams = $meteor.collection(Streams);

		$scope.logout = function (){
			Meteor.logout();
			$location.path('/');
		}

		$scope.showAddStream = function () {
			$('#addStreamModal').modal('show');
		}

		$scope.selectStream = function (stream) {
			$scope.selectedStream = stream;

			$scope.streamLabels = ["180p", "280p", "400p", "480p", "720p", "1080p"];
			$scope.streamData = [
				[65, 59, 90, 81, 56, 55]
			];

			$scope.userLabels = ["January", "February", "March", "April", "May", "June", "July"];
			$scope.userSeries = ['No. of Users'];
			$scope.userData = [
				[0, 0, 1, 2, 2, 3, 5]
			];
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
