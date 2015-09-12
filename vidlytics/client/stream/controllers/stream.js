angular.module("vidlytics").controller("StreamCtrl", ['$scope', '$stateParams', '$rootScope', '$meteor', '$location',
	function ($scope, $stateParams, $rootScope, $meteor, $location) {

		$scope.customer = $rootScope.currentUser;

		$scope.searchStreams = {};

		$meteor.subscribe('streams');
		$scope.streams = $meteor.collection(Streams);

		$scope.logout = function () {
			Meteor.logout();
			$location.path('/');
		}

		function initMap() {
			var map = new google.maps.Map(document.getElementById('map'), {
				zoom: 4,
				center: {
					lat: -33,
					lng: 151
				},
				disableDefaultUI: true
			});
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

	}]);
