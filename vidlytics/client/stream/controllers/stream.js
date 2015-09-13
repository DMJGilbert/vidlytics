angular.module("vidlytics").controller("StreamCtrl", ['$scope', '$stateParams', '$rootScope', '$meteor', '$location', '$sce',
	function ($scope, $stateParams, $rootScope, $meteor, $location, $sce) {

		$scope.customer = $rootScope.currentUser;

		$scope.searchStreams = {};

		$meteor.subscribe('streams');
		$scope.streams = $meteor.collection(Streams);

		var query = Streams.find({});
		query.observeChanges({
			changed: function (id, fields) {
				$scope.drawGraphs();
			}
		});

		$scope.drawGraphs = function () {
			for (var i = 0; i < $scope.streams.length; i += 1) {
				if ($scope.streams[i]._id == $location.path().split("/")[2]) {
					$scope.stream = $scope.streams[i];
					stream = $scope.streams[i];

					$scope.streamLabels = ["180p", "280p", "400p", "480p", "720p", "1080p"];

					$scope.streamData = [
				[0, 0, 0, 0, 0, 0]
			];

					$scope.today = new Date();
					$scope.userLabels = [];

					$scope.today.setDate($scope.today.getDate() - 4);
					$scope.userLabels.push($scope.today.toLocaleDateString());

					$scope.today.setDate($scope.today.getDate() + 1);
					$scope.userLabels.push($scope.today.toLocaleDateString());

					$scope.today.setDate($scope.today.getDate() + 1);
					$scope.userLabels.push($scope.today.toLocaleDateString());

					$scope.today.setDate($scope.today.getDate() + 1);
					$scope.userLabels.push($scope.today.toLocaleDateString());

					$scope.userLabels.push("Today");

					$scope.userSeries = ['No. of users'];

					$scope.userData = [
				[0, 0, 0, 0, 0]
			];

					for (var j = 0; j < $scope.stream.viewers.length; j += 1) {
						for (var k = 0; k < $scope.stream.viewers[j].meta.length; k += 1) {
							if ($scope.stream.viewers[j].meta[k].currentLevel) {
								var level = $scope.stream.viewers[j].meta[k].currentLevel.split(" ")[0];
								$scope.streamData[0][level - 1] += 1;
							}
						}
					}

					for (var j = 0; j < $scope.stream.viewers.length; j += 1) {
						var date1 = new Date();
						var date2 = new Date($scope.stream.viewers[j].started);
						var timeDiff = Math.abs(date1.getTime() - date2.getTime());
						var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

						if (5 - diffDays > -1) {
							$scope.userData[0][5 - diffDays] += 1;
						} else {
							break;
						}
					}

					break;
				}
			}
		}

		$scope.trustSrc = function (url) {
			return $sce.trustAsResourceUrl(url);
		}

		$scope.logout = function () {
			Meteor.logout();
			$location.path('/');
		}

		$scope.removeStream = function () {
			for (var i = 0; i < $scope.streams.length; i += 1) {
				if ($scope.stream._id == $scope.streams[i]._id) {
					$scope.streams.splice(i, 1);
					$scope.stream = undefined;
					$location.path('/dashboard');
				}
			}
		};

		$scope.drawGraphs();

	}]);
