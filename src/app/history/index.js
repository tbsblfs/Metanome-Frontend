import angular from 'angular';
import uirouter from 'angular-ui-router';
import ngDialog from 'ng-dialog';
import 'angular-spinner';

import routing from './history.routes';
import HistoryController from './history.controller';
import backend from '../backend';

export default angular.module('Metanome.history', [uirouter, backend, ngDialog, 'angularSpinner'])
  .config(routing)
  .controller('HistoryController', HistoryController)
  .name;
