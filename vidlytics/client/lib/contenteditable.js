angular.module('vidlytics').directive("spaneditable", function () {
	return {
		restrict: "A",
		require: "ngModel",
		link: function (scope, element, attrs, ngModel) {
			var timeout;

			function specialCharacterEncode(str) {
				str = str.replace(/&/g, "&amp;");
				str = str.replace(/>/g, "&gt;");
				str = str.replace(/</g, "&lt;");
				str = str.replace(/"/g, "&quot;");
				str = str.replace(/'/g, "&#039;");
				return str;
			}

			ngModel.$render = function () {
				element.html(ngModel.$viewValue || "");
			};

			element.bind("dblclick", function () {
				if (element.find("input").length == 0 && $(element[0]).attr('disabled') !== 'disabled') {
					this.innerHTML = "<input type='text' value='" + specialCharacterEncode(ngModel.$viewValue || "") + "'/>";
					var strLength = element.find("input").val().length * 2;
					element.parent().addClass('highlightedCell');
					element.find("input").focus();
					element.find("input")[0].setSelectionRange(strLength, strLength);
					element.find("input").blur(function () {
						ngModel.$setViewValue(element.find("input").val());
						element.parent().removeClass('highlightedCell');
						element.html(ngModel.$viewValue || "");
						scope.$parent.update(scope);
					});
					element.find("input").bind("keydown", function () {
						if (event.keyCode == 13) {
							element.parent().removeClass('highlightedCell');
							ngModel.$setViewValue(element.find("input").val());
							element.html(ngModel.$viewValue || "");
							scope.$parent.update(scope);
						}
					});
				}
			});

			element.bind("touchend", function () {
				clearTimeout(timeout);
			});
		}
	};
});

angular.module('vidlytics').directive("numeditable", function () {
	return {
		restrict: "A",
		require: "ngModel",
		link: function (scope, element, attrs, ngModel) {


			ngModel.$render = function () {
				element.html(ngModel.$viewValue || "0");
			};

			element.bind("dblclick", function () {
				if (element.find("input").length == 0 && $(element[0]).attr('disabled') !== 'disabled') {
					this.innerHTML = "<input type='number' value='" + (ngModel.$viewValue || "") + "'/>";
					element.parent().addClass('highlightedCell');
					element.find("input").focus();
					element.find("input").blur(function () {
						element.parent().removeClass('highlightedCell');
						ngModel.$setViewValue(element.find("input").val());
						element.html(ngModel.$viewValue || "");
						scope.$parent.update(scope);
					});
					element.find("input").bind("keydown", function () {
						if (event.keyCode == 13) {
							element.parent().removeClass('highlightedCell')
							ngModel.$setViewValue(element.find("input").val());
							element.html(ngModel.$viewValue || "");
							scope.$parent.update(scope);
						}
					});
				}
			});

		}
	};
});

angular.module('vidlytics').directive("toggleeditable", function () {
	return {
		restrict: "A",
		require: 'ngModel',
		link: function (scope, element, attrs, ngModel) {
			var options = scope.$eval(attrs.ngOptions);

			function read() {
				ngModel.$setViewValue(element.html());
			}

			ngModel.$render = function () {
				element.parent().removeClass('highlightedCell');
				if (ngModel.$viewValue) {
					element.html("<i class='green fa fa-check'></i>");
				} else {
					element.html("<i class='red fa fa-close'></i>");
				}
			};

			element.bind("dblclick", function () {
				if (element.find("input").length == 0 && $(element[0]).attr('disabled') !== 'disabled') {
					var timer = setTimeout(function () {
						ngModel.$render();
					}, 1500);

					var dropdown = "<div class='ui toggle checkbox'><input";

					if (ngModel.$viewValue) {
						dropdown += " checked";
					}

					dropdown += " type='checkbox' name='admin'></div>";

					element.parent().addClass('highlightedCell');

					this.innerHTML = dropdown;

					element.find('.ui.checkbox').checkbox();

					element.find('input').blur(function () {

						if (element.find("input")[0]) {
							window.clearTimeout(timer);
							var input = element.find("input");
							var secondTimer = setTimeout(function () {
								ngModel.$setViewValue(input[0].checked);
								scope.$parent.update(scope);
								window.clearTimeout(secondTimer);
								ngModel.$render();
							}, 1000, input);
						}
					})
				}
			});
		}
	};
});

angular.module('vidlytics').directive("dropdowneditable", function () {
	return {
		restrict: "A",
		require: 'ngModel',
		link: function (scope, element, attrs, ngModel) {
			var options = scope.$eval(attrs.ngOptions);

			function read() {
				ngModel.$setViewValue(element.html());
			}

			ngModel.$render = function () {
				if (options) {
					for (var i = 0; i < options.length; i += 1) {
						if (options[i].value == ngModel.$viewValue) {
							element.html(options[i].title);
						}
					}
				}
			};

			element.bind("dblclick", function () {
				if (element.find("input").length == 0 && $(element[0]).attr('disabled') !== 'disabled') {
					var dropdown = "<div class='ui selection dropdown'><i class='dropdown icon'></i><div class='text'>" + element.text() + "</div><input type='hidden'><div class='menu'>";

					for (var i = 0; i < options.length; i += 1) {
						dropdown += "<div class='item' data-value='" + options[i].value + "'>" + options[i].title + "</div>";
					}

					dropdown += "</div></div>";

					element.parent().addClass('highlightedCell');

					this.innerHTML = dropdown;

					$(this).parent().addClass('dropdownCell');

					element.find('.ui.dropdown').dropdown();
					element.find('.ui.dropdown').dropdown('show');

					ngModel.$setViewValue(options[0].value);

					element.find('input').blur(function () {

						element.parent().removeClass('highlightedCell');

						$(element).parent().removeClass('dropdownCell');

						if (element.find("input").val()) {
							ngModel.$setViewValue(element.find("input").val());
							scope.$parent.update(scope);
						}

						ngModel.$render();
					})
				}
			});
		}
	};
});

angular.module('vidlytics').directive("channeleditable", function () {
	return {
		restrict: "A",
		require: 'ngModel',
		link: function (scope, element, attrs, ngModel) {
			function read() {
				ngModel.$setViewValue(element.html());
			}

			ngModel.$render = function () {
				element.html((ngModel.$viewValue || "0"));
			};

			element.bind("dblclick", function () {
				//				if (element.find("input").length == 0 && scope.$parent.isOnline(scope.device)) {
				var that = this;

				scope.getCorrectChannels(scope.$eval(attrs.ngDevice), function (data) {
					var channels = data.rows;

					var dropdown = "<div class='ui fluid search selection dropdown'><i class='dropdown icon'></i><input type='hidden'><div style='line-height: 15px;margin-left: -5px;' class='default text'>Channel...</div><div class='menu'>";

					if (channels.length) {
						for (var i = 0; i < channels.length; i += 1) {
							dropdown += "<div class='item' value='" + channels[i]._id + "'>" + channels[i].number + ' - ' + channels[i].name + "</div>";
						}
					} else {
						dropdown += "<div class='item'>No channels available</div>";
					}

					dropdown += "</div></div>";

					element.parent().addClass('highlightedCell');

					that.innerHTML = dropdown;

					$(that).parent().addClass('dropdownCell');
					element.find('.ui.dropdown').dropdown({
						fullTextSearch: true,
						match: 'text',
						forceSelection: true
					})
					element.find('.ui.dropdown').dropdown('show');

					$('.ui.fluid.search.selection .search').focus();

					element.find('input[type=hidden]').blur(function () {
						$(element).parent().removeClass('dropdownCell');

						element.parent().removeClass('highlightedCell');

						var selected = $(this).parent().find('.item.active.selected');
						if (channels.length && selected.attr('value') && scope.device._id) {
							scope.device.changeTo = selected.attr('value');
							scope.$parent.changeSelectedChannel(selected.attr('value'), [scope.device._id])
						}

						ngModel.$render();
					})

				});

				//				}
			});
		}
	};
});