'use strict';

export default ['$scope', 'Parameter', 'AvailableAlgorithmFiles', 'InputStore', 'ngDialog', function($scope, Parameter, AvailableAlgorithmFiles, InputStore, ngDialog) {

  // *** Variable Definitions ***

  if ($scope.$parent.AlgorithmToEdit) {
    $scope.newAlgorithm = $scope.$parent.AlgorithmToEdit;
    $scope.defaultAlgorithmText = $scope.newAlgorithm.fileName;
  } else {
    $scope.newAlgorithm = {};
    $scope.defaultAlgorithmText = '--choose an algorithm--';
    $scope.newAlgorithm.author = 'No author';
    $scope.newAlgorithm.description = 'No description';
  }
  $scope.algorithmFiles = [];

  // *** Function Definitions ***

  // Loads the available algorithm jars
  function loadAvailableAlgorithms() {
    AvailableAlgorithmFiles.get(function(result) {
      $scope.$parent.algorithms.forEach(function(algorithmCategory) {
        algorithmCategory.algorithms.forEach(function(algorithm) {
          var index = result.indexOf(algorithm.fileName);
          if (index !== -1) {
            result.splice(index, 1);
          }
        })
      });
      $scope.algorithmFiles = result;
      if ($scope.$parent.AlgorithmToEdit) {
        $scope.algorithmFiles.push($scope.newAlgorithm.fileName);
      }
    });
  }

  // Save or update a algorithm
  function saveNewAlgorithm(algorithm) {
    $scope.$parent.resetAlgorithm();
    if (!algorithm.fileName) {
      $scope.$parent.openError('You have to select an algorithm jar-file!');
      return;
    }
    if (!algorithm.name) {
      $scope.$parent.openError('You have to insert an algorithm name!');
      return;
    }
    $scope.$parent.startSpin();
    var obj = {
      'id': algorithm.id,
      'fileName': algorithm.fileName,
      'name': algorithm.name,
      'author': algorithm.author,
      'description': algorithm.description,
      'ind': algorithm.ind,
      'fd': algorithm.fd,
      'ucc': algorithm.ucc,
      'cucc': algorithm.cucc,
      'od': algorithm.od,
      'mvd': algorithm.mvd,
      'basicStat': algorithm.basicStat,
      'dc': algorithm.dc,
      'relationalInput': algorithm.relationalInput,
      'databaseConnection': algorithm.databaseConnection,
      'tableInput': algorithm.tableInput,
      'fileInput': algorithm.fileInput
    };
    if ($scope.$parent.AlgorithmToEdit) {
      InputStore.updateAlgorithm(obj, function() {
        $scope.$parent.stopSpin();
        $scope.$parent.initializeAlgorithmList();
        ngDialog.closeAll()
      }, function(errorMessage) {
        $scope.$parent.stopSpin();
        $scope.$parent.openError('An error occurred when updating this algorithm: ' + errorMessage.data)
      })
    } else {
      InputStore.newAlgorithm(obj, function() {
        $scope.$parent.stopSpin();
        $scope.$parent.initializeAlgorithmList();
        ngDialog.closeAll()
      }, function(errorMessage) {
        $scope.$parent.stopSpin();
        openError('An error occurred when saving this algorithm: ' + errorMessage.data)
      })
    }
  }

  // Updates author and description of an algorithm, if another algorithm is selected in the dropdown
  function algorithmFileChanged() {
    Parameter.authorsDescription({
      algorithm: $scope.newAlgorithm.fileName
    }, function(data) {
      if (data.authors === undefined || !data.authors) {
        $scope.newAlgorithm.author = 'No author';
      } else {
        $scope.newAlgorithm.author = data.authors;
      }

      if (data.description === undefined || !data.description) {
        $scope.newAlgorithm.description = 'No description';
      } else {
        $scope.newAlgorithm.description = data.description;
      }

    })
  }

  // *** Export functions ***
  $scope.saveNewAlgorithm = saveNewAlgorithm;
  $scope.algorithmFileChanged = algorithmFileChanged;

  // *** Function Calls ***
  loadAvailableAlgorithms();
}];
