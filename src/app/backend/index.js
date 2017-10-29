import angular from 'angular';
import ngResource from 'angular-resource';
import AlgorithmExecutionResource from './algorithm-execution';
import AlgorithmsResource from './algorithms';
import AvailableAlgorithmFilesResource from './availableAlgorithmFiles';
import AvailableInputFilesResource from './availableInputFiles'
import CountResultsResource from './countResults';
import DatasourceResource from './datasource';
import DeleteResource from './delete';
import ExecutionResource from './execution';
import ExecutionsResource from './executions';
import FileResource from './file';
import InputStoreResource from './inputStore';
import LoadResultsResource from './loadResults';
import ParameterResource from './parameter';
import ResultsResource from './results';
import StopExecutionResource from './stopExecution';
import '../scripts/config';

export default angular.module('Metanome.backend', [ngResource, 'Metanome.config'])
  .factory('AlgorithmExecution', AlgorithmExecutionResource)
  .factory('Algorithms', AlgorithmsResource)
  .factory('AvailableAlgorithmFiles', AvailableAlgorithmFilesResource)
  .factory('AvailableInputFiles', AvailableInputFilesResource)
  .factory('CountResults', CountResultsResource)
  .factory('Datasource', DatasourceResource)
  .factory('Delete', DeleteResource)
  .factory('Execution', ExecutionResource)
  .factory('Executions', ExecutionsResource)
  .factory('File', FileResource)
  .factory('InputStore', InputStoreResource)
  .factory('LoadResults', LoadResultsResource)
  .factory('Parameter', ParameterResource)
  .factory('Results', ResultsResource)
  .factory('StopExecution', StopExecutionResource)
  .name;
