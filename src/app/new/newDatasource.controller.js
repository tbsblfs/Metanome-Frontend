export default ['$scope', 'AvailableInputFiles', 'ngDialog', 'InputStore', function($scope, AvailableInputFiles, ngDialog, InputStore) {

  // *** Variable Definitions ***
  $scope.newDataSourceCategory = 'file';

  if ($scope.$parent.editFileInput) {
    $scope.file = $scope.$parent.editFileInput;
    if ($scope.file.fileName.lastIndexOf("inputData") != -1) {
      $scope.defaultFileText = $scope.file.fileName.substr($scope.file.fileName.lastIndexOf("inputData") + 10, $scope.file.fileName.length - 1);
    } else {
      $scope.defaultFileText = $scope.file.fileName;
    }
    $scope.newDataSourceCategory = 'file'
  } else {
    $scope.defaultFileText = '--choose a file--';
    $scope.file = {
      'separator': ',',
      'quoteChar': '\'',
      'escapeChar': '\\',
      'skipLines': '0',
      'strictQuotes': false,
      'ignoreLeadingWhiteSpace': true,
      'hasHeader': true,
      'skipDifferingLines': false,
      'nullValue': ''
    }
  }

  if ($scope.$parent.editDatabaseInput) {
    $scope.database = $scope.$parent.editDatabaseInput;
    $scope.newDataSourceCategory = 'database'
  } else {
    $scope.database = {}
  }

  if ($scope.$parent.editTableInput) {
    $scope.table = $scope.$parent.editTableInput;
    $scope.newDataSourceCategory = 'table';
    $scope.defaultDatabaseConnectionText = $scope.table.databaseConnection.name;
  } else {
    $scope.table = {};
    $scope.defaultDatabaseConnectionText = '--choose a database connection--';
  }

  $scope.files = [];
  $scope.databaseConnections = [];

  // *** Function Defintions ***

  // Sets the selected data source category (file input, table input, database connection)
  function selectDatasourceCategory(category) {
    $scope.newDataSourceCategory = category
  }

  // deletes directories with all files included in the datasource selection
  function deleteDirectories(inputFiles) {
    var fileList = [];
    var directoryPaths = [];

    inputFiles.forEach(function(file) {
      // add paths with no file ending to list
      if (file.indexOf(".") == -1) {
        directoryPaths.push(file);
      } else {
        fileList.push(file);
      }
    });

    fileList.forEach(function(file) {
      var subDir = file.substr(0, file.lastIndexOf(fileSep));
      if (directoryPaths.indexOf(subDir) != -1) {
        directoryPaths.splice(directoryPaths.indexOf(subDir), 1);
      }
    });

    return directoryPaths;
  }

  // Loads the available files on disk
  function loadAvailableFiles() {
    AvailableInputFiles.get(function(result) {
      var updatedResult = result.map(function(f) {
        if (f.lastIndexOf("inputData") != -1) {
          return f.substr(f.lastIndexOf("inputData") + 10, f.length - 1)
        } else {
          return f
        }
      });
      $scope.$parent.datasources.forEach(function(category) {
        if (category.name === 'File Input') {
          category.datasource.forEach(function(file) {
            if (file.fileName.lastIndexOf("inputData") != -1) {
              var index = updatedResult.indexOf(file.fileName.substr(file.fileName.lastIndexOf("inputData") + 10, file.fileName.length - 1));
            } else {
              var index = updatedResult.indexOf(file.fileName);
            }
            if (index !== -1) {
              result.splice(index, 1);
              updatedResult.splice(index, 1);
            }
          })
        }

        var directoryPaths = deleteDirectories(updatedResult);
        directoryPaths.forEach(function(dir) {
          var index = updatedResult.indexOf(dir);
          if (index !== -1) {
            result.splice(index, 1);
            updatedResult.splice(index, 1);
          }
        });
      });

      result.forEach(function(file) {
        $scope.files.push({
          fileName: file,
          shortFileName: file.substr(file.lastIndexOf("inputData") + 10, file.length - 1)
        })
      });
      if ($scope.$parent.editFileInput) {
        $scope.files.push({
          fileName: $scope.file.fileName,
          shortFileName: $scope.file.fileName.substr($scope.file.fileName.lastIndexOf("inputData") + 10, $scope.file.fileName.length - 1)
        });
      }
      $scope.files.sort(function(a, b) {
        return a.shortFileName.localeCompare(b.shortFileName);
      });
    })
  }

  // Loads the available database connections
  function loadAvailableDatabases() {
    $scope.$parent.datasources.forEach(function(category) {
      if (category.name === 'Database Connection') {
        $scope.databaseConnections = category.datasource
      }
    });
  }


  // Save or update a file input
  function saveNewFileInput(file) {
    $scope.$parent.resetAlgorithm();
    if (!file.fileName) {
      $scope.$parent.openError('You have to select a file!');
      return;
    }
    $scope.$parent.startSpin();
    var obj = {
      'type': 'fileInput',
      'id': file.id || 1,
      'name': file.fileName || '',
      'fileName': file.fileName || '',
      'separator': file.separator || '',
      'quoteChar': file.quoteChar || '',
      'escapeChar': file.escapeChar || '',
      'skipLines': file.skipLines || '0',
      'strictQuotes': file.strictQuotes || false,
      'ignoreLeadingWhiteSpace': file.ignoreLeadingWhiteSpace || false,
      'hasHeader': file.hasHeader || false,
      'skipDifferingLines': file.skipDifferingLines || false,
      'comment': file.comment || '',
      'nullValue': file.nullValue || ''
    };
    if ($scope.$parent.editFileInput) {
      InputStore.updateFileInput(obj, function() {
        $scope.$parent.initializeDatasources();
        $scope.$parent.stopSpin();
        ngDialog.closeAll();

      }, function(errorMessage) {
        $scope.$parent.openError('An error occurred when updating this datasource: ' + errorMessage.data);
        $scope.$parent.stopSpin();
      })
    } else {
      AvailableInputFiles.getDirectory(obj, function() {
        $scope.$parent.initializeDatasources();
        $scope.$parent.stopSpin();
        ngDialog.closeAll();
      }, function(errorMessage) {
        $scope.$parent.openError('An error occurred when updating this datasource: ' + errorMessage.data);
        $scope.$parent.stopSpin();
      })
    }
  }

  // Save or update a database connection
  function saveDatabaseInput(database) {
    $scope.$parent.resetAlgorithm();
    if (!database.url) {
      $scope.$parent.openError('You have to insert a database url!');
      return;
    }
    if (!database.password) {
      $scope.$parent.openError('You have to insert a password!');
      return;
    }
    if (!database.username) {
      $scope.$parent.openError('You have to insert a username!');
      return;
    }
    if (!database.system) {
      $scope.$parent.openError('You have to select a system!');
      return;
    }
    $scope.$parent.startSpin();
    var obj = {
      'type': 'databaseConnection',
      'id': database.id || 1,
      'name': database.url + '; ' + database.userName + '; ' + database.system || '',
      'url': database.url || '',
      'username': database.username || '',
      'password': database.password || '',
      'system': database.system || '',
      'comment': database.comment || ''
    };
    if ($scope.$parent.editDatabaseInput) {
      InputStore.updateDatabaseConnection(obj,
        function() {
          $scope.$parent.initializeDatasources();
          $scope.$parent.stopSpin();
          ngDialog.closeAll();
        },
        function(errorMessage) {
          $scope.$parent.openError('An error occurred when updating this datasource: ' + errorMessage.data);
          $scope.$parent.stopSpin();
        })
    } else {
      InputStore.newDatabaseConnection(obj,
        function() {
          $scope.$parent.initializeDatasources();
          $scope.$parent.stopSpin();
          ngDialog.closeAll();
        },
        function(errorMessage) {
          $scope.$parent.openError('An error occurred when saving this datasource: ' + errorMessage.data);
          $scope.$parent.stopSpin();
        })
    }
  }

  // Save or update a table input
  function saveTableInput(table) {
    $scope.$parent.resetAlgorithm();
    table.databaseConnection = JSON.parse(table.databaseConnection);
    if (table.databaseConnection === undefined) {
      $scope.$parent.openError('You have to select a database connection!');
      return;
    }

    if (!table.tableName) {
      $scope.$parent.openError('You have to insert a table name!');
      return;
    }
    $scope.$parent.startSpin();
    var obj = {
      'type': 'tableInput',
      'id': table.id || 1,
      'name': table.tableName + '; ' + table.databaseConnection.name || '',
      'tableName': table.tableName || '',
      'databaseConnection': {
        'type': 'databaseConnection',
        'id': table.databaseConnection.id,
        'name': table.databaseConnection.name,
        'url': table.databaseConnection.url,
        'username': table.databaseConnection.username,
        'password': table.databaseConnection.password,
        'system': table.databaseConnection.system,
        'comment': table.databaseConnection.comment
      },
      'comment': table.comment || ''
    };
    if ($scope.$parent.editTableInput) {
      InputStore.updateTableInput(obj,
        function() {
          $scope.$parent.initializeDatasources();
          $scope.$parent.stopSpin();
          ngDialog.closeAll()
        },
        function(errorMessage) {
          $scope.$parent.openError('An error occurred when updating this datasource: ' + errorMessage.data);
          $scope.$parent.stopSpin();
        })
    } else {
      InputStore.newTableInput(obj, function() {
        $scope.$parent.initializeDatasources();
        $scope.$parent.stopSpin();
        ngDialog.closeAll();
      }, function(errorMessage) {
        $scope.$parent.openError('An error occurred when saving this datasource: ' + errorMessage.data);
        $scope.$parent.stopSpin();
      })
    }
  }

  // *** Export Functions ***

  $scope.selectDatasourceCategory = selectDatasourceCategory;
  $scope.saveNewFileInput = saveNewFileInput;
  $scope.saveDatabaseInput = saveDatabaseInput;
  $scope.saveTableInput = saveTableInput;

  // *** Function Calls ***

  loadAvailableFiles();
  loadAvailableDatabases();

}];
