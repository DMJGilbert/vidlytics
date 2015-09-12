angular.module("vidlytics").controller("LoginCtrl", ['$scope', '$rootScope', '$stateParams', '$location',
	function ($scope, $rootScope, $stateParams, $location) {

		$scope.email = '';
		$scope.password = '';

		if (Meteor.user()) {
			$location.path('/customer');
		} else {

			$scope.login = function () {
				event.preventDefault();
				Meteor.loginWithPassword($scope.email, $scope.password, function (err) {
					if (err) {
						return false;
					} else {
						$location.path('/dashboard');
						return true;
					}
				});
				return false;
			}

			$scope.registerUser = function () {
				event.preventDefault();
				console.log($scope.password);
				Accounts.createUser({
					email: $scope.email,
					password: $scope.password
				}, function (err) {
					if (err) {
						console.log(err)
						return false;
					} else {
						$scope.register = false;
						return false;
					}
				});
				return false;
			}
		}
	}]);
