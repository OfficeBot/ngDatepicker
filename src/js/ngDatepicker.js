angular.module('jkuri.datepicker', [])

.directive('ngDatepicker', ['$document', function($document) {
	'use strict';

	var setScopeValues = function (scope, attrs) {
		scope.format = attrs.format || 'MM/DD/YYYY';
		scope.viewFormat = attrs.viewFormat || 'MM/DD/YYYY';
		scope.locale = attrs.locale || 'en';
		scope.firstWeekDaySunday = scope.$eval(attrs.firstWeekDaySunday) || true;
		scope.placeholder = attrs.placeholder || 'mm/dd/yyyy';
	};

	return {
		restrict: 'EA',
		require: '?ngModel',
		scope: {},
		link: function (scope, element, attrs, ngModel) {

			scope.externalClasses = attrs.class || '';
			element.removeClass();

			setScopeValues(scope, attrs);

			scope.calendarOpened = false;
			scope.days = [];
			scope.dayNames = [];
			scope.viewValue = null;
			scope.dateValue = null;

			moment.locale(scope.locale);
			var date = moment();

			var generateCalendar = function (date) {
				var lastDayOfMonth = date.endOf('month').date(),
					month = date.month(),
					year = date.year(),
					n = 1;

				var firstWeekDay = scope.firstWeekDaySunday === true ? date.set('date', 2).day() : date.set('date', 1).day();
				if (firstWeekDay !== 1) {
					n -= firstWeekDay - 1;
				}

				//Code to fix date issue
				if(n==2)
					n = -5;

				scope.dateValue = date.format('MMMM YYYY');
				scope.days = [];

				for (var i = n; i <= lastDayOfMonth; i += 1) {
					if (i > 0) {
						scope.days.push({day: i, month: month + 1, year: year, enabled: true});
					} else {
						scope.days.push({day: null, month: null, year: null, enabled: false});
					}
				}
			};

			var generateDayNames = function () {
				var date = scope.firstWeekDaySunday === true ?  moment('2015-06-07') : moment('2015-06-01');
				for (var i = 0; i < 7; i += 1) {
					scope.dayNames.push(date.format('ddd'));
					date.add('1', 'd');
				}
			};

			generateDayNames();

			scope.showCalendar = function () {
				scope.calendarOpened = true;
				generateCalendar(date);
			};

			scope.closeCalendar = function () {
				scope.calendarOpened = false;
			};

			scope.prevYear = function () {
				date.subtract(1, 'Y');
				generateCalendar(date);
			};

			scope.prevMonth = function () {
				date.subtract(1, 'M');
				generateCalendar(date);
			};

			scope.nextMonth = function () {
				date.add(1, 'M');
				generateCalendar(date);
			};

			scope.nextYear = function () {
				date.add(1, 'Y');
				generateCalendar(date);
			};

			scope.selectDate = function (event, date) {
				event.preventDefault();
				var selectedDate = moment(date.day + '.' + date.month + '.' + date.year, 'DD.MM.YYYY');
				ngModel.$setViewValue(selectedDate.format(scope.format));
				scope.viewValue = selectedDate.format(scope.viewFormat) || '';
				scope.closeCalendar();
			};

			scope.isToday = function(day) {
				if (!day) {
					return false;
				}
				var today = moment().startOf('day');
				var newDate = moment(day.month + '/' + day.day + '/' + day.year,'MM/DD/YYYY').startOf('day');
				return today.isSame(newDate);
			}

			scope.isSelected = function(day){
				if (!day || !scope.viewValue.length){
					return false;
				}
				var selectedDay = moment(scope.viewValue, 'MM/DD/YYYY').startOf('day');
				var thisDay = moment(day.month + '/' + day.day + '/' + day.year,'MM/DD/YYYY').startOf('day');
				return selectedDay.isSame(thisDay);
			}

			// if clicked outside of calendar
			var classList = ['ng-datepicker', 'ng-datepicker-input'];
            if (attrs.id !== undefined) classList.push(attrs.id);
			$document.on('click', function (e) {

				if (!scope.calendarOpened) return;

				var i = 0,
					element;

				if (!e.target) return;

				for (element = e.target; element; element = element.parentNode) {
					var id = element.id;

					if (id !== undefined) {
						for (i = 0; i < classList.length; i += 1) {
							if (id.indexOf(classList[i]) > -1) {
								return;
							}
						}
					}
				}
				scope.closeCalendar();
				scope.$apply();
			});

			ngModel.$render = function () {
				var newValue = ngModel.$viewValue;
				if (newValue && newValue !== undefined) {
					scope.viewValue = moment(newValue).format(scope.viewFormat);
					scope.dateValue = newValue;
				} else {
					scope.viewValue = '';
				}
			};

		},
		template:
		'<div><input type="text" ng-focus="showCalendar()" ng-value="viewValue" class="ng-datepicker-input {{externalClasses}}" placeholder="{{ placeholder }}"></div>' +
		'<div class="ng-datepicker" ng-show="calendarOpened">' +
		'  <div class="controls">' +
		'    <div class="left">' +
		'      <i class="fa fa-backward prev-year-btn" ng-click="prevYear()"></i>' +
		'      <i class="fa fa-angle-left prev-month-btn" ng-click="prevMonth()"></i>' +
		'    </div>' +
		'    <span class="date" ng-bind="dateValue"></span>' +
		'    <div class="right">' +
		'      <i class="fa fa-angle-right next-month-btn" ng-click="nextMonth()"></i>' +
		'      <i class="fa fa-forward next-year-btn" ng-click="nextYear()"></i>' +
		'    </div>' +
		'  </div>' +
		'  <div class="day-names">' +
		'    <span ng-repeat="dn in dayNames">' +
		'      <span>{{ dn }}</span>' +
		'    </span>' +
		'  </div>' +
		'  <div class="calendar">' +
		'    <span ng-repeat="d in days">' +
		'      <span class="day" ng-click="selectDate($event, d)" ng-class="{disabled: !d.enabled, today: isToday(d), selected:isSelected(d) }">{{ d.day }}</span>' +
		'    </span>' +
		'  </div>' +
		'</div>'
	};

}]);
