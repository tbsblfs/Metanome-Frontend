'use strict';

import resultTypes from './types';

export default function ($scope, Executions, Results, $q, usSpinnerService,
                                       $timeout, $stateParams, LoadResults, CountResults, Execution, File,
                                       ngDialog, $http, ENV_VARS) {

  // ** VARIABLE DEFINITIONS **
  // **************************

  $scope.id = $stateParams.resultId;
  $scope.extended = ($stateParams.extended === 'true');
  $scope.cached = ($stateParams.cached === 'true');
  $scope.file = ($stateParams.file === 'true');
  $scope.count = ($stateParams.count === 'true');
  $scope.load = ($stateParams.load === 'true');

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

  Object.keys(resultTypes).forEach(function (key) {
    $scope[resultTypes[key].test] = ($stateParams[resultTypes[key].test] === 'true');
    $scope[key] = {
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
        type: resultTypes[key].type,
        sort: resultTypes[key].sort
      },
      handler: resultTypes[key].resultHandler,
    };
    $scope[key].pageChange = onPageChange($scope[key]);
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
    Object.keys(resultTypes).forEach(function (key) {
      if ($scope.file || $scope[resultTypes[key].test]) {
        const scopeObj = $scope[key];
        $http.get(ENV_VARS.API + '/api/result-store/count/' + scopeObj.params.type).
          then(function (response) {
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
    File.get({id: $scope.id}, function (result) {
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
    Execution.get({id: $scope.id}, function (result) {
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
    LoadResults.load({id: $scope.id, notDetailed: false}, function () {
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
    LoadResults.file({id: $scope.id, notDetailed: true}, function () {
      init();
      $scope.loading = false;
      stopSpin();
    }, function (errorMessage) {
      $scope.loading = false;
      stopSpin();
      openError('Results could not be loaded: ' + errorMessage.data);
    });
    // load result (coming from history)
  } else if ($scope.load) {
    startSpin();
    $scope.loading = true;
    LoadResults.load({id: $scope.id, notDetailed: true}, function () {
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
