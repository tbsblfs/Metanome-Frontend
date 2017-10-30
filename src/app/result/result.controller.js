'use strict';

import resultTypes from './types';

export default function($scope, Executions, Results, $q, usSpinnerService,
  $timeout, $stateParams, LoadResults, CountResults, Execution, File, ngDialog) {

  // ** VARIABLE DEFINITIONS **
  // **************************
  $scope.extended = ($stateParams.extended === 'true');
  $scope.cached = ($stateParams.cached === 'true');
  $scope.file = ($stateParams.file === 'true');
  $scope.count = ($stateParams.count === 'true');

  $scope.extendedState = Object.assign({}, $stateParams, { extended: true});
  $scope.isEmptyResult = () => $scope.resultTypes.every(s => s.count == 0) && $scope.loading == false;

  $scope.paginationValues = [10, 20, 30, 40, 50];

  var defaultCacheSize = 50;

  /**
   * Updates the result according to the selected limit and page.
   * @param page the current page
   * @param limit the current limit
   * @returns {*}
   */
  const onPageChange = (scopeObj) => (page, limit) => {
    var deferred = $q.defer();
    if (scopeObj.params.to < scopeObj.count) {
      scopeObj.params.from += scopeObj.params.to + 1;
      scopeObj.params.to += Math.max(limit, scopeObj.count);
      loadData(scopeObj);
      $timeout(function () {
        deferred.resolve();
      }, 500);
    } else {
      deferred.resolve()
    }
    return deferred.promise;
  }

  $scope.resultTypes = [];
  Object.values(resultTypes).forEach(function (value) {
    const state = {
      active: ($stateParams[value.short] === 'true'),
      count: 0,
      data: [],
      query: {
        order: '',
        limit: 10,
        page: 1
      },
      selected: [],
      params: {
        from: 0,
        to: defaultCacheSize,
        type: value.type,
        sort: value.sort
      },
      handler: value.resultHandler,
      columnNames: value.columnNames ? [...value.columnNames] : [],
      extendedColumnNames: value.extendedColumnNames,
      visualization: value.visualization,
    };
    state.pageChange = onPageChange(state);
    $scope.resultTypes.push(state);
  });

  /**
   * Loads the result from the backend.
   */
  function loadData(scopeObj) {
    Results.get(scopeObj.params, function (res) {
      var rows = res.map(scopeObj.handler(scopeObj));
      scopeObj.data = scopeObj.data.concat(rows);
    })
  }

  /**
   * Loads the results depending on the requested result types.
   */
  function init() {
    $scope.resultTypes.forEach(function (scopeObj) {
      if ($scope.file || scopeObj.active) {
        CountResults.get(scopeObj.params.type).then(function(response) {
          var count = response.data;

          if (count > 0) {
            scopeObj.count = count;
            if (!$scope.count) {
              loadData(scopeObj);
            }
          }
        });
      }
    });
  }

  /**
   * Loads the file with a specific id from the backend.
   */
  function loadDetailsForFile() {
    File.get({id: $stateParams.resultId}, function (result) {
      $scope.file = result;
      $scope.file.shortFileName = $scope.file.fileName.replace(/^.*[\\\/]/, '');
    })
  }

  /**
   * Formats the given number. The number should contain two digits.
   * @param number the number
   * @returns {string} a string containig two digits
   */
  function twoDigits(number) {
    return (number < 10 ? '0' + number : '' + number)
  }

  /**
   * Load the execution with a specific id from the backend.
   */
  function loadDetailsForExecution() {
    Execution.get({id: $stateParams.resultId}, function (result) {
      $scope.execution = result;
      var duration = result.end - result.begin; // milliseconds

      var days = Math.floor(duration / (1000 * 60 * 60 * 24));
      var hours = twoDigits(Math.floor(duration / (1000 * 60 * 60)));
      var minutes = twoDigits(Math.floor((duration / (1000 * 60)) % 60));
      var seconds = twoDigits(Math.floor((duration / 1000) % 60));
      var milliseconds = Math.floor(duration % 1000);

      if (seconds === '00') {
        $scope.duration = milliseconds + ' ms';
      } else if (days === 0) {
        $scope.duration = hours + ':' + minutes + ':' + seconds + ' (hh:mm:ss) and ' + milliseconds + ' ms';
      } else {
        $scope.duration = days + ' day(s) and ' + hours + ':' + minutes + ':' + seconds + ' (hh:mm:ss) and ' + milliseconds + ' ms';
      }
    })
  }

  /**
   * Open the visualizations for result type
   */
  function openVisualization(type) {
    $scope.openVisualizationType = type;
    ngDialog.open({
      template: require('./templates/visualization.html'),
      plain: true,
      scope: $scope
    })
  }

  /**
   * Open a dialog which shows an error message.
   * @param message the message
   */
  function openError(message) {
    $scope.errorMessage = message;
    ngDialog.open({
      template: require('./templates/error.html'),
      plain: true,
      scope: $scope
    })
  }

  /**
   * Starts the spinner
   */
  function startSpin() {
    $timeout(function() {
      usSpinnerService.spin('spinner-2');
    }, 10);
  }

  /**
   * Stops the spinner
   */
  function stopSpin() {
    $timeout(function() {
      usSpinnerService.stop('spinner-2');
    }, 10);
  }

  // ** EXPORT FUNCTIONS **
  // **********************

  $scope.openVisualization = openVisualization;

  // load extended results
  if ($scope.extended) {
    startSpin();
    $scope.loading = true;
    LoadResults.load({id: $stateParams.resultId, notDetailed: false}, function () {
      init();
      loadDetailsForExecution();
      $scope.loading = false;
      stopSpin();
    }, function (errorMessage) {
      $scope.loading = false;
      stopSpin();
      openError('Could not load extended results: ' + errorMessage.data);
    });
    // load all results for a file
  } else if ($scope.file) {
    startSpin();
    $scope.loading = true;
    loadDetailsForFile();
    LoadResults.file({id: $stateParams.resultId, notDetailed: true}, function () {
      init();
      $scope.loading = false;
      stopSpin();
    }, function (errorMessage) {
      $scope.loading = false;
      stopSpin();
      openError('Results could not be loaded: ' + errorMessage.data);
    });
    // load result (coming from history)
  } else if ($stateParams.load === 'true') {
    startSpin();
    $scope.loading = true;
    LoadResults.load({id: $stateParams.resultId, notDetailed: true}, function () {
      init();
      loadDetailsForExecution();
      $scope.loading = false;
      stopSpin();
    }, function (errorMessage) {
      $scope.loading = false;
      stopSpin();
      openError('Results could not be loaded: ' + errorMessage.data);
    });
    // load results
  } else {
    $scope.loading = false;
    init();
    loadDetailsForExecution();
  }

};
