'use strict';

export default function ($scope,
                                   ngDialog,
                                   Algorithms,
                                   Datasource,
                                   Parameter,
                                   AlgorithmExecution,
                                   usSpinnerService,
                                   Delete,
                                   toaster,
                                   $animate
  ) {

    // ** VARIABLE DEFINITIONS **
    // **************************

    //Exported variables
    $scope.algorithms = [];  // algorithm categories + algorithms
    $scope.datasources = []; // datasource
    $scope.maxNumberOfSetting = {};
    $scope.model = {}; // saved params go here
    $scope.form = [];  // params form
    $scope.schema = {  // schema of params section
      type: 'object',
      properties: {},
      required: [],
      form: []
    };
    $scope.algorithmHasCustomProperties = false;
    $scope.activeAlgorithm = undefined;
    $scope.cachingSelection = 'cache';
    $scope.saveUpdateButton = 'Save';

    //Private variables
    var activeDataSources = {
      'fileInput': [],
      'tableInput': [],
      'databaseConnection': []
    };
    var dataSources = {
      'fileInput': {},
      'tableInput': {},
      'databaseConnection': {}
    };
    var currentParameter;
    var fileSep;

    // ** FUNCTION DEFINITIONS **
    // **************************


    // ***
    // Initialization
    // ***

    /**
     * Initialize the algorithm list.
     * The algorithms for each category are loaded from the backend, sorted and stored.
     */
    function initializeAlgorithmList() {
      var algorithmCategoryNames = [
        {
          name: 'inclusion-dependency-algorithms',
          display: 'Inclusion Dependency Algorithms'
        },
        {
          name: 'functional-dependency-algorithms',
          display: 'Functional Dependency Algorithms'
        },
        {
          name: 'unique-column-combination-algorithms',
          display: 'Unique Column Combination Algorithms'
        },
        {
          name: 'conditional-unique-column-combination-algorithms',
          display: 'Conditional Unique Column Combination Algorithms'
        },
        {
          name: 'order-dependency-algorithms',
          display: 'Order Dependency Algorithms'
        },
        {
          name: 'multivalued-dependency-algorithms',
          display: 'Multivalued Dependency Algorithms'
        },
        {
          name: 'basic-statistics-algorithms',
          display: 'Basic Statistics Algorithms'
        },
        {
          name: 'denial-constraint-algorithms',
          display: 'Denial Constraint Algorithms'
        }
      ];

      $scope.algorithms = [];

      // Get all algorithms for each category from the database
      // and sort them alphabetically
      algorithmCategoryNames.forEach(function (category) {
        Algorithms.get({type: category.name}, function (result) {
          result = removeDuplicates(result);
          $scope.algorithms.push({
                                   name: category.display,
                                   algorithms: result.sort(function (a, b) {
                                     return a.name.localeCompare(b.name)
                                   })
                                 });
          $scope.algorithms.sort(function (a, b) {
            return a.name.localeCompare(b.name)
          })
        })
      });

    }

    /**
     * Initialize the data source list.
     * The data sources for each category are loaded from the backend, sorted and stored.
     */
    function initializeDatasources() {
      var inputCategories = [
        {
          name: 'file-inputs',
          display: 'File Input',
          order: 1
        },
        {
          name: 'database-connections',
          display: 'Database Connection',
          order: 2
        },
        {
          name: 'table-inputs',
          display: 'Table Inputs',
          order: 3
        }
      ];

      $scope.datasources = [];
      var usedDatabases = [];

      // Get all data sources for each category from the database
      // and sort them alphabetically
      inputCategories.forEach(function (category) {
        Datasource.get({type: category.name}, function (result) {
          result = removeDuplicates(result);
          result.forEach(function (element) {
            //Remove path from element name
            if (category.name === 'file-inputs') {
              if (element.name.lastIndexOf("inputData") != -1) {
                element.name = element.name.substr(element.name.lastIndexOf("inputData") + 10, element.name.length - 1);
              }
            }
            if (category.name === 'database-connections') {
              element.name = element.url + '; ' + element.username + '; ' + element.system;
            }
            if (category.name === 'table-inputs') {
              usedDatabases.push(element.databaseConnection.id);
              element.databaseConnection.name = element.databaseConnection.url + '; ' + element.databaseConnection.username + '; ' + element.databaseConnection.system;
            }
            element.disabled = false;
            dataSources[element.type]['' + element.id] = element;
          });
          $scope.datasources.push({
                                    name: category.display,
                                    order: category.order,
                                    datasource: result.sort(function (a, b) {
                                      return a.name.localeCompare(b.name)
                                    }),
                                    possible: true
                                  });
          $scope.datasources.sort(function (a, b) {
            return a.order - b.order
          });

          // when all datasources are set
          if ($scope.datasources.length === 3) {
            // we know that the database connections are at position 2,
            // because of our ordering
            $scope.datasources[1].datasource.forEach(function (db) {
              // set database, which are used by a table input, to 'used'
              // so that they can not be deleted
              if (usedDatabases.indexOf(db.id) > -1) {
                db.used = true
              }
            });
          }
        })
      });
    }

    function getFileSeparator() {
      if (navigator.platform.indexOf("Win") != -1) {
        fileSep = '\\';
      } else {
        fileSep = '/';
      }
    }

    // ***
    // Dialogs
    // ***

    /**
     * Opens a dialog for editing or adding an algorithm.
     */
  function openNewAlgorithm() {
    ngDialog.open({
      template: require('./templates/new-algorithm.html'),
      plain: true,
      scope: $scope,
      preCloseCallback: function() {
        doneEditingAlgorithm()
      },
      controller: 'NewAlgorithmController',
    })
  }

    /**
     * Opens a dialog for editing or adding data sources.
     */
    function openNewDatasource() {
      ngDialog.open({
        template: require('./templates/new-datasource.html'),
        plain: true,
        scope: $scope,
        preCloseCallback: function() {
          doneEditingDatasources()
        },
        controller: 'NewDatasourceController'
      })
    }

    // ***
    // Confirmation
    // ***

    /**
     * Opens a confirm dialog.
     */
    function openConfirm() {
      ngDialog.openConfirm({
        template: require('./templates/confirm.html'),
        plain: true,
        scope: $scope
      })
    }

    /**
     * Opens a dialog to confirm that the given item should be deleted or not.
     * @param item the item, either algorithm, file input, database connection or table input
     */
    function confirmDelete(item) {
      var objectToDelete;
      switch (item.type) {
        case 'fileInput':
          objectToDelete = 'file input';
          break;
        case 'databaseConnection':
          objectToDelete = 'database connection';
          break;
        case 'tableInput':
          objectToDelete = 'table input';
          break;
        default:
          objectToDelete = 'algorithm';
      }

      $scope.confirmText = 'Are you sure you want to delete the ' + objectToDelete + '?';
      $scope.confirmDescription = 'Deleting this ' + objectToDelete + ' results also in deleting all executions of this ' + objectToDelete + '. ' +
                                  'However, the result files remain on disk.';

      $scope.confirmItem = item;
      $scope.confirmFunction = function () {
        switch ($scope.confirmItem.type) {
          case 'fileInput':
            startSpin();
            Delete.file({id: $scope.confirmItem.id}, function () {
              stopSpin();
              initializeDatasources();
              ngDialog.closeAll()
            });
            break;
          case 'databaseConnection':
            startSpin();
            Delete.database({id: $scope.confirmItem.id}, function () {
              stopSpin();
              initializeDatasources();
              ngDialog.closeAll()
            });
            break;
          case 'tableInput':
            startSpin();
            Delete.table({id: $scope.confirmItem.id}, function () {
              stopSpin();
              initializeDatasources();
              ngDialog.closeAll()
            });
            break;
          default:
            startSpin();
            Delete.algorithm({id: $scope.confirmItem.id}, function () {
              stopSpin();
              resetAlgorithm();
              ngDialog.closeAll()
            });
            break
        }
      };
      openConfirm()
    }

    function confirmDialog() {
      $scope.confirmFunction()
    }

    // ***
    // Actions
    // ***

    /**
     * Activates a data source, which was selected.
     * If the number of data sources is equal to the number required by the algorithm, all other not active data
     * sources are hidden.
     * @param datasource the data source the user clicked on
     */
    function toggleDatasource(datasource) {
      var index = activeDataSources[datasource.type].indexOf(datasource.id);
      datasource.active = datasource.active || false;
      datasource.active = !datasource.active;

      if (index === -1) {
        activeDataSources[datasource.type].push(datasource.id)
      } else {
        activeDataSources[datasource.type].splice(index, 1);
        enableAllInputs()
      }

      var type = '';
      if (datasource.type === 'fileInput') {
        type = 'File Input'
      } else if (datasource.type === 'databaseConnection') {
        type = 'Database Connection'
      } else if (datasource.type === 'tableInput') {
        type = 'Table Inputs'
      }

      if ($scope.maxNumberOfSetting[type] !== -1 &&
          $scope.maxNumberOfSetting[type] <= activeDataSources[datasource.type].length) {
        $scope.datasources.forEach(function (ds) {
          if (ds.name.indexOf(type) > -1) {
            ds.datasource.forEach(function (element) {
              if (element.active === undefined || element.active === false) {
                element.disabled = true
              }
            })
          }
        })
      } else {
        enableAllInputs()
      }
    }



    //TODO:Rewrite function
    /**
     * Executes an algorithm.
     * Start a timer for the algorithm execution.
     * @param caching the caching parameter, which was selected
     * @param memory the amount of memory
     */
    function executeAlgorithm(caching, memory) {
      var algorithm = $scope.activeAlgorithm;
      var params;
      try {
        params = readParamsIntoBackendFormat(currentParameter)
      } catch (e) {
        openError(e.message);
        return;
      }

      var date = new Date();
      var executionIdentifierDate = date.getFullYear() + '-' +
                                    twoDigits(date.getMonth() + 1) + '-' +
                                    twoDigits(date.getDate()) + 'T' +
                                    twoDigits(date.getHours()) +
                                    twoDigits(date.getMinutes()) +
                                    twoDigits(date.getSeconds());
      var payload = {
        'algorithmId': algorithm.id,
        'executionIdentifier': algorithm.fileName + executionIdentifierDate,
        'requirements': params,
        'cacheResults': (caching === 'cache'),
        'writeResults': (caching === 'disk'),
        'countResults': (caching === 'count'),
        'memory': memory || ''
      };
      $scope.payload = payload;
      $scope.canceled = false;
      $scope.cancelFunction = function () {
        $scope.canceled = true
      };

      notificationInformation();
      AlgorithmExecution.run({}, payload, function (result) {
        var url = {
          ind:  result.algorithm.ind,
          fd: result.algorithm.fd,
          ucc: result.algorithm.ucc,
          cucc:  result.algorithm.cucc,
          od: result.algorithm.od,
          mvd: result.algorithm.mvd,
          basicStat: result.algorithm.basicStat,
          dc: result.algorithm.dc,
        };

        if (!$scope.canceled) {
          url.resultId = result.id;
          if (caching === 'cache' || caching === 'disk') {
            url.cached = true;
          } else {
             url.count = true;
          }
          notificationSuccess(result,url);
        }


      }, function (errorMessage) {
            notificationError(errorMessage);
      })
    }

    /**
     * Highlights the given algorithm in the algorithm list
     * @param algorithm the algorithm
     */
    function highlightAlgorithm(algorithm) {
      if ($scope.activeAlgorithm) {
        $scope.activeAlgorithm.active = false
      }
      algorithm.active = true;
      $scope.activeAlgorithm = algorithm
    }

    /**
     * Updates the data source list according to the data sources the algorithm needs.
     * @param algorithm the algorithm
     */
    function updateAvailableDatasources(algorithm) {
      $scope.datasources.forEach(function (datasource) {
        if (datasource.name.indexOf('Table Inputs') > -1) {
          datasource.possible = algorithm.tableInput || algorithm.relationalInput
        } else if (datasource.name.indexOf('Database Connection') > -1) {
          datasource.possible = algorithm.databaseConnection
        } else if (datasource.name.indexOf('File Input') > -1) {
          datasource.possible = algorithm.fileInput || algorithm.relationalInput
        }
      })
    }

    /**
     * An algorithm was selected. Load the parameters and show them to the user.
     * @param algorithm the algorithm
     */
    function activateAlgorithm(algorithm) {
      highlightAlgorithm(algorithm);
      updateAvailableDatasources(algorithm);
      enableAllInputs();
      unselectAllInputs();
      resetParameter();
      initializeForm();
      updateParameter(algorithm);
    }

    // ***
    // Parameter Update
    // ***

    /**
     * Reset the parameter form.
     */
    function resetParameter() {
      $scope.model = {};
      $scope.form = [];
      $scope.schema = {
        type: 'object',
        properties: {}
      };
      $scope.algorithmHasCustomProperties = false
    }

    /**
     * Initialize the parameter form
     */
    function initializeForm() {
      $scope.form = [
        '*',
        {
          'type': 'actions',
          'items': []
        }
      ]
    }

    /**
     * Update the parameter of the given algorithm.
     * @param algorithm the algorithm
     */
    function updateParameter(algorithm) {
      currentParameter = [];
      $scope.maxNumberOfSetting = {};
      activeDataSources = {
        'fileInput': [],
        'tableInput': [],
        'databaseConnection': []
      };
      $scope.schema.required = [];

      Parameter.get({algorithm: algorithm.fileName}, function (parameter) {
        // sort parameter, so that the same type of parameter is listed
        // next to each other in the form
        parameter.sort(function (a, b) {
          return a.type.localeCompare(b.type) * -1;
        });
        parameter.forEach(function (param) {
          currentParameter.push(param);
          switch (param.type) {
            case 'ConfigurationRequirementRelationalInput':
              configureParamInputs(param, 'File Input');
              configureParamInputs(param, 'Table Inputs');
              break;
            case 'ConfigurationRequirementFileInput':
              configureParamInputs(param, 'File Input');
              break;
            case 'ConfigurationRequirementTableInput':
              configureParamInputs(param, 'Table Inputs');
              break;
            case 'ConfigurationRequirementDatabaseConnection':
              configureParamInputs(param, 'Database Connection');
              break;
            case 'ConfigurationRequirementInteger':
              addParamToList(param, 'number', false, false);
              break;
            case 'ConfigurationRequirementListBox':
              addParamToList(param, 'string', true, false);
              break;
            case 'ConfigurationRequirementCheckBox':
              addParamToList(param, 'array', false, true);
              break;
            case 'ConfigurationRequirementString':
              addParamToList(param, 'string', false, false);
              break;
            case 'ConfigurationRequirementBoolean':
              addParamToList(param, 'boolean', false, false);
              break;
            default:
              $scope.console.error('Parameter type ' + param.type + ' not supported yet');
              break
          }
        })
      })
    }

    // ***
    // Editing
    // ***

    /**
     * Opens a dialog for editing the given data source.
     * @param datasource the data source
     */
    function editDatasource(datasource) {
      $scope.edit = true;
      $scope.saveUpdateButton = 'Update';
      switch (datasource.type) {
        case 'fileInput':
          $scope.editFileInput = datasource;
          break;
        case 'databaseConnection':
          $scope.editDatabaseInput = datasource;
          break;
        case 'tableInput':
          $scope.editTableInput = datasource;
          break;
      }
      openNewDatasource()
    }

    /**
     * The editing of a data source is done.
     * Reset the editing parameter.
     */
    function doneEditingDatasources() {
      $scope.editFileInput = null;
      $scope.editDatabaseInput = null;
      $scope.editTableInput = null;
      $scope.edit = false;
      $scope.saveUpdateButton = 'Save';
    }

    /**
     * The editing of an algorithm is done.
     * Reset the editing parameter.
     */
    function doneEditingAlgorithm() {
      $scope.AlgorithmToEdit = null;
      $scope.edit = false;
      $scope.saveUpdateButton = 'Save';
    }

    /**
     * Opens the algorithm dialog for editing the given algorithm.
     * @param algorithm the algorithm
     */
    function editAlgorithm(algorithm) {
      $scope.edit = true;
      $scope.saveUpdateButton = 'Update';
      $scope.AlgorithmToEdit = algorithm;
      openNewAlgorithm();
    }

    // ***
    // Parameter Configuration
    // ***

    /**
     * Shows the user the number of data sources he has to select.
     * @param param the parameter
     * @param input the input type
     */
    function configureParamInputs(param, input) {
      var index = -1;
      $.grep($scope.datasources, function (element, i) {
        if (element !== undefined && element.name !== undefined && element.name.indexOf(input) > -1) {
          index = i;
          return true
        } else {
          return false
        }
      });
      if (param.numberOfSettings === -1) {
        $scope.datasources[index].name =
          input + ' (choose an arbitrary number separated by comma)'
      } else if (param.minNumberOfSettings === param.maxNumberOfSettings) {
        $scope.datasources[index].name =
          input + ' (choose ' + param.minNumberOfSettings + ')'
      } else {
        $scope.datasources[index].name =
          input + ' (min: ' + param.minNumberOfSettings + ' | max: ' + param.maxNumberOfSettings + ')'
      }
      $scope.maxNumberOfSetting[input] = $scope.maxNumberOfSetting[input] || 0;
      $scope.maxNumberOfSetting[input] += param.maxNumberOfSettings;
    }

    /**
     * Adds the given parameter to parameter form.
     * @param param the parameter
     * @param type the type of the input
     * @param dropdown true, if the parameter requires a dropdown, false otherwise
     */
    function addParamToList(param, type, useEnum, useForm) {
      $scope.algorithmHasCustomProperties = true;
      var identifier;

      if (param.numberOfSettings > 1) {
        for (var i = 1; i <= param.numberOfSettings; i++) {
          identifier = param.identifier + ' (' + i + ')';
          $scope.schema.properties[identifier] = {
            'title': identifier,
            'type': type
          };

          if(useForm) {
            $scope.form.key = identifier;
            $scope.form.type = "checkboxes";
            $scope.form.titleMap = [];
            param.values.forEach(function (v) {
              $scope.form.titleMap.push({"value": v, "name": v});
            })
            $scope.schema.properties[identifier].items = {};
            $scope.schema.properties[identifier].items.type="string";
            $scope.schema.properties[identifier].items.enum = [];
            param.values.forEach(function (v) {
              $scope.schema.properties[identifier].items.enum.push(v)
            })
          }
          if (useEnum) {
            $scope.schema.properties[identifier].enum = [];
            param.values.forEach(function (v) {
              $scope.schema.properties[identifier].enum.push(v)
            })
          }
          if (param.required) {
            $scope.schema.required.push(identifier)
          }
          if (param.defaultValues !== null && param.defaultValues !== undefined) {
            $scope.schema.properties[identifier].default = param.defaultValues[i]
          }
        }
      } else if (param.numberOfSettings == -1) {
        identifier = param.identifier;
        $scope.schema.properties[identifier] = {
        'title': identifier + " (choose an arbitrary number separated by comma)",
        'type': type
        };
        if(useForm) {
          $scope.form.key = identifier;
          $scope.form.type = "checkboxes";
          $scope.form.titleMap = [];
          param.values.forEach(function (v) {
            $scope.form.titleMap.push({"value": v, "name": v});
          })
          $scope.schema.properties[identifier].items = {};
          $scope.schema.properties[identifier].items.type="string";
          $scope.schema.properties[identifier].items.enum = [];
          param.values.forEach(function (v) {
            $scope.schema.properties[identifier].items.enum.push(v)
          })
        }
        if (useEnum) {
          $scope.schema.properties[identifier].enum = [];
          param.values.forEach(function (v) {
            $scope.schema.properties[identifier].enum.push(v)
          })
        }

        if (param.required) {
          $scope.schema.required.push(identifier)
        }
        if (param.defaultValues !== null && param.defaultValues !== undefined) {
          $scope.schema.properties[identifier].default = param.defaultValues[0]
        }
      } else {
        identifier = param.identifier;
        $scope.schema.properties[identifier] = {
          'title': identifier,
          'type': type
        };
        if(useForm) {
          $scope.form.key = identifier;
          $scope.form.type = "checkboxes";
          $scope.form.titleMap = [];
          param.values.forEach(function (v) {
            $scope.form.titleMap.push({"value": v, "name": v});
          })
          $scope.schema.properties[identifier].items = {};
          $scope.schema.properties[identifier].items.type="string";
          $scope.schema.properties[identifier].items.enum = [];
          param.values.forEach(function (v) {
            $scope.schema.properties[identifier].items.enum.push(v)
          })
        }
        if (useEnum) {
          $scope.schema.properties[identifier].enum = [];
          param.values.forEach(function (v) {
            $scope.schema.properties[identifier].enum.push(v)
          })
        }

        if (param.required) {
          $scope.schema.required.push(identifier)
        }
        if (param.defaultValues !== null && param.defaultValues !== undefined) {
          $scope.schema.properties[identifier].default = param.defaultValues[0]
        }
      }
    }

    // ***
    // Helper
    // ***
    function notificationInformation() {
      toaster.pop({
                    type: 'info',
                    title: 'Execution of algorithm',
                    body: 'Algorithm execution started!',
                    showCloseButton: true,
                    positionClass: 'toast-top-full-width'
                  });
    }

    function notificationSuccess(result,url) {
      toaster.pop( {
                     type: 'success',
                     bodyOutputType: 'trustedHtml',
                     title:'Algorithm execution successful!',
                     body: 'Execution of Algorithm ' + result.algorithm.name + ' successful! <a ui-sref="result(' + JSON.stringify(url) + ')">Show Results!</a>',
                     showCloseButton: true,
                     positionClass: 'toast-top-full-width'
                   });
    }

    function notificationError(errormessage) {
      toaster.pop({
                    type: 'error',
                    title: 'During the algorithm execution following error occured: ' + errormessage.data,
                    body: 'An Error occured!',
                    showCloseButton: true,
                    positionClass: 'toast-top-full-width'
                  });
    }



    /**
     * Stars the spinner
     */
    function startSpin() {
      usSpinnerService.spin('spinner-1');
    }

    /**
     * Stops the spinner
     */
    function stopSpin() {
      usSpinnerService.stop('spinner-1');
    }

    /**
     * Formats the given number. The number should contain two digits.
     * @param number the number
     * @returns {string} a string containing two digits
     */
    function twoDigits(number) {
      return (number < 10 ? '0' + number : '' + number)
    }

    /**
     * Remove duplicates from the given array.
     * @param a the array
     */
    function removeDuplicates(a) {
      var ids = a.map(function(f) {return f.id});
      return a.filter(function(item, pos) {
        return ids.indexOf(item.id) == pos;
      });
    }

    /**
     * Reset the selected algorithm.
     */
    function resetAlgorithm() {
      initializeAlgorithmList();
      initializeDatasources();
      resetParameter();
      $scope.activeAlgorithm = undefined
    }

    /**
     * Reset the selected data sources.
     */
    function resetDataSources() {
      enableAllInputs();
      unselectAllInputs();
      resetParameter();
    }

    /**
     * Activates all inputs.
     */
    function unselectAllInputs() {
      [
        'File Input',
        'Database Connection',
        'Table Inputs'
      ].forEach(function () {
        $scope.datasources.forEach(function (ds) {
          ds.datasource.forEach(function (element) {
            element.active = false
          })
        })
      })
    }

    /**
     * Enables all inputs.
     */
    function enableAllInputs() {
      [
        'File Input',
        'Database Connection',
        'Table Inputs'
      ].forEach(function () {
        $scope.datasources.forEach(function (ds) {
          ds.datasource.forEach(function (element) {
            element.disabled = false
          })
        })
      })
    }

    /**
     * Reads the setting of the given parameter.
     * @param param the configuration parameter
     * @param typeValue the type of the parameter
     * @returns {*}
     */
    function readSetting(param, typeValue) {
      var settingValue;
      var j;

      if (param.numberOfSettings > 1) {
        for (j = param.numberOfSettings; j > 0; j--) {
          settingValue = $scope.model[param.identifier + ' (' + j + ')'];
          // only set the value if it is set
          if (settingValue !== undefined) {
            param.settings.push({
                                  'type': typeValue,
                                  'value': settingValue
                                })
          }
        }
      } else if (param.numberOfSettings == 1000){
        if ($scope.model[param.identifier] !== undefined) {
          settingValues = $scope.model[param.identifier].split(',');
          settingValues.forEach(function (settingValue) {
            if (settingValue !== undefined) {
              param.settings.push({
                'type': typeValue,
                'value': settingValue
              })
            }
          })
        }
      } else {
        settingValue = $scope.model[param.identifier];
        if (settingValue !== undefined) {
          param.settings.push({
                                'type': typeValue,
                                'value': settingValue
                              })
        }
      }

      return param
    }

    /**
     * Reads the parameter the user typed in.
     * The parameters have to be converted into a specific format, which the backend understands.
     * @param params the parameters
     * @returns {*}
     */
    function readParamsIntoBackendFormat(params) {
      var i, j;
      var checked, param, item, paramNumberOfSettings;

      for (i = 0; i < params.length; i++) {
        params[i].settings = [];

        //needed because same fields vary in different places in backend - workaround!
        if (params[i].fixNumberOfSettings !== undefined) {
          delete params[i].fixNumberOfSettings
        }

        paramNumberOfSettings = (params[i].numberOfSettings !== -1) ? params[i].numberOfSettings : 1000;

        switch (params[i].type) {

          case 'ConfigurationRequirementInteger':
            params[i] = readSetting(params[i], 'ConfigurationSettingInteger');
            break;

          case 'ConfigurationRequirementString':
            params[i] = readSetting(params[i], 'ConfigurationSettingString');
            break;

          case 'ConfigurationRequirementBoolean':
            params[i] = readSetting(params[i], 'ConfigurationSettingBoolean');
            break;

          case 'ConfigurationRequirementListBox':
            params[i] = readSetting(params[i], 'ConfigurationSettingListBox');
            break;

          case 'ConfigurationRequirementCheckBox':
            params[i] = readSetting(params[i], 'ConfigurationSettingCheckBox');
            break;

          case 'ConfigurationRequirementTableInput':
            checked = activeDataSources.tableInput.slice(0);
            for (j = 1; j <= paramNumberOfSettings && checked.length > 0; j++) {
              item = dataSources.tableInput['' + checked.pop()];
              //needed because same fields are named different in different places in
              // backend - workaround!
              param = {
                'table': item.tableName,
                'databaseConnection': {
                  'dbUrl': item.databaseConnection.url,
                  'username': item.databaseConnection.username,
                  'password': item.databaseConnection.password,
                  'system': item.databaseConnection.system,
                  'type': 'ConfigurationSettingDatabaseConnection',
                  'id': item.databaseConnection.id
                },
                'type': 'ConfigurationSettingTableInput',
                'id': item.id
              };
              params[i].settings.push(param)
            }
            break;

          case 'ConfigurationRequirementDatabaseConnection':
            checked = activeDataSources.databaseConnection.slice(0);
            for (j = 1; j <= paramNumberOfSettings && checked.length > 0; j++) {
              item = dataSources.databaseConnection['' + checked.pop()];
              //needed because same fields are named different in different places in
              // backend - workaround!
              param = {
                'dbUrl': item.url,
                'username': item.username,
                'password': item.password,
                'system': item.system,
                'type': 'ConfigurationSettingDatabaseConnection',
                'id': item.id
              };
              params[i].settings.push(param)
            }
            break;

          case 'ConfigurationRequirementFileInput':
            checked = activeDataSources.fileInput.slice(0);
            for (j = 1; j <= paramNumberOfSettings && checked.length > 0; j++) {
              item = dataSources.fileInput['' + checked.pop()];
              // needed because same fields are named different in different places in
              // backend - workaround!
              param = {
                'fileName': item.fileName,
                'advanced': false,
                'separatorChar': item.separator,
                'quoteChar': item.quoteChar,
                'escapeChar': item.escapeChar,
                'strictQuotes': item.strictQuotes,
                'ignoreLeadingWhiteSpace': item.ignoreLeadingWhiteSpace,
                'skipLines': item.skipLines,
                'header': item.hasHeader,
                'skipDifferingLines': item.skipDifferingLines,
                'nullValue': item.nullValue,
                'type': 'ConfigurationSettingFileInput',
                'id': item.id
              };
              params[i].settings.push(param)
            }
            break;

          case 'ConfigurationRequirementRelationalInput':
            // add table inputs
            checked = activeDataSources.tableInput.slice(0);
            for (j = 1; j <= paramNumberOfSettings && checked.length > 0; j++) {
              item = dataSources.tableInput['' + checked.pop()];
              //needed because same fields are named different in different places in
              // backend - workaround!
              param = {
                'table': item.tableName,
                'databaseConnection': {
                  'dbUrl': item.databaseConnection.url,
                  'username': item.databaseConnection.username,
                  'password': item.databaseConnection.password,
                  'system': item.databaseConnection.system,
                  'type': 'ConfigurationSettingDatabaseConnection',
                  'id': item.databaseConnection.id
                },
                'type': 'ConfigurationSettingTableInput',
                'id': item.id
              };
              params[i].settings.push(param)
            }
            // add file inputs
            checked = activeDataSources.fileInput.slice(0);
            for (j = 1; j <= paramNumberOfSettings && checked.length > 0; j++) {
              item = dataSources.fileInput['' + checked.pop()];
              //needed because same fields are named different in different places in
              // backend - workaround!
              param = {
                'fileName': item.fileName,
                'advanced': false,
                'separatorChar': item.separator,
                'quoteChar': item.quoteChar,
                'escapeChar': item.escapeChar,
                'strictQuotes': item.strictQuotes,
                'ignoreLeadingWhiteSpace': item.ignoreLeadingWhiteSpace,
                'skipLines': item.skipLines,
                'header': item.hasHeader,
                'skipDifferingLines': item.skipDifferingLines,
                'nullValue': item.nullValue,
                'type': 'ConfigurationSettingFileInput',
                'id': item.id
              };
              params[i].settings.push(param)
            }
            break;

          default:
            $scope.console.error('Parameter Type "' + params[i].type + '" not not supported yet for execution!');
            break;
        }

        // check if required number of parameters are set
        var numberOfSettings = params[i].settings.length;
        if ((params[i].required && params[i].numberOfSettings !== -1 &&
            numberOfSettings !== params[i].numberOfSettings &&
            (numberOfSettings < params[i].minNumberOfSettings ||
             numberOfSettings > params[i].maxNumberOfSettings) ||
             (params[i].required && params[i].numberOfSettings === -1 &&
             numberOfSettings < 1))
        ) {
          throw new WrongParameterError('Wrong value or number for parameter "' + params[i].identifier + '"!')
        }
      }

      return params
    }

    /**
     * Error: the number of parameters is selected.
     * @param message the message of the error
     */
    function WrongParameterError(message) {
      this.name = 'WrongParameterError';
      this.message = (message || '');
    }

    WrongParameterError.prototype = Error.prototype;

    /**
     * Opens a dialog to show the given error message.
     * @param message the error message
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
     * Opens a dialog for showing the file input help when adding/updating a file input.
     */
    function openFileInputHelp() {
      ngDialog.open({
                      template: require('./templates/file-input-help.html'),
                      plain: true,
                      scope: $scope
                    })
    }

    /**
     * Opens dialog for showing the algorithm help when adding/updating an algorithm.
     */
    function openAlgorithmHelp() {
      ngDialog.open({
                      template: require('./templates/algorithm-help.html'),
                      plain: true,
                      scope: $scope
                    })
    }


    // ** EXPORT FUNCTIONS **
    // **********************

    //Exported functions
    $scope.openAlgorithmSettings = openNewAlgorithm;
    $scope.openDatasourceSettings = openNewDatasource;
    $scope.executeAlgorithm = executeAlgorithm;
    $scope.toggleDatasource = toggleDatasource;
    $scope.activateAlgorithm = activateAlgorithm;
    $scope.confirmDelete = confirmDelete;
    $scope.confirmDialog = confirmDialog;
    $scope.editAlgorithm = editAlgorithm;
    $scope.editDatasource = editDatasource;
    $scope.resetAlgorithm = resetAlgorithm;
    $scope.resetDataSources = resetDataSources;
    $scope.openFileInputHelp = openFileInputHelp;
    $scope.openAlgorithmHelp = openAlgorithmHelp;

    //Exports for dialogs
    $scope.doneEditingDatasources = doneEditingDatasources;
    $scope.openError = openError;
    $scope.startSpin = startSpin;
    $scope.stopSpin = stopSpin;
    $scope.initializeAlgorithmList = initializeAlgorithmList;
    $scope.initializeDatasources = initializeDatasources;

    // ** FUNCTION CALLS **
    // ********************

    // Execute initialization
    initializeAlgorithmList();
    initializeDatasources();
    resetParameter();
    getFileSeparator();

  };
